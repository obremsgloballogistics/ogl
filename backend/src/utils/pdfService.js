const PDFDocument = require('pdfkit');
const path = require('path');

const LOGO_PATH = path.resolve(__dirname, '../../../frontend/public/ogllogo-removebg-preview.png');

// Helper to format currency
function formatCurrency(amount, currency = 'GBP') {
  const val = Number(amount) || 0;
  let symbol = '£';
  if (currency === 'USD') symbol = '$';
  else if (currency === 'GHS') symbol = 'GH₵ ';
  else if (currency === 'EUR') symbol = '€';
  return `${symbol}${val.toFixed(2)}`;
}

// Helper to format dates like '14 Aug 2026'
function formatDate(dateInput) {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '-';
  const day = d.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function amountInWords(value, currency = 'GBP') {
  const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const underThousand = (number) => {
    if (number < 20) return ones[number];
    if (number < 100) return `${tens[Math.floor(number / 10)]}${number % 10 ? `-${ones[number % 10]}` : ''}`;
    return `${ones[Math.floor(number / 100)]} hundred${number % 100 ? ` and ${underThousand(number % 100)}` : ''}`;
  };
  const absolute = Math.abs(Number(value) || 0);
  const whole = Math.floor(absolute);
  const minor = Math.round((absolute - whole) * 100);
  const majorName = currency === 'GHS' ? 'Ghanaian cedis' : currency === 'USD' ? 'dollars' : currency === 'EUR' ? 'euros' : 'pounds';
  const minorName = currency === 'GBP' ? 'pence' : 'cents';
  const words = whole < 1000 ? underThousand(whole) : `${underThousand(Math.floor(whole / 1000))} thousand${whole % 1000 ? ` ${underThousand(whole % 1000)}` : ''}`;
  return `${words} ${majorName}${minor ? ` and ${underThousand(minor)} ${minorName}` : ''}`;
}

/**
 * Generates a PDF buffer for an Invoice document matching the corporate OGL template
 * @param {Object} invoice - Populated invoice document
 * @returns {Promise<Buffer>}
 */
function generateInvoicePDF(invoice) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Invoice ${invoice.invoiceNumber}`,
          Author: 'OBREMS GLOBAL LOGISTICS',
          Subject: `Invoice ${invoice.invoiceNumber}`,
        },
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const currency = invoice.currency || 'GBP';
      const company = invoice.companyDetails || {};
      const payment = invoice.paymentDetails || {};
      const customer = invoice.customer || {};

      const leftX = 40;
      const rightX = 555;
      const contentWidth = rightX - leftX;

      // ----------------------------------------------------
      // 1. HEADER SECTION
      // ----------------------------------------------------
      // Hardcoded OGL brand image shared with the website.
      doc.image(LOGO_PATH, leftX, 40, { fit: [95, 95], align: 'center', valign: 'center' });

      // Right: INVOICE Title and Company Details
      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(24).text('INVOICE', 300, 40, {
        width: 255,
        align: 'right',
      });

      let currentCompanyY = 75;
      doc.fillColor('#1E293B').font('Helvetica-Bold').fontSize(10).text(company.companyName || 'Obrems Global logistics', 300, currentCompanyY, {
        width: 255,
        align: 'right',
      });

      doc.fillColor('#64748B').font('Helvetica').fontSize(9);
      const companyAddress1 = company.address ? company.address.split(',')[0] : 'Milton Keynes';
      const companyAddress2 = company.city || 'Milton Keynes';
      const companyCountry = company.country || 'United Kingdom';
      const regNo = company.registrationNumber || '17094775';
      const contactPerson = 'Esther Mensah';
      const phone = company.phone || '+447460 554358';
      const email = company.email || 'obremsgloballogistics@gmail.com';

      currentCompanyY += 13;
      doc.text(companyAddress1, 300, currentCompanyY, { width: 255, align: 'right' });
      currentCompanyY += 12;
      doc.text(companyAddress2, 300, currentCompanyY, { width: 255, align: 'right' });
      currentCompanyY += 12;
      doc.text(companyCountry, 300, currentCompanyY, { width: 255, align: 'right' });
      currentCompanyY += 12;
      doc.text(`Co. Reg. No.: ${regNo}`, 300, currentCompanyY, { width: 255, align: 'right' });
      currentCompanyY += 15;
      doc.text(contactPerson, 300, currentCompanyY, { width: 255, align: 'right' });
      currentCompanyY += 12;
      doc.text(phone, 300, currentCompanyY, { width: 255, align: 'right' });
      currentCompanyY += 12;
      doc.text(email, 300, currentCompanyY, { width: 255, align: 'right' });

      // ----------------------------------------------------
      // 2. BILL TO & METADATA SECTION
      // ----------------------------------------------------
      const billToY = 205;

      // Left Column: BILL TO
      doc.fillColor('#1E293B').font('Helvetica-Bold').fontSize(10).text('BILL TO', leftX, billToY);

      doc.fillColor('#334155').font('Helvetica').fontSize(9.5);
      let customerY = billToY + 14;
      doc.text(customer.name || 'Valued Customer', leftX, customerY);

      const custAddr = customer.address || 'Accra, Ghana';
      const addrLines = custAddr.split(',').map((s) => s.trim()).filter(Boolean);
      addrLines.forEach((line) => {
        customerY += 12;
        doc.text(line, leftX, customerY);
      });
      if (customer.country && !custAddr.includes(customer.country)) {
        customerY += 12;
        doc.text(customer.country, leftX, customerY);
      }

      // Right Column: INVOICE METADATA
      const metaLabelX = 350;
      const metaValueX = 460;
      const metaValueWidth = 95;
      let metaY = billToY;

      doc.font('Helvetica').fontSize(9.5).fillColor('#64748B').text('Invoice No.:', metaLabelX, metaY);
      doc.font('Helvetica-Bold').fillColor('#1E293B').text(invoice.invoiceNumber, metaValueX, metaY, { width: metaValueWidth, align: 'right' });

      metaY += 15;
      doc.font('Helvetica').fillColor('#64748B').text('Issue date:', metaLabelX, metaY);
      doc.font('Helvetica-Bold').fillColor('#1E293B').text(formatDate(invoice.issueDate), metaValueX, metaY, { width: metaValueWidth, align: 'right' });

      metaY += 15;
      doc.font('Helvetica').fillColor('#64748B').text('Due date:', metaLabelX, metaY);
      doc.font('Helvetica-Bold').fillColor('#1E293B').text(formatDate(invoice.dueDate), metaValueX, metaY, { width: metaValueWidth, align: 'right' });

      metaY += 22;
      doc.font('Helvetica').fillColor('#64748B').text('Payment method:', metaLabelX, metaY);
      doc.font('Helvetica-Bold').fillColor('#1E293B').text(invoice.paymentMethod || 'Bank Transfer', metaValueX, metaY, { width: metaValueWidth, align: 'right' });

      // ----------------------------------------------------
      // 3. LINE ITEMS TABLE
      // ----------------------------------------------------
      const tableTopY = 310;
      const headerHeight = 26;

      // Table Header Bar (#7B8BFA / Periwinkle Blue)
      doc.rect(leftX, tableTopY, contentWidth, headerHeight).fill('#7B8BFA');

      // Header Labels
      doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(9);
      doc.text('DESCRIPTION', leftX + 12, tableTopY + 8);
      doc.text('QUANTITY', 320, tableTopY + 8, { width: 60, align: 'center' });
      doc.text(`UNIT PRICE (${currency === 'GBP' ? '£' : currency})`, 385, tableTopY + 8, { width: 80, align: 'right' });
      doc.text(`AMOUNT (${currency === 'GBP' ? '£' : currency})`, 470, tableTopY + 8, { width: 75, align: 'right' });

      // Line Items Rows
      let itemY = tableTopY + headerHeight + 14;
      const items = invoice.items || [];

      items.forEach((item) => {
        const descParts = item.description.split(/(\(.*?\))/g).filter(Boolean);
        const mainDesc = descParts[0] ? descParts[0].trim() : item.description;
        const subNote = descParts.length > 1 ? descParts.slice(1).join(' ').replace(/[()]/g, '').trim() : '';

        // Main description
        doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#1E293B').text(mainDesc, leftX + 12, itemY, { width: 290 });

        // Quantity
        doc.font('Helvetica').fontSize(9.5).fillColor('#334155').text(String(item.quantity || 1), 320, itemY, { width: 60, align: 'center' });

        // Unit Price
        doc.text((item.unitPrice || 0).toFixed(2), 385, itemY, { width: 80, align: 'right' });

        // Amount
        doc.text((item.amount || 0).toFixed(2), 470, itemY, { width: 75, align: 'right' });

        itemY += 14;

        if (subNote) {
          doc.font('Helvetica').fontSize(8.5).fillColor('#64748B').text(subNote, leftX + 12, itemY, { width: 290 });
          itemY += 14;
        }

        itemY += 10;
      });

      // Additional fees if present (handling, shipping, etc.)
      if (invoice.shippingFee > 0) {
        doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#1E293B').text('Shipping Fee', leftX + 12, itemY, { width: 290 });
        doc.font('Helvetica').fontSize(9.5).fillColor('#334155').text('1', 320, itemY, { width: 60, align: 'center' });
        doc.text(invoice.shippingFee.toFixed(2), 385, itemY, { width: 80, align: 'right' });
        doc.text(invoice.shippingFee.toFixed(2), 470, itemY, { width: 75, align: 'right' });
        itemY += 22;
      }

      if (invoice.handlingFee > 0) {
        doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#1E293B').text('Packaging/Handling fee', leftX + 12, itemY, { width: 290 });
        doc.font('Helvetica').fontSize(9.5).fillColor('#334155').text('1', 320, itemY, { width: 60, align: 'center' });
        doc.text(invoice.handlingFee.toFixed(2), 385, itemY, { width: 80, align: 'right' });
        doc.text(invoice.handlingFee.toFixed(2), 470, itemY, { width: 75, align: 'right' });
        itemY += 22;
      }

      if (invoice.customsFee > 0) {
        doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#1E293B').text('Customs Clearance Fee', leftX + 12, itemY, { width: 290 });
        doc.font('Helvetica').fontSize(9.5).fillColor('#334155').text('1', 320, itemY, { width: 60, align: 'center' });
        doc.text(invoice.customsFee.toFixed(2), 385, itemY, { width: 80, align: 'right' });
        doc.text(invoice.customsFee.toFixed(2), 470, itemY, { width: 75, align: 'right' });
        itemY += 22;
      }

      // ----------------------------------------------------
      // 4. PAYMENT DETAILS & TOTALS SECTION
      // ----------------------------------------------------
      const bottomSectionY = Math.max(itemY + 25, 470);

      // LEFT: PAYMENT DETAILS
      doc.fillColor('#1E293B').font('Helvetica-Bold').fontSize(9.5).text('PAYMENT DETAILS', leftX + 12, bottomSectionY);

      let payY = bottomSectionY + 14;
      doc.fillColor('#334155').font('Helvetica').fontSize(9);
      doc.text(`Name: ${payment.accountName || 'OBREMS GLOBAL LOGISTICS LTD'}`, leftX + 12, payY);
      payY += 13;
      doc.text(`Account number: ${payment.accountNumber || '12419039'}`, leftX + 12, payY);
      payY += 13;
      doc.text(`Sort code: ${payment.sortCode || '04-00-06'}`, leftX + 12, payY);

      if (payment.iban) {
        payY += 13;
        doc.text(`IBAN: ${payment.iban}`, leftX + 12, payY);
      }
      if (payment.mobileMoneyNumber) {
        payY += 13;
        doc.text(`MoMo: ${payment.mobileMoneyNumber}`, leftX + 12, payY);
      }

      // RIGHT: TOTALS
      const totalsBoxX = 280;
      const totalsWidth = rightX - totalsBoxX;

      // Divider line above TOTAL
      doc.moveTo(totalsBoxX, bottomSectionY - 5).lineTo(rightX, bottomSectionY - 5).lineWidth(1.2).stroke('#1E293B');

      // Subtotal / Total Line
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#1E293B');
      doc.text(`TOTAL (${currency}):`, totalsBoxX, bottomSectionY + 4);
      doc.text(formatCurrency(invoice.total, currency), totalsBoxX, bottomSectionY + 4, { width: totalsWidth, align: 'right' });

      // Blue prominent divider line
      const dueY = bottomSectionY + 30;
      doc.moveTo(totalsBoxX, dueY - 6).lineTo(rightX, dueY - 6).lineWidth(2).stroke('#3B82F6');

      // TOTAL DUE (Large bold)
      doc.font('Helvetica-Bold').fontSize(15).fillColor('#0F172A');
      doc.text(`TOTAL DUE (${currency})`, totalsBoxX, dueY);
      doc.text(formatCurrency(invoice.amountDue ?? invoice.total, currency), totalsBoxX, dueY, { width: totalsWidth, align: 'right' });
      doc.font('Helvetica-Oblique').fontSize(8.5).fillColor('#64748B').text(`Amount in words: ${amountInWords(invoice.amountDue ?? invoice.total, currency)}`, totalsBoxX, dueY + 20, { width: totalsWidth, align: 'right' });
      if (invoice.shipmentDetails?.shippingPresetSnapshot?.name) {
        doc.font('Helvetica').fontSize(8.5).fillColor('#334155').text(`Shipping service: ${invoice.shipmentDetails.shippingPresetSnapshot.name}`, leftX + 12, dueY + 18);
        doc.text(`Pricing: ${invoice.shipmentDetails.shippingPresetSnapshot.pricingMethod} @ ${formatCurrency(invoice.shipmentDetails.shippingPresetSnapshot.rate, currency)}`, leftX + 12, dueY + 30);
      }

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generateInvoicePDF,
  formatCurrency,
  formatDate,
  amountInWords,
};
