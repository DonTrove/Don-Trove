/**
 * Don Trove — Google Apps Script Backend
 * =========================================
 * SHEET STRUCTURE — Products:
 *   Name | Price | Description | Image 1 | Image 2 | Image 3 | Image 4 | Image 5 | Category | Active | Colors | Sizes
 *
 *   Image 1–5: Each column holds one image URL.
 *     Leave blank or write NO if a product has fewer than 5 images.
 *
 *   Colors: comma-separated color names or hex codes
 *     e.g. Red,Navy Blue,#F5C2D0
 *     Leave blank if no colour options.
 *
 *   Sizes: comma-separated label:price pairs
 *     e.g.  A5:500,A4:800,A3:1200
 *     Single size / no size options → leave blank or write "none"
 *
 * SHEET STRUCTURE — Orders:
 *   Order Ref | Date/Time | Sender Name | Phone | Email |
 *   Recipient Name | Delivery Address | Delivery Date | Occasion |
 *   Gift Message | Items | Subtotal (PKR) | Gift Wrap |
 *   Delivery Fee (PKR) | Total (PKR) | Payment Method
 */

const SPREADSHEET_ID = '1l1pIsSdVIbbu0AEEEJvDhlhinA4nGimT-ZSBGX0oLbY';
const PRODUCTS_SHEET  = 'Products';
const ORDERS_SHEET    = 'Orders';

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

// ══ doGet ════════════════════════════════════════════════════════════════════
function doGet(e) {
  try {
    const ss    = getSpreadsheet();
    let   sheet = ss.getSheetByName(PRODUCTS_SHEET);

    if (!sheet) {
      sheet = ss.insertSheet(PRODUCTS_SHEET);
      sheet.appendRow([
        'Name','Price','Description',
        'Image 1','Image 2','Image 3','Image 4','Image 5',
        'Category','Active','Colors','Sizes'
      ]);
      sheet.setFrozenRows(1);
      return jsonResponse([]);
    }

    const rows    = sheet.getDataRange().getValues();
    if (rows.length <= 1) return jsonResponse([]);

    const headers = rows[0].map(h => String(h).trim().toLowerCase());

    const col = {
      name:        headers.indexOf('name'),
      price:       headers.indexOf('price'),
      description: headers.indexOf('description'),
      image1:      headers.indexOf('image 1'),
      image2:      headers.indexOf('image 2'),
      image3:      headers.indexOf('image 3'),
      image4:      headers.indexOf('image 4'),
      image5:      headers.indexOf('image 5'),
      category:    headers.indexOf('category'),
      active:      headers.indexOf('active'),
      colors:      headers.indexOf('colors'),
      sizes:       headers.indexOf('sizes'),
    };

    const products = rows.slice(1)
      .filter(row => {
        const active  = col.active >= 0 ? String(row[col.active]).toUpperCase() : '';
        const hasName = col.name   >= 0 && String(row[col.name]).trim() !== '';
        return hasName && active === 'YES';
      })
      .map(row => {

        // ── Images (up to 5 separate columns, skip blank or "NO") ──
        const imageColumns = [col.image1, col.image2, col.image3, col.image4, col.image5];
        const images = imageColumns
          .map(c => c >= 0 ? String(row[c]).trim() : '')
          .filter(url => url !== '' && url.toUpperCase() !== 'NO');

        // ── Colors (comma-separated) ──
        const rawColors = col.colors >= 0 ? String(row[col.colors]).trim() : '';

        // ── Sizes: "A5:500,A4:800,A3:1200" → [{label:"A5", price:500}, ...]
        // If blank or "none" → empty array (no size UI shown)
        const rawSizes  = col.sizes >= 0 ? String(row[col.sizes]).trim() : '';
        const basePrice = col.price >= 0 ? Number(row[col.price]) : 0;
        const sizes = (rawSizes && rawSizes.toLowerCase() !== 'none' && rawSizes !== '')
          ? rawSizes.split(',')
              .map(s => {
                const parts = s.trim().split(':');
                const label = parts[0].trim();
                // If price provided use it, otherwise fall back to base price
                const price = parts.length > 1 ? Number(parts[1]) : basePrice;
                return { label, price };
              })
              .filter(s => s.label)
          : [];

        return {
          name:        col.name        >= 0 ? String(row[col.name]).trim()        : '',
          price:       col.price       >= 0 ? Number(row[col.price])              : 0,
          description: col.description >= 0 ? String(row[col.description]).trim() : '',
          imageUrl:    images[0] || '',
          images,                         // ← array of valid image URLs only
          category:    col.category    >= 0 ? String(row[col.category]).trim()    : '',
          colors:      rawColors,
          sizes,                          // ← array of {label, price}
        };
      });

    return jsonResponse(products);
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

// ══ doPost ═══════════════════════════════════════════════════════════════════
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const ss      = getSpreadsheet();
    let   sheet   = ss.getSheetByName(ORDERS_SHEET);

    if (!sheet) {
      sheet = ss.insertSheet(ORDERS_SHEET);
      sheet.appendRow([
        'Order Ref','Date/Time','Sender Name','Phone','Email',
        'Recipient Name','Delivery Address','Delivery Date','Occasion',
        'Gift Message','Items','Subtotal (PKR)','Gift Wrap',
        'Delivery Fee (PKR)','Total (PKR)','Payment Method',
      ]);
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      payload.orderRef      || '',
      payload.dateTime      || new Date().toLocaleString(),
      payload.senderName    || '',
      payload.phone         || '',
      payload.email         || '',
      payload.recipientName || '',
      payload.address       || '',
      payload.deliveryDate  || '',
      payload.occasion      || '',
      payload.giftMessage   || '',
      payload.items         || '',   // includes [size] and (color) per item
      payload.subtotal      || 0,
      payload.giftWrap      || 0,
      payload.deliveryFee   || 0,
      payload.total         || 0,
      payload.paymentMethod || '',
    ]);

    return jsonResponse({ success: true, orderRef: payload.orderRef });
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
