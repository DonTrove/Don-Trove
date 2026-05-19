/**
 * ═══════════════════════════════════════════════════════════
 *  DON TROVE — Code.gs  (Google Apps Script)
 * ═══════════════════════════════════════════════════════════
 *
 *  HOW TO DEPLOY
 *  ─────────────
 *  1. Open your Google Sheet → Extensions → Apps Script
 *  2. Paste this entire file into Code.gs (replace any
 *     existing content)
 *  3. Save (Ctrl + S)
 *  4. Click "Deploy" → "New deployment"
 *     • Type      : Web app
 *     • Execute as: Me
 *     • Who has access: Anyone
 *  5. Copy the deployment URL and paste it into app.js as
 *     SHEET_ORDERS_URL
 *  6. Re-deploy after any code changes ("Manage deployments"
 *     → edit → new version)
 *
 *  GOOGLE SHEET STRUCTURE
 *  ──────────────────────
 *  Tab 1 — "Products"   (read by opensheet.elk.sh)
 *    Columns: id | name | category | description |
 *             price | imageUrl | featured
 *
 *  Tab 2 — "Orders"     (written by this script)
 *    Auto-created on first order if it doesn't exist.
 *    Columns: Timestamp | Order Ref | Name | Phone |
 *             City | Address | Items | Subtotal |
 *             Delivery Fee | Total | Payment | Notes
 * ═══════════════════════════════════════════════════════════
 */

/* ── Sheet / column config ──────────────────────── */
var ORDERS_SHEET_NAME = "Orders";

var ORDER_HEADERS = [
  "Timestamp",
  "Order Ref",
  "Name",
  "Phone",
  "City",
  "Address",
  "Items",
  "Subtotal (PKR)",
  "Delivery Fee (PKR)",
  "Total (PKR)",
  "Payment Method",
  "Notes",
];

/* ═══════════════════════════════════════════════════
   doPost — receives order from the storefront
   ═══════════════════════════════════════════════════ */
function doPost(e) {
  try {
    var raw  = e.postData ? e.postData.contents : "{}";
    var data = JSON.parse(raw);

    if (data.action === "order") {
      saveOrder(data);
    }

    return jsonResponse({ status: "ok", orderRef: data.orderRef || "" });

  } catch (err) {
    Logger.log("doPost error: " + err.message);
    return jsonResponse({ status: "error", message: err.message });
  }
}

/* ═══════════════════════════════════════════════════
   doGet — health-check / CORS preflight
   ═══════════════════════════════════════════════════ */
function doGet() {
  return jsonResponse({ status: "ok", service: "Don Trove Orders" });
}

/* ═══════════════════════════════════════════════════
   saveOrder — appends one row to the Orders sheet
   ═══════════════════════════════════════════════════ */
function saveOrder(data) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(ORDERS_SHEET_NAME);

  /* Create the sheet + header row if it doesn't exist yet */
  if (!sheet) {
    sheet = ss.insertSheet(ORDERS_SHEET_NAME);
    sheet.appendRow(ORDER_HEADERS);

    /* Style the header row */
    var headerRange = sheet.getRange(1, 1, 1, ORDER_HEADERS.length);
    headerRange.setBackground("#b84060");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  /* Build the data row */
  var row = [
    new Date(),                          // Timestamp
    data.orderRef        || "",          // Order Ref
    data.senderName      || "",          // Name
    data.phone           || "",          // Phone
    data.city            || "",          // City
    data.address         || "",          // Address
    data.items           || "",          // Items
    data.subtotal        || 0,           // Subtotal
    data.deliveryFee     || 200,         // Delivery Fee
    data.total           || 0,           // Total
    data.paymentMethod   || "COD",       // Payment Method
    data.notes           || "",          // Notes
  ];

  sheet.appendRow(row);

  /* Auto-resize columns for readability */
  sheet.autoResizeColumns(1, ORDER_HEADERS.length);

  Logger.log("Order saved: " + data.orderRef);
}

/* ═══════════════════════════════════════════════════
   jsonResponse — helper to return JSON with CORS
   ═══════════════════════════════════════════════════ */
function jsonResponse(obj) {
  var output = ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

/* ═══════════════════════════════════════════════════
   OPTIONAL UTILITIES
   ═══════════════════════════════════════════════════ */

/**
 * sendOrderConfirmationEmail
 * ──────────────────────────
 * Uncomment and call this inside saveOrder() if you want
 * to receive an email notification for every new order.
 *
 * Usage inside saveOrder():
 *   sendOrderConfirmationEmail(data);
 */
/*
function sendOrderConfirmationEmail(data) {
  var recipient = Session.getActiveUser().getEmail(); // your email
  var subject   = "New Don Trove Order — " + data.orderRef;
  var body      =
    "New order received!\n\n" +
    "Ref:     " + data.orderRef      + "\n" +
    "Name:    " + data.senderName    + "\n" +
    "Phone:   " + data.phone         + "\n" +
    "City:    " + data.city          + "\n" +
    "Address: " + data.address       + "\n" +
    "Items:   " + data.items         + "\n" +
    "Total:   PKR " + data.total     + "\n" +
    "Notes:   " + (data.notes || "—") + "\n";

  MailApp.sendEmail(recipient, subject, body);
}
*/

/**
 * testSaveOrder
 * ─────────────
 * Run this function manually from the Apps Script editor
 * (Run → testSaveOrder) to verify the sheet setup works
 * before going live.
 */
function testSaveOrder() {
  saveOrder({
    orderRef:      "DT-TEST001",
    senderName:    "Test Customer",
    phone:         "0300-1234567",
    city:          "Karachi",
    address:       "123 Test Street",
    items:         "Digital Planner x1, Textured Notebook x2",
    subtotal:      5500,
    deliveryFee:   200,
    total:         5700,
    paymentMethod: "COD",
    notes:         "Gift wrapping please",
  });
  Logger.log("Test order written to sheet.");
}
