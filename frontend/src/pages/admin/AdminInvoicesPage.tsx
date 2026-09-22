import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Filter,
  Download,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  X,
  FileText,
  DollarSign,
  Calendar,
  Send,
  Printer,
  Edit3,
  Globe,
  Truck,
  Building,
  Check,
  CreditCard,
  Phone,
  Mail,
  Smartphone,
  Landmark,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import api from '../../services/api';

// Currency formatting helper
const formatCurrency = (amount: number | string | undefined, currencyCode: string = 'GBP') => {
  const val = Number(amount) || 0;
  let symbol = '£';
  if (currencyCode === 'USD') symbol = '$';
  else if (currencyCode === 'GHS') symbol = 'GH₵ ';
  else if (currencyCode === 'EUR') symbol = '€';
  else if (currencyCode === 'CNY') symbol = '¥';
  return `${symbol}${val.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Date formatting helper (e.g. '14 Aug 2026')
const formatDate = (dateInput?: string | Date) => {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '-';
  const day = d.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
};

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    company?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  shipment?: {
    _id: string;
    trackingNumber: string;
    origin: string;
    destination: string;
    shippingMethod: string;
    weight?: number;
    packageType?: string;
    status?: string;
  };
  trackingNumber?: string;
  currency: string;
  items: InvoiceItem[];
  subtotal: number;
  shippingFee: number;
  handlingFee: number;
  customsFee: number;
  insuranceFee: number;
  tax: number;
  discount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  issueDate: string;
  dueDate: string;
  paymentMethod: string;
  paymentStatus: 'Draft' | 'Sent' | 'Pending' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Cancelled';
  notes?: string;
  companyDetails?: {
    companyName: string;
    logoUrl?: string;
    address: string;
    city: string;
    country: string;
    registrationNumber: string;
    phone: string;
    whatsapp: string;
    email: string;
    website: string;
  };
  paymentDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    sortCode: string;
    iban?: string;
    swiftBic?: string;
    mobileMoneyName?: string;
    mobileMoneyNumber?: string;
    paymentInstructions?: string;
  };
  shipmentDetails?: {
    trackingNumber?: string;
    origin?: string;
    destination?: string;
    shippingMethod?: string;
    packageDescription?: string;
    weight?: number;
  };
  createdAt: string;
}

interface CustomerOption {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address?: string;
  country?: string;
}

interface ShipmentOption {
  _id: string;
  trackingNumber: string;
  customer: any;
  origin: string;
  destination: string;
  shippingMethod: string;
  weight?: number;
  packageType?: string;
  shippingCost?: number;
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [shipments, setShipments] = useState<ShipmentOption[]>([]);
  const [businessSettings, setBusinessSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState<{ text: string; type?: 'success' | 'info' | 'error' } | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusTargetInvoice, setStatusTargetInvoice] = useState<Invoice | null>(null);
  const [partialPaymentAmount, setPartialPaymentAmount] = useState<string>('');
  const [newStatusSelection, setNewStatusSelection] = useState<string>('Paid');

  // Form State
  const [formInvoiceNumber, setFormInvoiceNumber] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedShipmentId, setSelectedShipmentId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [trackingSearch, setTrackingSearch] = useState('');
  const [formCurrency, setFormCurrency] = useState<'GBP' | 'GHS' | 'CNY' | 'USD' | 'EUR'>('GBP');
  const [formIssueDate, setFormIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDueDate, setFormDueDate] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState('Bank Transfer');
  const [formPaymentStatus, setFormPaymentStatus] = useState<string>('Pending');
  const [formItems, setFormItems] = useState<InvoiceItem[]>([
    { description: 'Air Freight Shipment UK-Ghana (New Laptop x1)', quantity: 1, unitPrice: 55, amount: 55 },
    { description: 'Packaging/Handling Fee', quantity: 1, unitPrice: 0, amount: 0 },
  ]);
  const [formShippingFee, setFormShippingFee] = useState<number>(0);
  const [formHandlingFee, setFormHandlingFee] = useState<number>(0);
  const [formCustomsFee, setFormCustomsFee] = useState<number>(0);
  const [formInsuranceFee, setFormInsuranceFee] = useState<number>(0);
  const [formTax, setFormTax] = useState<number>(0);
  const [formDiscount, setFormDiscount] = useState<number>(0);
  const [formNotes, setFormNotes] = useState('Thank you for choosing OBREMS GLOBAL LOGISTICS. Please use your invoice number as the payment reference.');
  const [formAutoSendEmail, setFormAutoSendEmail] = useState<boolean>(true);

  const printRef = useRef<HTMLDivElement>(null);

  const triggerToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, custRes, shipRes, setRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/customers'),
        api.get('/shipments'),
        api.get('/settings'),
      ]);

      if (invRes.data?.data) setInvoices(invRes.data.data);
      if (custRes.data?.data) setCustomers(custRes.data.data);
      if (shipRes.data?.data) setShipments(shipRes.data.data);
      if (setRes.data?.data) setBusinessSettings(setRes.data.data);
    } catch (err: any) {
      console.error('Failed to load invoice hub data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch auto-generated next invoice number
  const loadNextNumber = async () => {
    try {
      const res = await api.get('/invoices/next-number');
      if (res.data?.data?.nextInvoiceNumber) {
        setFormInvoiceNumber(res.data.data.nextInvoiceNumber);
      }
    } catch {
      setFormInvoiceNumber(`OGL-INV-2026-${String(invoices.length + 1).padStart(6, '0')}`);
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingInvoiceId(null);
    loadNextNumber();

    // Default dates
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 14);

    setFormIssueDate(today.toISOString().split('T')[0]);
    setFormDueDate(dueDate.toISOString().split('T')[0]);
    setSelectedCustomerId(customers[0]?._id || '');
    setSelectedShipmentId('');
    setCustomerSearch('');
    setTrackingSearch('');
    setFormCurrency('GBP');
    setFormPaymentMethod('Bank Transfer');
    setFormPaymentStatus('Pending');
    setFormItems([
      { description: 'Air Freight Shipment UK-Ghana', quantity: 1, unitPrice: 55, amount: 55 },
      { description: 'Packaging/Handling Fee', quantity: 1, unitPrice: 0, amount: 0 },
    ]);
    setFormShippingFee(0);
    setFormHandlingFee(0);
    setFormCustomsFee(0);
    setFormInsuranceFee(0);
    setFormTax(0);
    setFormDiscount(0);
    setFormNotes('Thank you for choosing OBREMS GLOBAL LOGISTICS. Shipment will proceed upon payment confirmation.');
    setShowCreateModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (inv: Invoice) => {
    setIsEditing(true);
    setEditingInvoiceId(inv._id);
    setFormInvoiceNumber(inv.invoiceNumber);
    setSelectedCustomerId(inv.customer?._id || '');
    setSelectedShipmentId(inv.shipment?._id || '');
    setCustomerSearch(inv.customer?.name || '');
    setTrackingSearch(inv.shipment?.trackingNumber || '');
    setFormCurrency((inv.currency as any) || 'GBP');
    setFormIssueDate(inv.issueDate ? new Date(inv.issueDate).toISOString().split('T')[0] : '');
    setFormDueDate(inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '');
    setFormPaymentMethod(inv.paymentMethod || 'Bank Transfer');
    setFormPaymentStatus(inv.paymentStatus || 'Pending');
    setFormItems(
      inv.items && inv.items.length > 0
        ? inv.items.map((it) => ({ ...it }))
        : [{ description: 'Freight Service', quantity: 1, unitPrice: inv.total || 0, amount: inv.total || 0 }]
    );
    setFormShippingFee(inv.shippingFee || 0);
    setFormHandlingFee(inv.handlingFee || 0);
    setFormCustomsFee(inv.customsFee || 0);
    setFormInsuranceFee(inv.insuranceFee || 0);
    setFormTax(inv.tax || 0);
    setFormDiscount(inv.discount || 0);
    setFormNotes(inv.notes || '');
    setShowCreateModal(true);
  };

  // When shipment selected in form, auto-fill customer and details
  const handleShipmentChange = (shipmentId: string) => {
    setSelectedShipmentId(shipmentId);
    if (!shipmentId) return;

    const ship = shipments.find((s) => s._id === shipmentId);
    if (ship) {
      if (ship.customer?._id || typeof ship.customer === 'string') {
        const custId = typeof ship.customer === 'object' ? ship.customer._id : ship.customer;
        setSelectedCustomerId(custId);
      }
      if (ship.shippingCost && formItems.length > 0) {
        const updated = [...formItems];
        updated[0] = {
          description: `${ship.shippingMethod || 'Freight'} Shipment (${ship.origin} → ${ship.destination}) - Tracking: ${ship.trackingNumber}`,
          quantity: 1,
          unitPrice: Number(ship.shippingCost) || 0,
          amount: Number(ship.shippingCost) || 0,
        };
        setFormItems(updated);
      }
    }
  };

  // Line item handlers
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const nextItems = [...formItems];
    const item = { ...nextItems[index] };

    if (field === 'quantity') {
      item.quantity = Math.max(1, parseInt(value, 10) || 1);
      item.amount = Math.round(item.quantity * item.unitPrice * 100) / 100;
    } else if (field === 'unitPrice') {
      item.unitPrice = Math.max(0, parseFloat(value) || 0);
      item.amount = Math.round(item.quantity * item.unitPrice * 100) / 100;
    } else if (field === 'description') {
      item.description = value;
    }

    nextItems[index] = item;
    setFormItems(nextItems);
  };

  const handleAddItem = () => {
    setFormItems([...formItems, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (formItems.length <= 1) {
      triggerToast('Invoice must contain at least one line item.', 'error');
      return;
    }
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  // Calculations
  const calculatedSubtotal = formItems.reduce((acc, it) => acc + (it.amount || 0), 0);
  const calculatedTotal = Math.max(
    0,
    calculatedSubtotal +
      Number(formShippingFee || 0) +
      Number(formHandlingFee || 0) +
      Number(formCustomsFee || 0) +
      Number(formInsuranceFee || 0) +
      Number(formTax || 0) -
      Number(formDiscount || 0)
  );

  // Submit Invoice Form
  const handleSubmitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      triggerToast('Please select a customer for this invoice.', 'error');
      return;
    }

    if (formItems.some((it) => !it.description.trim())) {
      triggerToast('Please enter a description for all line items.', 'error');
      return;
    }

    const payload = {
      customInvoiceNumber: formInvoiceNumber.trim(),
      customerId: selectedCustomerId,
      shipmentId: selectedShipmentId || null,
      currency: formCurrency,
      issueDate: formIssueDate,
      dueDate: formDueDate || formIssueDate,
      paymentMethod: formPaymentMethod,
      paymentStatus: formPaymentStatus,
      items: formItems,
      shippingFee: Number(formShippingFee) || 0,
      handlingFee: Number(formHandlingFee) || 0,
      customsFee: Number(formCustomsFee) || 0,
      insuranceFee: Number(formInsuranceFee) || 0,
      tax: Number(formTax) || 0,
      discount: Number(formDiscount) || 0,
      notes: formNotes,
      autoSendEmail: formAutoSendEmail,
    };

    try {
      if (isEditing && editingInvoiceId) {
        const res = await api.put(`/invoices/${editingInvoiceId}`, payload);
        if (res.data?.data) {
          setInvoices(invoices.map((inv) => (inv._id === editingInvoiceId ? res.data.data : inv)));
          triggerToast(`Invoice ${res.data.data.invoiceNumber} updated successfully!`);
          if (previewInvoice?._id === editingInvoiceId) setPreviewInvoice(res.data.data);
        }
      } else {
        const res = await api.post('/invoices', payload);
        if (res.data?.data) {
          setInvoices([res.data.data, ...invoices]);
          triggerToast(
            formAutoSendEmail
              ? `Invoice ${res.data.data.invoiceNumber} created & PDF emailed to customer!`
              : `Invoice ${res.data.data.invoiceNumber} created successfully!`
          );
          setPreviewInvoice(res.data.data);
        }
      }
      setShowCreateModal(false);
    } catch (err: any) {
      triggerToast(err?.response?.data?.message || 'Failed to save invoice', 'error');
    }
  };

  // Delete invoice
  const handleDeleteInvoice = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice? This will be permanently recorded in the audit log.')) {
      return;
    }
    try {
      await api.delete(`/invoices/${id}`);
      setInvoices(invoices.filter((i) => i._id !== id));
      if (previewInvoice?._id === id) setPreviewInvoice(null);
      triggerToast('Invoice deleted and recorded in audit log.');
    } catch (err: any) {
      triggerToast(err?.response?.data?.message || 'Failed to delete invoice', 'error');
    }
  };

  // Send Invoice Email
  const handleSendInvoiceEmail = async (inv: Invoice) => {
    try {
      triggerToast(`Generating PDF and emailing Invoice ${inv.invoiceNumber} to ${inv.customer?.email || 'customer'}...`, 'info');
      const res = await api.post(`/invoices/${inv._id}/send`);
      triggerToast(res.data?.message || `Invoice ${inv.invoiceNumber} sent successfully!`);

      // Update status locally
      setInvoices(
        invoices.map((i) => (i._id === inv._id ? { ...i, paymentStatus: i.paymentStatus === 'Draft' ? 'Sent' : i.paymentStatus } : i))
      );
      if (previewInvoice?._id === inv._id) {
        setPreviewInvoice({ ...previewInvoice, paymentStatus: previewInvoice.paymentStatus === 'Draft' ? 'Sent' : previewInvoice.paymentStatus });
      }
    } catch (err: any) {
      triggerToast(err?.response?.data?.message || 'Failed to dispatch invoice email', 'error');
    }
  };

  // Update Payment Status
  const handleUpdateStatusSubmit = async () => {
    if (!statusTargetInvoice) return;
    try {
      const res = await api.patch(`/invoices/${statusTargetInvoice._id}/status`, {
        paymentStatus: newStatusSelection,
        amountPaid: newStatusSelection === 'Partially Paid' ? Number(partialPaymentAmount) || 0 : undefined,
      });

      if (res.data?.data) {
        setInvoices(invoices.map((i) => (i._id === statusTargetInvoice._id ? res.data.data : i)));
        if (previewInvoice?._id === statusTargetInvoice._id) {
          setPreviewInvoice(res.data.data);
        }
        triggerToast(`Status updated to "${newStatusSelection}" for ${statusTargetInvoice.invoiceNumber}`);
      }
      setShowStatusModal(false);
    } catch (err: any) {
      triggerToast(err?.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  // Print Invoice Action — opens a dedicated clean print window
  const handlePrintInvoice = async (inv: Invoice) => {
    try {
      await api.post(`/invoices/${inv._id}/log-action`, { action: 'Printed Invoice' });
    } catch {}

    const formatC = (amount: number | string | undefined, cur: string = 'GBP') => {
      const val = Number(amount) || 0;
      let sym = '£';
      if (cur === 'USD') sym = '$';
      else if (cur === 'GHS') sym = 'GH₵ ';
      else if (cur === 'EUR') sym = '€';
      else if (cur === 'CNY') sym = '¥';
      return `${sym}${val.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const fmtDate = (d?: string | Date) => {
      if (!d) return '-';
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return '-';
      return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const settings = businessSettings;

    const itemsHtml = (inv.items || []).map((item) => `
      <tr>
        <td style="padding:10px 12px;color:#1e293b">${item.description}</td>
        <td style="padding:10px 12px;text-align:center;color:#475569">${item.quantity}</td>
        <td style="padding:10px 12px;text-align:right;color:#475569">${Number(item.unitPrice || 0).toFixed(2)}</td>
        <td style="padding:10px 12px;text-align:right;font-weight:600;color:#1e293b">${Number(item.amount || 0).toFixed(2)}</td>
      </tr>
    `).join('');

    const logoUrl = inv.companyDetails?.logoUrl || businessSettings?.logoUrl || '/uploads/ogl-logo.png';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Invoice ${inv.invoiceNumber}</title>
<style>
  @page { size: A4 portrait; margin: 10mm; }
  body { font-family: Arial, sans-serif; color: #172B3A; background: white; margin: 0; padding: 0; }
  * { box-sizing: border-box; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #e2e8f0; margin-bottom: 24px; }
  .logo-img { width: 120px; height: auto; object-fit: contain; }
  .company-details { text-align: right; font-size: 11px; color: #475569; line-height: 1.7; }
  .company-details h1 { font-size: 28px; font-weight: 800; color: #111827; margin: 0 0 12px 0; letter-spacing: 1px; }
  .company-details strong { color: #1e293b; }
  .bill-row { display: flex; justify-content: space-between; margin: 24px 0; }
  .bill-to { font-size: 12px; line-height: 1.7; }
  .bill-to label { font-weight: 700; text-transform: uppercase; letter-spacing: 1px; font-size: 11px; color: #0f172a; display: block; margin-bottom: 6px; }
  .meta-table { font-size: 12px; min-width: 200px; }
  .meta-table td { padding: 3px 8px; }
  .meta-table td:first-child { color: #64748b; }
  .meta-table td:last-child { font-weight: 700; text-align: right; }
  .items-table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 12px; }
  .items-table thead tr { background: #7B8BFA; color: #111827; }
  .items-table thead td { padding: 10px 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; font-size: 10px; }
  .items-table tbody tr:nth-child(even) { background: #f8fafc; }
  .items-table tbody tr { border-bottom: 1px solid #e2e8f0; }
  .totals-row { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 24px; }
  .payment-details { font-size: 11px; line-height: 1.8; color: #334155; }
  .payment-details label { font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; display: block; margin-bottom: 6px; }
  .total-box { font-size: 12px; min-width: 220px; }
  .total-box .line { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e2e8f0; }
  .total-due { display: flex; justify-content: space-between; padding: 10px 0; border-top: 3px solid #2563eb; margin-top: 8px; font-size: 16px; font-weight: 800; color: #111827; }
  .notes { margin-top: 24px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px; }
  .notes strong { color: #334155; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <img src="${logoUrl}" alt="OGL Logo" class="logo-img" />
    </div>
    <div class="company-details">
      <h1>INVOICE</h1>
      <strong>${inv.companyDetails?.companyName || settings?.companyName || 'Obrems Global Logistics'}</strong><br/>
      ${inv.companyDetails?.address || settings?.companyAddress || 'Milton Keynes, United Kingdom'}<br/>
      Co. Reg: ${inv.companyDetails?.registrationNumber || settings?.registrationNumber || '17094775'}<br/>
      ${inv.companyDetails?.phone || settings?.contactPhone || '+447460 554358'}<br/>
      ${inv.companyDetails?.email || settings?.billingEmail || 'obremsgloballogistics@gmail.com'}
    </div>
  </div>

  <div class="bill-row">
    <div class="bill-to">
      <label>Bill To</label>
      <strong>${inv.customer?.name || '-'}</strong><br/>
      ${inv.customer?.company ? `${inv.customer.company}<br/>` : ''}
      ${inv.customer?.address || ''}<br/>
      ${inv.customer?.email || ''}<br/>
      ${inv.customer?.phone || ''}
    </div>
    <table class="meta-table">
      <tr><td>Invoice No.:</td><td>${inv.invoiceNumber}</td></tr>
      <tr><td>Issue Date:</td><td>${fmtDate(inv.issueDate)}</td></tr>
      <tr><td>Due Date:</td><td>${fmtDate(inv.dueDate)}</td></tr>
      <tr><td>Payment Method:</td><td>${inv.paymentMethod || 'Bank Transfer'}</td></tr>
    </table>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <td style="width:50%">Description</td>
        <td style="text-align:center;width:12%">Qty</td>
        <td style="text-align:right;width:18%">Unit Price (${inv.currency})</td>
        <td style="text-align:right;width:20%">Amount (${inv.currency})</td>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
      ${inv.handlingFee ? `<tr><td style="padding:10px 12px">Packaging/Handling Fee</td><td style="text-align:center;padding:10px 12px">1</td><td style="text-align:right;padding:10px 12px">${Number(inv.handlingFee).toFixed(2)}</td><td style="text-align:right;font-weight:600;padding:10px 12px">${Number(inv.handlingFee).toFixed(2)}</td></tr>` : ''}
      ${inv.shippingFee ? `<tr><td style="padding:10px 12px">Shipping Fee</td><td style="text-align:center;padding:10px 12px">1</td><td style="text-align:right;padding:10px 12px">${Number(inv.shippingFee).toFixed(2)}</td><td style="text-align:right;font-weight:600;padding:10px 12px">${Number(inv.shippingFee).toFixed(2)}</td></tr>` : ''}
      ${inv.customsFee ? `<tr><td style="padding:10px 12px">Customs Clearance Fee</td><td style="text-align:center;padding:10px 12px">1</td><td style="text-align:right;padding:10px 12px">${Number(inv.customsFee).toFixed(2)}</td><td style="text-align:right;font-weight:600;padding:10px 12px">${Number(inv.customsFee).toFixed(2)}</td></tr>` : ''}
      ${inv.insuranceFee ? `<tr><td style="padding:10px 12px">Cargo Insurance Fee</td><td style="text-align:center;padding:10px 12px">1</td><td style="text-align:right;padding:10px 12px">${Number(inv.insuranceFee).toFixed(2)}</td><td style="text-align:right;font-weight:600;padding:10px 12px">${Number(inv.insuranceFee).toFixed(2)}</td></tr>` : ''}
    </tbody>
  </table>

  <div class="totals-row">
    <div class="payment-details">
      <label>Payment Details</label>
      Bank: ${inv.paymentDetails?.bankName || settings?.paymentSettings?.bankName || 'Barclays Bank UK'}<br/>
      Name: ${inv.paymentDetails?.accountName || settings?.paymentSettings?.accountName || 'OBREMS GLOBAL LOGISTICS LTD'}<br/>
      Account: ${inv.paymentDetails?.accountNumber || settings?.paymentSettings?.accountNumber || '12419039'}<br/>
      Sort Code: ${inv.paymentDetails?.sortCode || settings?.paymentSettings?.sortCode || '04-00-06'}<br/>
      ${(inv.paymentDetails?.mobileMoneyNumber || settings?.paymentSettings?.mobileMoneyNumber) ? `MoMo: ${inv.paymentDetails?.mobileMoneyNumber || settings?.paymentSettings?.mobileMoneyNumber}<br/>` : ''}
    </div>
    <div class="total-box">
      <div class="line"><span>Subtotal:</span><span>${formatC(inv.subtotal, inv.currency)}</span></div>
      ${inv.discount ? `<div class="line" style="color:#dc2626"><span>Discount:</span><span>-${formatC(inv.discount, inv.currency)}</span></div>` : ''}
      <div class="total-due"><span>TOTAL DUE (${inv.currency}):</span><span>${formatC(inv.amountDue ?? inv.total, inv.currency)}</span></div>
    </div>
  </div>

  ${inv.notes ? `<div class="notes"><strong>Notes: </strong>${inv.notes}</div>` : ''}
</body>
</html>`;

    const printWin = window.open('', '_blank', 'width=900,height=700');
    if (!printWin) { window.print(); return; }
    printWin.document.write(html);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
      printWin.close();
    }, 400);
  };


  // Download PDF Action (Fetches backend generated PDF or falls back to print)
  const handleDownloadPdf = async (inv: Invoice) => {
    try {
      await api.post(`/invoices/${inv._id}/log-action`, { action: 'Downloaded Invoice PDF' });
      triggerToast(`Preparing official A4 PDF for ${inv.invoiceNumber}...`, 'info');
      
      const token = localStorage.getItem('token') || '';
      const response = await fetch(`${api.defaults.baseURL || '/api'}/invoices/${inv._id}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Invoice-${inv.invoiceNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        triggerToast(`Invoice ${inv.invoiceNumber} PDF downloaded!`);
      } else {
        window.print();
      }
    } catch {
      window.print();
    }
  };

  // Metrics summary
  const totalInvoicesCount = invoices.length;
  const totalPaidSum = invoices.filter((i) => i.paymentStatus === 'Paid').reduce((s, i) => s + (i.total || 0), 0);
  const totalPendingSum = invoices
    .filter((i) => ['Pending', 'Sent', 'Draft', 'Partially Paid'].includes(i.paymentStatus))
    .reduce((s, i) => s + (i.amountDue || i.total || 0), 0);
  const totalOverdueCount = invoices.filter((i) => i.paymentStatus === 'Overdue').length;

  // Filtered list
  const filteredInvoices = invoices.filter((inv) => {
    const custName = inv.customer?.name || '';
    const custEmail = inv.customer?.email || '';
    const invNum = inv.invoiceNumber || '';
    const trackNum = inv.trackingNumber || inv.shipment?.trackingNumber || '';

    const matchesSearch =
      invNum.toLowerCase().includes(searchTerm.toLowerCase()) ||
      custName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      custEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trackNum.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || inv.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-[1320px] mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-top-2 text-white ${
            toastMessage.type === 'error'
              ? 'bg-rose-600 border-rose-400'
              : toastMessage.type === 'info'
              ? 'bg-[#0B63CE] border-blue-300'
              : 'bg-[#063B66] border-white/20'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#063B66] text-white flex items-center justify-center shadow-sm">
            <Receipt className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[#063B66]">Invoices &amp; Billing Management</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate, preview, print, email, and track professional A4 invoices for international freight shipments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            title="Refresh Invoices"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0B63CE] hover:bg-[#0952AD] text-white text-xs font-extrabold rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Invoice</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Invoices</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-extrabold text-[#063B66]">{totalInvoicesCount}</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-[#063B66] flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Total Paid Revenue</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-extrabold text-emerald-600">{formatCurrency(totalPaidSum, 'GBP')}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Pending / Outstanding</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-extrabold text-amber-600">{formatCurrency(totalPendingSum, 'GBP')}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Overdue Invoices</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-extrabold text-rose-600">{totalOverdueCount}</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search & Status Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Invoice #, customer name, email, tracking #..."
            className="w-full pl-9 pr-4 py-2 bg-[#F4F7FA] border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['All', 'Paid', 'Pending', 'Sent', 'Partially Paid', 'Overdue', 'Draft', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                statusFilter === tab
                  ? 'bg-[#063B66] text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-[#F4F7FA] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Invoice #</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Shipment / Route</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Issue / Due Date</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Loading invoices from database...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No matching invoices found. Click "Create New Invoice" to generate one.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[#063B66]">
                      <button
                        onClick={() => setPreviewInvoice(inv)}
                        className="hover:underline text-left hover:text-[#0B63CE]"
                      >
                        {inv.invoiceNumber}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{inv.customer?.name || 'Customer'}</p>
                      <p className="text-[11px] text-slate-500">{inv.customer?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      {inv.trackingNumber || inv.shipment?.trackingNumber ? (
                        <div>
                          <p className="font-mono font-bold text-[#063B66]">
                            {inv.trackingNumber || inv.shipment?.trackingNumber}
                          </p>
                          <p className="text-[10px] text-slate-500 font-semibold">
                            {inv.shipment?.origin && inv.shipment?.destination
                              ? `${inv.shipment.origin} → ${inv.shipment.destination}`
                              : 'UK → Ghana'}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Direct Billing</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 text-sm">
                        {formatCurrency(inv.total, inv.currency)}
                      </p>
                      {inv.paymentStatus === 'Partially Paid' && (
                        <p className="text-[10px] text-amber-600 font-bold">
                          Due: {formatCurrency(inv.amountDue, inv.currency)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-GB') : '-'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Issued: {inv.issueDate ? new Date(inv.issueDate).toLocaleDateString('en-GB') : '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setStatusTargetInvoice(inv);
                          setNewStatusSelection(inv.paymentStatus);
                          setPartialPaymentAmount(String(inv.amountPaid || ''));
                          setShowStatusModal(true);
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border cursor-pointer transition-colors ${
                          inv.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                            : inv.paymentStatus === 'Partially Paid'
                            ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                            : inv.paymentStatus === 'Overdue'
                            ? 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
                            : inv.paymentStatus === 'Sent'
                            ? 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span>{inv.paymentStatus}</span>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPreviewInvoice(inv)}
                          className="p-1.5 text-slate-500 hover:text-[#0B63CE] hover:bg-slate-100 rounded-md transition-colors"
                          title="Preview A4 Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSendInvoiceEmail(inv)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                          title="Send to Customer Email"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrintInvoice(inv)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="Print Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(inv)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          title="Edit Invoice"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(inv._id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT INVOICE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#063B66] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5" />
                <h3 className="font-extrabold text-sm tracking-wide">
                  {isEditing ? `Edit Invoice: ${formInvoiceNumber}` : 'Create New Logistics Invoice'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitInvoice} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Row 1: Invoice Number & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Invoice Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formInvoiceNumber}
                    onChange={(e) => setFormInvoiceNumber(e.target.value)}
                    placeholder="OGL-INV-2026-000001"
                    className="w-full px-3.5 py-2.5 bg-[#F4F7FA] border border-slate-200 rounded-lg text-xs font-mono font-bold text-[#063B66] focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Currency *
                  </label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#F4F7FA] border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                  >
                    <option value="GBP">GBP (£ - British Pound)</option>
                    <option value="GHS">GHS (GH₵ - Ghana Cedi)</option>
                    <option value="CNY">CNY (¥ - Chinese Yuan)</option>
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Payment Status
                  </label>
                  <select
                    value={formPaymentStatus}
                    onChange={(e) => setFormPaymentStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F4F7FA] border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Sent">Sent</option>
                    <option value="Draft">Draft</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Customer & Linked Shipment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Select Customer *
                  </label>
                  <input
                    type="search"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full mb-2 px-3.5 py-2.5 bg-[#F4F7FA] border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                  />
                  <select
                    required
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F4F7FA] border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.filter((c) => `${c.name || ''} ${c.email || ''} ${c.company || ''}`.toLowerCase().includes(customerSearch.toLowerCase())).map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.email}) {c.company ? `— ${c.company}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Connect Shipment (Optional)
                  </label>
                  <input
                    type="search"
                    value={trackingSearch}
                    onChange={(e) => setTrackingSearch(e.target.value.toUpperCase())}
                    placeholder="Search tracking ID..."
                    className="w-full mb-2 px-3.5 py-2.5 bg-[#F4F7FA] border border-slate-200 rounded-lg text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                  />
                  <select
                    value={selectedShipmentId}
                    onChange={(e) => handleShipmentChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F4F7FA] border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                  >
                    <option value="">-- No Linked Shipment (Direct Invoice) --</option>
                    {shipments.filter((s) => `${s.trackingNumber || ''} ${s.origin || ''} ${s.destination || ''}`.toLowerCase().includes(trackingSearch.toLowerCase())).map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.trackingNumber} ({s.origin} → {s.destination} - {s.shippingMethod})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Dates & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formIssueDate}
                    onChange={(e) => setFormIssueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F4F7FA] border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F4F7FA] border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F4F7FA] border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0B63CE] focus:bg-white"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Mobile Money">Mobile Money (MoMo / Telecel)</option>
                    <option value="Credit / Debit Card">Credit / Debit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Line Items Section */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#063B66] uppercase tracking-wider">
                    Invoice Line Items *
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#0B63CE] hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#063B66] text-white font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-4 py-2.5">Description</th>
                        <th className="px-3 py-2.5 w-24">Qty</th>
                        <th className="px-3 py-2.5 w-32">Unit Price</th>
                        <th className="px-4 py-2.5 w-32 text-right">Amount</th>
                        <th className="px-2 py-2.5 w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formItems.map((item, idx) => (
                        <tr key={idx} className="bg-white">
                          <td className="p-2">
                            <input
                              type="text"
                              required
                              value={item.description}
                              onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                              placeholder="e.g. Air Freight UK-Ghana, New Laptop x1"
                              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 focus:bg-white focus:border-[#0B63CE] focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 text-center focus:bg-white focus:border-[#0B63CE] focus:outline-none font-bold"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800 text-right focus:bg-white focus:border-[#0B63CE] focus:outline-none font-bold"
                            />
                          </td>
                          <td className="px-4 py-2 text-right font-bold text-slate-900 font-mono">
                            {formatCurrency(item.amount, formCurrency)}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Adjustments & Totals Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                <div className="space-y-3">
                  <span className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Additional Logistics Fees &amp; Adjustments
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Handling/Packaging</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formHandlingFee}
                        onChange={(e) => setFormHandlingFee(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Customs Clearance</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formCustomsFee}
                        onChange={(e) => setFormCustomsFee(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Cargo Insurance</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formInsuranceFee}
                        onChange={(e) => setFormInsuranceFee(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">Discount (-)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formDiscount}
                        onChange={(e) => setFormDiscount(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-rose-600"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Invoice Notes &amp; Terms
                    </label>
                    <textarea
                      rows={2}
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs resize-none"
                    />
                  </div>
                </div>

                {/* Right Calculated Totals Card */}
                <div className="bg-[#F4F7FA] p-5 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                  <span className="block text-[11px] font-extrabold text-[#063B66] uppercase tracking-wider border-b border-slate-200 pb-2">
                    Summary Calculations
                  </span>

                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-bold">{formatCurrency(calculatedSubtotal, formCurrency)}</span>
                  </div>

                  {formHandlingFee > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Handling / Packaging:</span>
                      <span className="font-mono font-bold">+{formatCurrency(formHandlingFee, formCurrency)}</span>
                    </div>
                  )}

                  {formCustomsFee > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Customs Clearance:</span>
                      <span className="font-mono font-bold">+{formatCurrency(formCustomsFee, formCurrency)}</span>
                    </div>
                  )}

                  {formInsuranceFee > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Insurance Fee:</span>
                      <span className="font-mono font-bold">+{formatCurrency(formInsuranceFee, formCurrency)}</span>
                    </div>
                  )}

                  {formDiscount > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Discount:</span>
                      <span className="font-mono font-bold">-{formatCurrency(formDiscount, formCurrency)}</span>
                    </div>
                  )}

                  <div className="border-t-2 border-slate-300 pt-2 flex justify-between items-center">
                    <span className="text-sm font-extrabold text-[#063B66] uppercase">TOTAL DUE:</span>
                    <span className="text-xl font-extrabold text-[#063B66] font-mono">
                      {formatCurrency(calculatedTotal, formCurrency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Automatic Email Delivery Toggle */}
              <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0B63CE] text-white flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-[#063B66]">
                      Automated Customer Email Delivery
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      Instantly generates and attaches the official PDF invoice to the customer's email.
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formAutoSendEmail}
                    onChange={(e) => setFormAutoSendEmail(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B63CE]"></div>
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#0B63CE] hover:bg-[#0952AD] text-white text-xs font-extrabold shadow-sm transition-colors"
                >
                  {isEditing ? 'Save Changes' : 'Generate & Save Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PIXEL-PERFECT A4 INVOICE PREVIEW MODAL */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl my-6 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Top Toolbar */}
            <div className="px-6 py-3.5 bg-[#063B66] text-white flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-300" />
                <span className="font-extrabold text-sm">
                  Invoice Preview: {previewInvoice.invoiceNumber}
                </span>
                <span
                  className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    previewInvoice.paymentStatus === 'Paid'
                      ? 'bg-emerald-500 text-white'
                      : previewInvoice.paymentStatus === 'Partially Paid'
                      ? 'bg-amber-500 text-white'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {previewInvoice.paymentStatus}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintInvoice(previewInvoice)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors border border-white/20"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print A4</span>
                </button>

                <button
                  onClick={() => handleDownloadPdf(previewInvoice)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors border border-white/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={() => handleSendInvoiceEmail(previewInvoice)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                </button>

                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    handleOpenEditModal(previewInvoice);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Container with Pure A4 Portrait Document */}
            <div className="p-4 sm:p-8 max-h-[85vh] overflow-y-auto flex justify-center bg-slate-200">
              {/* A4 INVOICE SHEET (Pure corporate styling strictly adhering to reference layout) */}
              <div
                id="printable-invoice-document"
                ref={printRef}
                className="w-full max-w-[794px] min-h-[1123px] bg-white text-[#172B3A] p-10 sm:p-14 shadow-xl border border-slate-300 rounded-sm flex flex-col justify-between"
                style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, Arial, sans-serif" }}
              >
                <div>
                  {/* 1. HEADER SECTION (Logo on Left, INVOICE & Company Details on Right) */}
                  <div className="flex justify-between items-start">
                    {/* Top-Left: OGL Logo */}
                    <div className="shrink-0">
                      <img
                        src={previewInvoice.companyDetails?.logoUrl || businessSettings?.logoUrl || '/uploads/ogl-logo.png'}
                        alt="OGL Logo"
                        className="w-32 h-32 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="w-32 h-32 bg-[#0B1E3B] flex-col items-center justify-center p-3 text-center shadow-xs" style={{display:'none'}}>
                        <span className="text-xl font-black tracking-wider text-[#F59E0B] leading-none">OGL</span>
                        <span className="text-[6px] tracking-widest text-[#7DD3FC] font-bold uppercase mt-1">OBREMS GLOBAL LOGISTICS</span>
                      </div>
                    </div>

                    {/* Top-Right: INVOICE Heading + Company Details */}
                    <div className="text-right space-y-0.5">
                      <h1 className="text-3xl font-bold tracking-tight text-[#111827] uppercase mb-4 font-sans">
                        INVOICE
                      </h1>
                      <p className="text-xs font-bold text-slate-700">
                        {previewInvoice.companyDetails?.companyName ||
                          businessSettings?.companyName ||
                          'Obrems Global logistics'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {previewInvoice.companyDetails?.address?.split(',')[0] ||
                          businessSettings?.companyAddress?.split(',')[0] ||
                          'Milton Keynes'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {previewInvoice.companyDetails?.city || businessSettings?.companyCity || 'Milton Keynes'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {previewInvoice.companyDetails?.country || businessSettings?.companyCountry || 'United Kingdom'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Co. Reg. No.:{' '}
                        {previewInvoice.companyDetails?.registrationNumber ||
                          businessSettings?.registrationNumber ||
                          '17094775'}
                      </p>
                      <div className="pt-2 text-[11px] text-slate-500 space-y-0.5">
                        <p className="text-slate-700 font-medium">Esther Mensah</p>
                        <p>{previewInvoice.companyDetails?.phone || businessSettings?.contactPhone || '+447460 554358'}</p>
                        <p>{previewInvoice.companyDetails?.email || businessSettings?.billingEmail || 'obremsgloballogistics@gmail.com'}</p>
                      </div>
                    </div>
                  </div>

                  {/* 2. BILL TO & METADATA SECTION */}
                  <div className="grid grid-cols-2 gap-8 mt-10 text-xs">
                    {/* Left Column: BILL TO */}
                    <div>
                      <span className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        BILL TO
                      </span>
                      <p className="text-xs font-bold text-slate-900">
                        {previewInvoice.customer?.name || 'Seth Owusu'}
                      </p>
                      {previewInvoice.customer?.company && (
                        <p className="text-xs text-slate-600">{previewInvoice.customer.company}</p>
                      )}
                      <p className="text-xs text-slate-600">
                        {previewInvoice.customer?.address || 'Accra'}
                      </p>
                      <p className="text-xs text-slate-600">
                        {previewInvoice.customer?.city || 'Accra'}
                      </p>
                      <p className="text-xs text-slate-600">
                        {previewInvoice.customer?.country || 'United Kingdom'}
                      </p>
                    </div>

                    {/* Right Column: INVOICE METADATA */}
                    <div className="flex justify-end">
                      <div className="w-56 space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Invoice No.:</span>
                          <span className="font-bold text-slate-900 text-right">
                            {previewInvoice.invoiceNumber}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Issue date:</span>
                          <span className="font-bold text-slate-900 text-right">
                            {formatDate(previewInvoice.issueDate)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Due date:</span>
                          <span className="font-bold text-slate-900 text-right">
                            {formatDate(previewInvoice.dueDate)}
                          </span>
                        </div>
                        <div className="pt-2 flex justify-between items-center">
                          <span className="text-slate-500">Payment method:</span>
                          <span className="font-bold text-slate-900 text-right">
                            {previewInvoice.paymentMethod || 'Bank Transfer'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. LINE ITEMS TABLE (Solid Periwinkle Bar Header #7B8BFA) */}
                  <div className="mt-8">
                    <div className="bg-[#7B8BFA] text-slate-900 px-4 py-2.5 grid grid-cols-12 text-[11px] font-bold uppercase tracking-wider rounded-none">
                      <div className="col-span-6">DESCRIPTION</div>
                      <div className="col-span-2 text-center">QUANTITY</div>
                      <div className="col-span-2 text-right">
                        UNIT PRICE ({previewInvoice.currency === 'GBP' ? '£' : previewInvoice.currency})
                      </div>
                      <div className="col-span-2 text-right">
                        AMOUNT ({previewInvoice.currency === 'GBP' ? '£' : previewInvoice.currency})
                      </div>
                    </div>

                    <div className="divide-y divide-transparent text-xs">
                      {previewInvoice.items && previewInvoice.items.length > 0 ? (
                        previewInvoice.items.map((item, idx) => {
                          const descParts = item.description.split(/(\(.*?\))/g).filter(Boolean);
                          const mainDesc = descParts[0] ? descParts[0].trim() : item.description;
                          const subNote = descParts.length > 1 ? descParts.slice(1).join(' ').replace(/[()]/g, '').trim() : '';

                          return (
                            <div key={idx} className="grid grid-cols-12 px-4 py-3.5 items-start">
                              <div className="col-span-6">
                                <span className="font-semibold text-slate-900 block">{mainDesc}</span>
                                {subNote && <span className="text-[11px] text-slate-500 block mt-0.5">{subNote}</span>}
                              </div>
                              <div className="col-span-2 text-center font-medium text-slate-700">
                                {item.quantity}
                              </div>
                              <div className="col-span-2 text-right font-medium text-slate-700">
                                {Number(item.unitPrice || 0).toFixed(2)}
                              </div>
                              <div className="col-span-2 text-right font-medium text-slate-900">
                                {Number(item.amount || 0).toFixed(2)}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-slate-400">No items recorded.</div>
                      )}

                      {/* Additional Fees if any */}
                      {previewInvoice.handlingFee ? (
                        <div className="grid grid-cols-12 px-4 py-2.5 items-start">
                          <div className="col-span-6">
                            <span className="font-semibold text-slate-900 block">Packaging/Handling fee</span>
                          </div>
                          <div className="col-span-2 text-center font-medium text-slate-700">1</div>
                          <div className="col-span-2 text-right font-medium text-slate-700">
                            {Number(previewInvoice.handlingFee || 0).toFixed(2)}
                          </div>
                          <div className="col-span-2 text-right font-medium text-slate-900">
                            {Number(previewInvoice.handlingFee || 0).toFixed(2)}
                          </div>
                        </div>
                      ) : null}

                      {previewInvoice.shippingFee > 0 && (
                        <div className="grid grid-cols-12 px-4 py-2.5 items-start">
                          <div className="col-span-6">
                            <span className="font-semibold text-slate-900 block">Shipping Fee</span>
                          </div>
                          <div className="col-span-2 text-center font-medium text-slate-700">1</div>
                          <div className="col-span-2 text-right font-medium text-slate-700">
                            {Number(previewInvoice.shippingFee || 0).toFixed(2)}
                          </div>
                          <div className="col-span-2 text-right font-medium text-slate-900">
                            {Number(previewInvoice.shippingFee || 0).toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4. PAYMENT DETAILS (LEFT) & TOTALS (RIGHT) */}
                  <div className="grid grid-cols-2 gap-8 mt-12 items-start text-xs">
                    {/* LEFT: PAYMENT DETAILS */}
                    <div className="space-y-1">
                      <span className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        PAYMENT DETAILS
                      </span>
                      <p className="text-slate-700">
                        Name:{' '}
                        {previewInvoice.paymentDetails?.accountName ||
                          businessSettings?.paymentSettings?.accountName ||
                          'OBREMS GLOBAL LOGISTICS LTD'}
                      </p>
                      <p className="text-slate-700">
                        Account number:{' '}
                        {previewInvoice.paymentDetails?.accountNumber ||
                          businessSettings?.paymentSettings?.accountNumber ||
                          '12419039'}
                      </p>
                      <p className="text-slate-700">
                        Sort code:{' '}
                        {previewInvoice.paymentDetails?.sortCode ||
                          businessSettings?.paymentSettings?.sortCode ||
                          '04-00-06'}
                      </p>
                      {(previewInvoice.paymentDetails?.mobileMoneyNumber ||
                        businessSettings?.paymentSettings?.mobileMoneyNumber) && (
                        <p className="text-slate-700">
                          MoMo:{' '}
                          {previewInvoice.paymentDetails?.mobileMoneyNumber ||
                            businessSettings?.paymentSettings?.mobileMoneyNumber}
                        </p>
                      )}
                    </div>

                    {/* RIGHT: TOTALS SECTION */}
                    <div className="space-y-2">
                      <div className="border-t border-slate-900 pt-2 flex justify-between items-center text-xs font-bold text-slate-900">
                        <span>TOTAL ({previewInvoice.currency}):</span>
                        <span className="font-medium">{formatCurrency(previewInvoice.total, previewInvoice.currency)}</span>
                      </div>

                      {/* Prominent Blue Border and TOTAL DUE */}
                      <div className="border-t-2 border-blue-600 pt-3 flex justify-between items-center">
                        <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                          TOTAL DUE ({previewInvoice.currency})
                        </span>
                        <span className="text-lg sm:text-xl font-bold text-slate-900">
                          {formatCurrency(previewInvoice.amountDue ?? previewInvoice.total, previewInvoice.currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Optional Notes */}
                  {previewInvoice.notes && (
                    <div className="mt-8 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">Notes: </span>
                      <span>{previewInvoice.notes}</span>
                    </div>
                  )}
                </div>

                {/* Printable Document Bottom Space */}
                <div className="h-4"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {showStatusModal && statusTargetInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#063B66] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Update Status: {statusTargetInvoice.invoiceNumber}</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Select Payment Status
                </label>
                <select
                  value={newStatusSelection}
                  onChange={(e) => setNewStatusSelection(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F4F7FA] border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0B63CE]"
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Pending">Pending</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {newStatusSelection === 'Partially Paid' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Amount Paid ({statusTargetInvoice.currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={partialPaymentAmount}
                    onChange={(e) => setPartialPaymentAmount(e.target.value)}
                    placeholder="e.g. 100.00"
                    className="w-full px-3.5 py-2.5 bg-[#F4F7FA] border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0B63CE]"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Total Invoice Amount: {formatCurrency(statusTargetInvoice.total, statusTargetInvoice.currency)}
                  </p>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateStatusSubmit}
                  className="px-5 py-2 bg-[#0B63CE] hover:bg-[#0952AD] text-white rounded-lg font-bold shadow-sm"
                >
                  Save Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
