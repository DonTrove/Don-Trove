/**
 * ══════════════════════════════════════════════════════
 *  DON TROVE — Google Apps Script
 *  Paste this entire file into:
 *  Google Sheet → Extensions → Apps Script → Code.gs
 *
 *  Then: Deploy → New Deployment → Web App
 *    Execute as: Me
 *    Who has access: Anyone
 *  Copy the deployment URL → paste into app.js CONFIG.SHEET_URL
 * ══════════════════════════════════════════════════════
 *
 *  SHEET SETUP — create two tabs named exactly:
 *
 *  Tab 1: "Products"
 *  Columns: Name | Price | Description | Image URL | Category | Active
 *  Example row: Notebook | 2000 | Textured notebook | https://... | Notebooks | YES
 *
 *  Tab 2: "Orders"
 *  (leave it empty — headers are added automatically)
 * ══════════════════════════════════════════════════════
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

// ── Column headers for the Orders sheet ──
const ORDER_HEADERS = [
  'Order Ref', 'Date & Time',
  'Sender Name', 'Phone', 'Email', 'City',
  'Recipient Name', 'Occasion', 'Delivery Address',
  'Delivery Date', 'Gift Message', 'Notes',
  'Items', 'Subtotal (PKR)', 'Gift Wrap',
  'Delivery Fee (PKR)', 'Total (PKR)', 'Payment Method',
  'Status'
];

// ══════════════════════════════════════════
//  GET — returns products list as JSON
// ══════════════════════════════════════════
function doGet(e) {
  const action = e && e.parameter && e.parameter.action;

  if (action === 'products' || !action) {
    return getProducts();
  }

  return jsonResponse({ error: 'Unknown action' });
}

function getProducts() {
  try {
    const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Products');

    if (!sheet) {
      return jsonResponse({ error: 'Products sheet not found' });
    }

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return jsonResponse([]);

    const headers = data[0].map(h => String(h).trim().toLowerCase().replace(/\s+/g, ''));
    const rows    = data.slice(1);

    const products = rows
      .map(row => {
        const obj = {};
        headers.forEach((h, i) => { obj[h] = String(row[i] || '').trim(); });
        return obj;
      })
      // Only return active products (Active column = YES or empty means active)
      .filter(p => p.active !== 'NO' && p.name)
      .map(p => ({
        name:        p.name,
        price:       p.price,
        description: p.description,
        imageUrl:    p.imageurl || p['image url'] || p.image || '',
        category:    p.category || 'Other',
        active:      p.active || 'YES',
      }));

    return jsonResponse(products);

  } catch (err) {
    Logger.log('getProducts error: ' + err);
    return jsonResponse({ error: err.toString() });
  }
}

// ══════════════════════════════════════════
//  POST — saves an order to Orders sheet
// ══════════════════════════════════════════
function doPost(e) {
  try {
    const body    = JSON.parse(e.postData.contents);
    const action  = body.action;

    if (action === 'order') {
      return saveOrder(body);
    }

    return jsonResponse({ error: 'Unknown action' });

  } catch (err) {
    Logger.log('doPost error: ' + err);
    return jsonResponse({ error: err.toString() });
  }
}

function saveOrder(data) {
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet   = ss.getSheetByName('Orders');

  // Create Orders sheet + headers if missing
  if (!sheet) {
    sheet = ss.insertSheet('Orders');
    sheet.appendRow(ORDER_HEADERS);
    sheet.getRange(1, 1, 1, ORDER_HEADERS.length)
      .setBackground('#4B1A8C')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  // If sheet exists but has no headers, add them
  const firstCell = sheet.getRange(1, 1).getValue();
  if (!firstCell || firstCell !== 'Order Ref') {
    sheet.insertRowBefore(1);
    sheet.getRange(1, 1, 1, ORDER_HEADERS.length).setValues([ORDER_HEADERS])
      .setBackground('#4B1A8C')
      .setFontColor('#FFFFFF')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  const row = [
    data.orderRef       || '',
    data.dateTime       || new Date().toLocaleString(),
    data.senderName     || '',
    data.phone          || '',
    data.email          || '',
    data.city           || '',
    data.recipientName  || '',
    data.occasion       || '',
    data.address        || '',
    data.deliveryDate   || '',
    data.giftMessage    || '',
    data.notes          || '',
    data.items          || '',
    data.subtotal       || 0,
    data.giftWrap       || 'No',
    data.deliveryFee    || 200,
    data.total          || 0,
    data.paymentMethod  || '',
    'New',              // Status — you can update this manually in the sheet
  ];

  sheet.appendRow(row);

  // Auto-resize columns for readability
  sheet.autoResizeColumns(1, ORDER_HEADERS.length);

  // Send email notification (optional — set your email below)
  sendNotificationEmail(data);

  return jsonResponse({ success: true, orderRef: data.orderRef });
}

// ══════════════════════════════════════════
//  EMAIL NOTIFICATION (optional)
//  Set YOUR_EMAIL below to receive an email
//  every time a new order is placed.
//  Leave blank to disable.
// ══════════════════════════════════════════
const NOTIFY_EMAIL = ''; // e.g. 'yourname@gmail.com'

function sendNotificationEmail(data) {
  if (!NOTIFY_EMAIL) return;

  try {
    const subject = `🛍️ New Don Trove Order — ${data.orderRef}`;
    const body = `
New order received!

Order Ref:    ${data.orderRef}
Date & Time:  ${data.dateTime}

── CUSTOMER ──
Name:         ${data.senderName}
Phone:        ${data.phone}
Email:        ${data.email}
City:         ${data.city}

── RECIPIENT ──
Name:         ${data.recipientName}
Occasion:     ${data.occasion}
Address:      ${data.address}
Delivery Date:${data.deliveryDate}
Gift Message: ${data.giftMessage}

── ORDER ──
Items:        ${data.items}
Subtotal:     PKR ${data.subtotal}
Gift Wrap:    ${data.giftWrap}
Delivery Fee: PKR ${data.deliveryFee}
TOTAL:        PKR ${data.total}
Payment:      ${data.paymentMethod}

Notes: ${data.notes || '—'}

View all orders in your Google Sheet.
    `.trim();

    GmailApp.sendEmail(NOTIFY_EMAIL, subject, body);
  } catch (err) {
    Logger.log('Email notification failed: ' + err);
  }
}

// ══════════════════════════════════════════
//  HELPER — JSON response with CORS headers
// ══════════════════════════════════════════
function jsonResponse(data) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}
