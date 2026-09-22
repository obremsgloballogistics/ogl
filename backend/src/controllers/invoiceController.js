const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const Shipment = require('../models/Shipment');
const SiteSettings = require('../models/SiteSettings');
const { createAuditLogEntry } = require('./auditController');
const { generateInvoicePDF, formatCurrency, formatDate } = require('../utils/pdfService');
const { sendInvoicePdfEmail } = require('../utils/emailService');
const { populate } = require('../utils/db');

function round2(num) {
  return Math.round((Number(num) || 0) * 100) / 100;
}

async function generateNextInvoiceNumber() {
  const currentYear = new Date().getFullYear();
  const prefix = `OGL-INV-${currentYear}-`;

  const allInvoices = await Invoice.find();
  const filtered = allInvoices.filter((inv) => inv.invoiceNumber && inv.invoiceNumber.startsWith(prefix));
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const lastInvoice = filtered[0] || null;

  let nextSequence = 1;
  if (lastInvoice && lastInvoice.invoiceNumber) {
    const parts = lastInvoice.invoiceNumber.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) nextSequence = lastSeq + 1;
  } else {
    const totalCount = await Invoice.countDocuments();
    nextSequence = totalCount + 1;
  }

  const formattedSeq = String(nextSequence).padStart(6, '0');
  const candidateNumber = `${prefix}${formattedSeq}`;

  const exists = await Invoice.findOne({ invoiceNumber: candidateNumber });
  if (exists) {
    const timestampSeq = String(Date.now()).slice(-6);
    return `${prefix}${timestampSeq}`;
  }

  return candidateNumber;
}

