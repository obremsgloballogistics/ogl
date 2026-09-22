const fs = require('fs');
const path = require('path');
const { generateInvoicePDF } = require('./src/utils/pdfService');

async function testPdf() {
  const dummyInvoice = {
    invoiceNumber: '233',
    currency: 'GBP',
    issueDate: '2026-08-14T00:00:00.000Z',
    dueDate: '2026-08-14T00:00:00.000Z',
    paymentMethod: 'Bank Transfer',
    customer: {
      name: 'Seth Owusu',
      address: 'Accra, Accra',
      country: 'United Kingdom',
      phone: '+44 7700 900123',
      email: 'seth.owusu@example.com',
    },
    companyDetails: {
      companyName: 'Obrems Global logistics',
      address: 'Milton Keynes',
      city: 'Milton Keynes',
      country: 'United Kingdom',
      registrationNumber: '17094775',
      phone: '+447460 554358',
      email: 'obremsgloballogistics@gmail.com',
    },
    paymentDetails: {
      accountName: 'OBREMS GLOBAL LOGISTICS LTD',
      accountNumber: '12419039',
      sortCode: '04-00-06',
    },
    items: [
      {
        description: 'Air Freight shipment UK-Ghana (New Laptop x1)',
        quantity: 1,
        unitPrice: 55,
        amount: 55,
      },
      {
        description: 'Packaging/Handling fee',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
      },
    ],
    subtotal: 55,
    shippingFee: 0,
    handlingFee: 0,
    total: 55,
    amountDue: 55,
  };

  try {
    console.log('Generating test PDF...');
    const buffer = await generateInvoicePDF(dummyInvoice);
    const outputPath = path.join(__dirname, 'test_output.pdf');
    fs.writeFileSync(outputPath, buffer);
    console.log(`Success! PDF generated at ${outputPath} (${buffer.length} bytes)`);
  } catch (err) {
    console.error('Failed to generate PDF:', err);
    process.exit(1);
  }
}

testPdf();
