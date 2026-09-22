const nodemailer = require('nodemailer');
const path = require('path');

const LOGO_PATH = path.resolve(__dirname, '../../../frontend/public/ogllogo-removebg-preview.png');

function logoAttachment() {
  return {
    filename: 'obrems-logo.png',
    path: LOGO_PATH,
    cid: 'obrems-logo',
    contentType: 'image/png',
  };
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[character]));
}

/**
 * Get or initialize nodemailer transporter
 */
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }

  // Fallback: If no SMTP credentials, return a mock transporter for seamless local dev & testing
  return {
    sendMail: async (options) => {
      console.log(`[EmailService] SMTP not configured. Simulating delivery to: ${options.to}`);
      console.log(`[EmailService] Subject: ${options.subject}`);
      console.log(`[EmailService] Attachments: ${options.attachments ? options.attachments.length : 0}`);
      return {
        messageId: `simulated-${Date.now()}`,
        simulated: true,
      };
    },
  };
}

/**
 * Dispatches an invoice PDF to a customer email
 * @param {Object} params
 * @param {string} params.to - Customer email
 * @param {string} params.customerName - Customer name
 * @param {string} params.invoiceNumber - Invoice number (e.g., OGL-INV-2026-000001)
 * @param {string} params.amountDue - Formatted amount due (e.g. £55.00)
 * @param {string} params.dueDate - Formatted due date
 * @param {Buffer} params.pdfBuffer - Generated PDF attachment
 */