async function getNextInvoiceNumber(req, res) {
  try {
    const nextNumber = await generateNextInvoiceNumber();
    res.json({ success: true, data: { nextInvoiceNumber: nextNumber } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function listInvoices(req, res) {
  try {
    const { search, status, currency, limit = 100, page = 1 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.paymentStatus = status;
    }

    if (currency && currency !== 'All') {
      query.currency = currency;
    }

    if (search && search.trim()) {
      const allCustomers = await Customer.find();
      const matchingCustomers = allCustomers.filter((c) => {
        const hay = `${c.name} ${c.email} ${c.phone}`.toLowerCase();
        return search.trim().toLowerCase().split(' ').some((term) => hay.includes(term));
      });

      const customerIds = matchingCustomers.map((c) => c._id);

      query.$or = [
        { invoiceNumber: search.trim() },
        { trackingNumber: search.trim() },
        { customer: { $in: customerIds } },
      ];
    }

    let invoices = await Invoice.find(query);
    invoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (Number(limit)) invoices = invoices.slice(0, Number(limit));

    const populated = await populate(invoices, {
      customer: 'name email phone company address country',
      shipment: 'trackingNumber origin destination shippingMethod weight packageType status',
      createdBy: 'name email role',
    });

    const allInvoices = await Invoice.find();
    const metrics = {
      totalInvoices: allInvoices.length,
      totalBilled: allInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
      totalPaid: allInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0),
      totalDue: allInvoices.reduce((sum, inv) => sum + (inv.amountDue || 0), 0),
      countPaid: allInvoices.filter((i) => i.paymentStatus === 'Paid').length,
      countPending: allInvoices.filter((i) => ['Pending', 'Sent', 'Draft'].includes(i.paymentStatus)).length,
      countPartiallyPaid: allInvoices.filter((i) => i.paymentStatus === 'Partially Paid').length,
      countOverdue: allInvoices.filter((i) => i.paymentStatus === 'Overdue').length,
      countCancelled: allInvoices.filter((i) => i.paymentStatus === 'Cancelled').length,
    };

    res.json({ success: true, data: populated, metrics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getInvoice(req, res) {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const populated = await populate(invoice, {
      customer: 'name email phone company address country',
      shipment: 'trackingNumber origin destination shippingMethod weight packageType status',
      createdBy: 'name email role',
    });

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function createInvoice(req, res) {
  try {
    const {
      customerId,
      shipmentId,
      items,
      currency = 'GBP',
      issueDate = new Date(),
      dueDate,
      paymentMethod = 'Bank Transfer',
      shippingFee = 0,
      handlingFee = 0,
      customsFee = 0,
      insuranceFee = 0,
      tax = 0,
      discount = 0,
      notes = '',
      paymentStatus = 'Pending',
      amountPaid = 0,
      customInvoiceNumber,
    } = req.body;

    if (!customerId) {
      return res.status(400).json({ success: false, message: 'Customer is required' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one invoice line item is required' });
    }

    const sanitizedItems = items.map((item) => {
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const unitPrice = Math.max(0, round2(item.unitPrice));
      const amount = round2(quantity * unitPrice);
      return {
        description: (item.description || 'Logistics Service').trim(),
        quantity,
        unitPrice,
        amount,
      };
    });

    const subtotal = round2(sanitizedItems.reduce((acc, it) => acc + it.amount, 0));
    let shipmentForPricing = null;
    if (shipmentId) shipmentForPricing = await Shipment.findById(shipmentId);
    const hasShipmentPricing = shipmentForPricing && Number(shipmentForPricing.shippingCost) >= 0 && shipmentForPricing.shippingPresetSnapshot?.name;
    const cleanShipping = round2(Math.max(0, hasShipmentPricing ? shipmentForPricing.shippingCost : shippingFee));
    const cleanHandling = round2(Math.max(0, hasShipmentPricing ? shipmentForPricing.pricingBreakdown?.handlingFee : handlingFee));
    const cleanCustoms = round2(Math.max(0, hasShipmentPricing ? shipmentForPricing.pricingBreakdown?.customsFee : customsFee));
    const cleanInsurance = round2(Math.max(0, hasShipmentPricing ? shipmentForPricing.pricingBreakdown?.insuranceFee : insuranceFee));
    const cleanTax = round2(Math.max(0, hasShipmentPricing ? shipmentForPricing.pricingBreakdown?.tax : tax));
    const cleanDiscount = round2(Math.max(0, hasShipmentPricing ? shipmentForPricing.pricingBreakdown?.discount : discount));

    const total = round2(Math.max(0, subtotal + cleanShipping + cleanHandling + cleanCustoms + cleanInsurance + cleanTax - cleanDiscount));

    let cleanPaid = 0;
    let cleanDue = total;

    if (paymentStatus === 'Paid') {
      cleanPaid = total;
      cleanDue = 0;
    } else if (paymentStatus === 'Partially Paid') {
      cleanPaid = round2(Math.min(total, Math.max(0, amountPaid)));
      cleanDue = round2(Math.max(0, total - cleanPaid));
    } else {
      cleanPaid = 0;
      cleanDue = total;
    }

    let finalInvoiceNumber = customInvoiceNumber ? customInvoiceNumber.trim() : '';
    if (!finalInvoiceNumber) {
      finalInvoiceNumber = await generateNextInvoiceNumber();
    } else {
      const existing = await Invoice.findOne({ invoiceNumber: finalInvoiceNumber });
      if (existing) {
        return res.status(400).json({ success: false, message: `Invoice number "${finalInvoiceNumber}" is already in use. Please use a unique invoice number.` });
      }
    }

    const siteSettings = await SiteSettings.findOne();
    const companySnapshot = {
      companyName: siteSettings?.companyName || 'OBREMS GLOBAL LOGISTICS',
      logoUrl: siteSettings?.logoUrl || '',
      address: siteSettings?.companyAddress || siteSettings?.officeUk || '123 Logistics Way, London, UK',
      city: siteSettings?.companyCity || 'London',
      country: siteSettings?.companyCountry || 'United Kingdom',
      registrationNumber: siteSettings?.registrationNumber || 'OGL-REG-847291',
      phone: siteSettings?.contactPhone || '+44 7460 554358',
      whatsapp: siteSettings?.contactWhatsApp || '+44 7460 554358',
      email: siteSettings?.billingEmail || siteSettings?.contactEmail || 'billing@obremsgloballogistics.com',
      website: siteSettings?.website || 'https://www.obremsglobal.com',
    };

    const paymentSnapshot = {
      bankName: siteSettings?.paymentSettings?.bankName || 'Barclays Bank UK',
      accountName: siteSettings?.paymentSettings?.accountName || 'OBREMS GLOBAL LOGISTICS LTD',
      accountNumber: siteSettings?.paymentSettings?.accountNumber || '20491823',
      sortCode: siteSettings?.paymentSettings?.sortCode || '20-04-15',
      iban: siteSettings?.paymentSettings?.iban || 'GB29BARC20041520491823',
      swiftBic: siteSettings?.paymentSettings?.swiftBic || 'BARCGB22',
      mobileMoneyName: siteSettings?.paymentSettings?.mobileMoneyName || 'OBREMS LOGISTICS GH',
      mobileMoneyNumber: siteSettings?.paymentSettings?.mobileMoneyNumber || '+233 24 555 9900 (MTN MoMo / Telecel Cash)',
      paymentInstructions: siteSettings?.paymentSettings?.paymentInstructions || 'Please include your Invoice Number as payment reference for fast clearance.',
    };

    let shipmentSnapshot = {};
    let trackingNumber = '';
    if (shipmentId) {
      const shipment = shipmentForPricing || await Shipment.findById(shipmentId);
      if (shipment) {
        trackingNumber = shipment.trackingNumber;
        shipmentSnapshot = {
          trackingNumber: shipment.trackingNumber,
          origin: shipment.origin,
          destination: shipment.destination,
          shippingMethod: shipment.shippingMethod,
          packageDescription: shipment.packageType || '',
          weight: shipment.weight || 0,
          volumeCbm: shipment.volumeCbm || 0,
          currency: shipment.currency || currency,
          shippingCost: shipment.shippingCost || 0,
          shippingPresetId: shipment.shippingPresetId || '',
          shippingPresetSnapshot: shipment.shippingPresetSnapshot || {},
          pricingBreakdown: shipment.pricingBreakdown || {},
        };
      }
    }

    const calculatedDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const invoice = await Invoice.create({
      invoiceNumber: finalInvoiceNumber,
      customer: customerId,
      shipment: shipmentId || null,
      trackingNumber,
      currency: shipmentSnapshot.currency || currency,
      items: sanitizedItems,
      subtotal,
      shippingFee: cleanShipping,
      handlingFee: cleanHandling,
      customsFee: cleanCustoms,
      insuranceFee: cleanInsurance,
      tax: cleanTax,
      discount: cleanDiscount,
      total,
      amountPaid: cleanPaid,
      amountDue: cleanDue,
      issueDate: issueDate ? new Date(issueDate) : new Date(),
      dueDate: calculatedDueDate,
      paymentMethod,
      paymentStatus,
      notes,
      companyDetails: companySnapshot,
      paymentDetails: paymentSnapshot,
      shipmentDetails: shipmentSnapshot,
      createdBy: req.user?._id || null,
    });

    const populated = await populate(invoice, {
      customer: 'name email phone company address country',
      shipment: 'trackingNumber origin destination shippingMethod weight packageType status',
    });

    await createAuditLogEntry({
      user: req.user?._id,
      userName: req.user?.name || 'Administrator',
      userRole: req.user?.role || 'Super Admin',
      action: 'Created Invoice',
      resource: 'Invoice',
      resourceId: invoice._id.toString(),
      details: `Generated Invoice ${invoice.invoiceNumber} for ${customer.name} (${invoice.currency} ${invoice.total.toFixed(2)})`,
      ipAddress: req.ip || '127.0.0.1',
    });

    if (req.body.autoSendEmail || req.body.sendEmail) {
      try {
        const pdfBuffer = await generateInvoicePDF(populated);
        const customerEmail = populated.customer?.email || 'customer@example.com';
        const customerName = populated.customer?.name || 'Valued Customer';

        await sendInvoicePdfEmail({
          to: customerEmail,
          customerName,
          invoiceNumber: populated.invoiceNumber,
          amountDue: formatCurrency(populated.amountDue ?? populated.total, populated.currency),
          dueDate: formatDate(populated.dueDate),
          pdfBuffer,
        });

        if (populated.paymentStatus === 'Draft') {
          populated.paymentStatus = 'Sent';
          await Invoice.findByIdAndUpdate(invoice._id, { paymentStatus: 'Sent' });
        }
      } catch (emailErr) {
        console.error('[Invoice] Auto-email delivery notice:', emailErr.message);
      }
    }

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('[INVOICE] createInvoice error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

async function updateInvoice(req, res) {
  try {
    const existing = await Invoice.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const {
      items,
      currency,
      issueDate,
      dueDate,
      paymentMethod,
      shippingFee,
      handlingFee,
      customsFee,
      insuranceFee,
      tax,
      discount,
      notes,
      paymentStatus,
      amountPaid,
      customerId,
      shipmentId,
    } = req.body;

    const sanitizedItems = (items || existing.items).map((item) => {
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const unitPrice = Math.max(0, round2(item.unitPrice));
      const amount = round2(quantity * unitPrice);
      return {
        description: (item.description || 'Logistics Service').trim(),
        quantity,
        unitPrice,
        amount,
      };
    });

    const subtotal = round2(sanitizedItems.reduce((acc, it) => acc + it.amount, 0));
    const cleanShipping = round2(Math.max(0, shippingFee !== undefined ? shippingFee : existing.shippingFee));
    const cleanHandling = round2(Math.max(0, handlingFee !== undefined ? handlingFee : existing.handlingFee));
    const cleanCustoms = round2(Math.max(0, customsFee !== undefined ? customsFee : existing.customsFee));
    const cleanInsurance = round2(Math.max(0, insuranceFee !== undefined ? insuranceFee : existing.insuranceFee));
    const cleanTax = round2(Math.max(0, tax !== undefined ? tax : existing.tax));
    const cleanDiscount = round2(Math.max(0, discount !== undefined ? discount : existing.discount));

    const total = round2(Math.max(0, subtotal + cleanShipping + cleanHandling + cleanCustoms + cleanInsurance + cleanTax - cleanDiscount));

    const targetStatus = paymentStatus || existing.paymentStatus;
    let cleanPaid = existing.amountPaid;
    let cleanDue = total;

    if (targetStatus === 'Paid') {
      cleanPaid = total;
      cleanDue = 0;
    } else if (targetStatus === 'Partially Paid') {
      const givenPaid = amountPaid !== undefined ? amountPaid : existing.amountPaid;
      cleanPaid = round2(Math.min(total, Math.max(0, givenPaid)));
      cleanDue = round2(Math.max(0, total - cleanPaid));
    } else {
      cleanPaid = 0;
      cleanDue = total;
    }

    const updates = {
      items: sanitizedItems,
      currency: currency || existing.currency,
      subtotal,
      shippingFee: cleanShipping,
      handlingFee: cleanHandling,
      customsFee: cleanCustoms,
      insuranceFee: cleanInsurance,
      tax: cleanTax,
      discount: cleanDiscount,
      total,
      amountPaid: cleanPaid,
      amountDue: cleanDue,
      issueDate: issueDate ? new Date(issueDate) : existing.issueDate,
      dueDate: dueDate ? new Date(dueDate) : existing.dueDate,
      paymentMethod: paymentMethod || existing.paymentMethod,
      paymentStatus: targetStatus,
      notes: notes !== undefined ? notes : existing.notes,
    };

    if (customerId) updates.customer = customerId;
    if (shipmentId !== undefined) updates.shipment = shipmentId || null;

    const updated = await Invoice.findByIdAndUpdate(req.params.id, updates, { new: true });

    const populated = await populate(updated, {
      customer: 'name email phone company address country',
      shipment: 'trackingNumber origin destination shippingMethod weight packageType status',
    });

    await createAuditLogEntry({
      user: req.user?._id,
      userName: req.user?.name || 'Administrator',
      userRole: req.user?.role || 'Super Admin',
      action: 'Updated Invoice',
      resource: 'Invoice',
      resourceId: updated._id.toString(),
      details: `Updated details and totals for Invoice ${updated.invoiceNumber}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function updatePaymentStatus(req, res) {
  try {
    const { paymentStatus, amountPaid } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    invoice.paymentStatus = paymentStatus || invoice.paymentStatus;

    if (invoice.paymentStatus === 'Paid') {
      invoice.amountPaid = invoice.total;
      invoice.amountDue = 0;
    } else if (invoice.paymentStatus === 'Partially Paid') {
      const paid = round2(Math.min(invoice.total, Math.max(0, Number(amountPaid) || 0)));
      invoice.amountPaid = paid;
      invoice.amountDue = round2(Math.max(0, invoice.total - paid));
    } else if (['Draft', 'Pending', 'Sent'].includes(invoice.paymentStatus)) {
      invoice.amountPaid = 0;
      invoice.amountDue = invoice.total;
    }

    await Invoice.findByIdAndUpdate(req.params.id, {
      paymentStatus: invoice.paymentStatus,
      amountPaid: invoice.amountPaid,
      amountDue: invoice.amountDue,
    });

    const populated = await populate(invoice, {
      customer: 'name email phone company address country',
      shipment: 'trackingNumber origin destination shippingMethod weight packageType status',
    });

    await createAuditLogEntry({
      user: req.user?._id,
      userName: req.user?.name || 'Administrator',
      userRole: req.user?.role || 'Super Admin',
      action: `Marked Invoice as ${invoice.paymentStatus}`,
      resource: 'Invoice',
      resourceId: invoice._id.toString(),
      details: `Changed payment status of ${invoice.invoiceNumber} to "${invoice.paymentStatus}" (Paid: ${invoice.currency} ${invoice.amountPaid}, Due: ${invoice.currency} ${invoice.amountDue})`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function deleteInvoice(req, res) {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const invNumber = invoice.invoiceNumber;
    await Invoice.findByIdAndDelete(req.params.id);

    await createAuditLogEntry({
      user: req.user?._id,
      userName: req.user?.name || 'Administrator',
      userRole: req.user?.role || 'Super Admin',
      action: 'Deleted Invoice',
      resource: 'Invoice',
      resourceId: req.params.id,
      details: `Permanently removed Invoice ${invNumber}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({ success: true, message: `Invoice ${invNumber} deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getInvoicePdf(req, res) {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const populated = await populate(invoice, {
      customer: 'name email phone company address country',
      shipment: 'trackingNumber origin destination shippingMethod weight packageType status',
    });

    const pdfBuffer = await generateInvoicePDF(populated);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ success: false, message: 'Failed to generate invoice PDF' });
  }
}

async function sendInvoiceEmail(req, res) {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const populated = await populate(invoice, {
      customer: 'name email phone company address country',
      shipment: 'trackingNumber origin destination shippingMethod weight packageType status',
    });

    if (populated.paymentStatus === 'Draft') {
      populated.paymentStatus = 'Sent';
      await Invoice.findByIdAndUpdate(req.params.id, { paymentStatus: 'Sent' });
    }

    const customerEmail = populated.customer?.email || 'customer@example.com';
    const customerName = populated.customer?.name || 'Valued Customer';

    const pdfBuffer = await generateInvoicePDF(populated);

    await sendInvoicePdfEmail({
      to: customerEmail,
      customerName,
      invoiceNumber: populated.invoiceNumber,
      amountDue: formatCurrency(populated.amountDue ?? populated.total, populated.currency),
      dueDate: formatDate(populated.dueDate),
      pdfBuffer,
    });

    await createAuditLogEntry({
      user: req.user?._id,
      userName: req.user?.name || 'Administrator',
      userRole: req.user?.role || 'Super Admin',
      action: 'Sent Invoice Email',
      resource: 'Invoice',
      resourceId: invoice._id.toString(),
      details: `Dispatched electronic invoice ${populated.invoiceNumber} with attached PDF to ${customerName} (${customerEmail})`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({
      success: true,
      message: `Invoice ${populated.invoiceNumber} with PDF attachment has been successfully sent to ${customerEmail}.`,
      data: {
        invoiceNumber: populated.invoiceNumber,
        recipient: customerEmail,
        amountDue: `${populated.currency} ${(populated.amountDue ?? populated.total).toFixed(2)}`,
        dueDate: populated.dueDate,
        sentAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error sending invoice email:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to dispatch invoice email' });
  }
}

async function logInvoiceClientAction(req, res) {
  try {
    const { action = 'Downloaded Invoice PDF' } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    await createAuditLogEntry({
      user: req.user?._id,
      userName: req.user?.name || 'Administrator',
      userRole: req.user?.role || 'Super Admin',
      action: action,
      resource: 'Invoice',
      resourceId: invoice._id.toString(),
      details: `${action} for Invoice ${invoice.invoiceNumber}`,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({ success: true, message: 'Action logged' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  listInvoices,
  getNextInvoiceNumber,
  getInvoice,
  getInvoicePdf,
  createInvoice,
  updateInvoice,
  updatePaymentStatus,
  deleteInvoice,
  sendInvoiceEmail,
  logInvoiceClientAction,
};
