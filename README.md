# 🎁 Don Trove — Curated Gifts Storefront

A lightweight, elegant gift shop frontend powered by a **Google Sheet** as the product catalogue and a **Google Apps Script** as the backend. No server, no database, no npm — just open `index.html` and deploy.

![Don Trove Preview](docs/preview.png)

---

## ✨ Features

- **Product catalogue** pulled live from a Google Sheet
- **Shopping cart** with quantity controls and gift-wrap add-on
- **Checkout flow** — sender info, recipient details, occasion, gift message
- **4 payment methods** — Cash on Delivery, EasyPaisa, JazzCash, Bank Transfer
- **Order recording** — every order is saved to an Orders sheet automatically
- **Admin view** — hidden at `index.html#manage-dt-admin`
- **Responsive design** — works on mobile, tablet, and desktop
- Zero dependencies — pure HTML, CSS, and vanilla JS

---

## 📁 Project Structure

```
don-trove/
├── index.html          # Main storefront page
├── css/
│   └── style.css       # All styles
├── js/
│   └── app.js          # All application logic
├── docs/
│   └── Code.gs         # Google Apps Script backend (paste into script.google.com)
└── README.md
```

---

## 🚀 Quick Start

### 1. Set up the Google Sheet

1. Create a new [Google Sheet](https://sheets.google.com).
2. Add a sheet tab named **Products** with these columns in row 1:

   | A    | B     | C           | D         | E      |
   |------|-------|-------------|-----------|--------|
   | Name | Price | Description | Image URL | Active |

3. Add your products in the rows below. Set **Active** to `YES` to show a product, `NO` to hide it.
4. Copy the **Spreadsheet ID** from the URL:
   `https://docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`

### 2. Deploy the Google Apps Script

1. Go to [script.google.com](https://script.google.com) → **New project**.
2. Replace all code with the contents of `docs/Code.gs`.
3. Replace `YOUR_SPREADSHEET_ID_HERE` with your actual Sheet ID.
4. Click **Deploy → New deployment**:
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy** and copy the web app URL.

### 3. Connect the frontend

Open `js/app.js` and paste your deployment URL:

```js
const CONFIG = {
  SHEET_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_URL/exec',
  // ...
};
```

### 4. Open in browser

Simply open `index.html` in any modern browser — no build step needed.

---

## 🌐 Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Source: **Deploy from a branch** → `main` → `/ (root)`.
4. Your store will be live at `https://yourusername.github.io/don-trove/`.

---

## 🔒 Admin Panel

Navigate to:
```
index.html#manage-dt-admin
```
This shows a read-only product list. Product management is done directly in the Google Sheet.

---

## 💳 Payment Methods

| Method            | Notes                          |
|-------------------|--------------------------------|
| Cash on Delivery  | Default; no extra steps needed |
| EasyPaisa         | Customer sends to your number  |
| JazzCash          | Customer sends to your number  |
| Bank Transfer     | Customer transfers before delivery |

> Payment is handled manually — Don Trove does not process payments online. Orders are recorded in your Google Sheet for follow-up.

---

## 🎨 Customisation

| What                | Where                        |
|---------------------|------------------------------|
| Brand name & colours | `css/style.css` → `:root`   |
| Delivery fee         | `js/app.js` → `CONFIG`      |
| Gift wrap fee        | `js/app.js` → `CONFIG`      |
| Currency label (PKR) | Search & replace in `app.js` |
| Occasion list        | `index.html` → `<select id="occasion">` |

---

## 📦 Orders Sheet (Auto-Created)

When the first order is placed, a **Orders** sheet is created automatically with these columns:

`Order Ref | Date/Time | Sender Name | Phone | Email | Recipient Name | Delivery Address | Delivery Date | Occasion | Gift Message | Items | Subtotal | Gift Wrap | Delivery Fee | Total | Payment Method`

---

## 📄 License

MIT — free to use, modify, and deploy.

---

*Built with 💜 for Don Trove*