async function sendInvoicePdfEmail({ to, customerName, invoiceNumber, amountDue, dueDate, pdfBuffer, deliveryNotice = false }) {
  const transporter = createTransporter();
  const fromAddress = process.env.SMTP_FROM || '"OBREMS GLOBAL LOGISTICS" <billing@obremsgloballogistics.com>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
          .header { background: #0B1E3B; padding: 24px; text-align: center; color: #ffffff; }
          .header img { width: 96px; height: 96px; object-fit: contain; display: block; margin: 0 auto 10px; }
          .header h1 { margin: 0 0 4px; font-size: 22px; letter-spacing: 1px; }
          .header p { margin: 0; font-size: 11px; color: #7dd3fc; text-transform: uppercase; letter-spacing: 2px; }
          .body { padding: 30px 24px; }
          .greeting { font-size: 16px; font-weight: bold; margin-bottom: 16px; }
          .details-card { background: #f1f5f9; border-radius: 8px; padding: 18px; margin: 20px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
          .row:last-child { margin-bottom: 0; }
          .label { color: #64748b; font-weight: 500; }
          .value { font-weight: bold; color: #0f172a; }
          .due-highlight { color: #0b63ce; font-size: 18px; }
          .button { display: block; text-align: center; background: #0b63ce; color: #ffffff !important; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; font-size: 14px; margin: 25px 0; }
          .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="cid:obrems-logo" alt="OBREMS Global Logistics">
            <h1>OBREMS GLOBAL LOGISTICS</h1>
            <p>Reliable Door-to-Door Freight Services</p>
          </div>
          <div class="body">
            <div class="greeting">Hello ${customerName || 'Valued Customer'},</div>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">
              Thank you for choosing OBREMS GLOBAL LOGISTICS. ${deliveryNotice ? `Your shipment has been delivered. The official invoice <strong>${invoiceNumber}</strong> is attached to this email as a PDF for your records.` : `Your official invoice <strong>${invoiceNumber}</strong> is ready and attached to this email as a PDF.`}
            </p>

            <div class="details-card">
              <div class="row">
                <span class="label">Invoice Number:</span>
                <span class="value">${invoiceNumber}</span>
              </div>
              <div class="row">
                <span class="label">Due Date:</span>
                <span class="value">${dueDate}</span>
              </div>
              <div class="row" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #cbd5e1;">
                <span class="label" style="font-weight: bold; color: #0f172a;">Total Due:</span>
                <span class="value due-highlight">${amountDue}</span>
              </div>
            </div>

            <p style="font-size: 13px; line-height: 1.5; color: #64748b;">
              Please review the attached PDF for complete itemized breakdown and our payment details (Bank Transfer & Mobile Money). Please include your Invoice Number <strong>${invoiceNumber}</strong> as the payment reference.
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 4px;">OBREMS GLOBAL LOGISTICS LTD • Milton Keynes, United Kingdom</p>
            <p style="margin: 0;">Phone: +44 7460 554358 • Email: billing@obremsgloballogistics.com</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const mailOptions = {
    from: fromAddress,
    to,
    subject: deliveryNotice ? `Delivery completed - invoice ${invoiceNumber}` : `Invoice ${invoiceNumber} from OBREMS GLOBAL LOGISTICS`,
    html: htmlContent,
    attachments: [
      logoAttachment(),
      {
        filename: `Invoice-${invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  };

  return await transporter.sendMail(mailOptions);
}

async function sendNewUserWelcomeEmail({ to, name, role, temporaryPassword }) {
  const transporter = createTransporter();
  const fromAddress = process.env.SMTP_FROM || '"OBREMS GLOBAL LOGISTICS" <support@obremsgloballogistics.com>';
  const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173/login';

  const mailOptions = {
    from: fromAddress,
    to,
    subject: 'Your OBREMS Global Logistics account details',
    text: `Hello ${name || 'there'},\n\nYour OBREMS Global Logistics staff account has been created.\n\nLogin email: ${to}\nTemporary password: ${temporaryPassword}\nRole: ${role}\n\nSign in at: ${loginUrl}\nYou must change your password after your first login.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <div style="background: #063B66; padding: 24px; color: #fff; text-align: center;">
          <img src="cid:obrems-logo" alt="OBREMS Global Logistics" style="width: 96px; height: 96px; object-fit: contain; display: block; margin: 0 auto 10px;">
          <h1 style="margin: 0; font-size: 22px;">OBREMS GLOBAL LOGISTICS</h1>
        </div>
        <div style="padding: 28px 24px;">
          <p>Hello ${escapeHtml(name || 'there')},</p>
          <p>Your staff account has been created. Use the details below to sign in:</p>
          <div style="background: #f1f5f9; border: 1px solid #e2e8f0; padding: 18px; line-height: 1.8;">
            <strong>Login email:</strong> ${escapeHtml(to)}<br>
            <strong>Temporary password:</strong> ${escapeHtml(temporaryPassword)}<br>
            <strong>Role:</strong> ${escapeHtml(role)}
          </div>
          <p style="margin: 24px 0;"><a href="${escapeHtml(loginUrl)}" style="background: #0B63CE; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 6px;">Sign in to your account</a></p>
          <p style="color: #64748b; font-size: 13px;">You must change this temporary password after your first login.</p>
        </div>
      </div>
    `,
    attachments: [logoAttachment()],
  };

  return transporter.sendMail(mailOptions);
}

async function sendBroadcastEmail({ to, customerName, subject, message }) {
  const transporter = createTransporter();
  const fromAddress = process.env.SMTP_FROM || '"OBREMS GLOBAL LOGISTICS" <support@obremsgloballogistics.com>';
  const safeName = escapeHtml(customerName || 'Valued Customer');
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

  return transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    text: `Hello ${customerName || 'Valued Customer'},\n\n${message}`,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
      <div style="background: #063B66; padding: 24px; color: #fff; text-align: center;"><img src="cid:obrems-logo" alt="OBREMS Global Logistics" style="width: 96px; height: 96px; object-fit: contain; display: block; margin: 0 auto 10px;"><h1 style="margin: 0; font-size: 22px;">OBREMS GLOBAL LOGISTICS</h1></div>
      <div style="padding: 28px 24px;"><p>Hello ${safeName},</p><p style="line-height: 1.7;">${safeMessage}</p></div>
    </div>`,
    attachments: [logoAttachment()],
  });
}

module.exports = {
  sendInvoicePdfEmail,
  sendNewUserWelcomeEmail,
  sendBroadcastEmail,
};
