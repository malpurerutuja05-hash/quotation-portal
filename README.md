# 🏗️ OM TRADERS (Kalwan, Nashik)
### Building & Plumbing Material Supplier — Customer Quotation & Order Portal

A modern, high-conversion commercial website built specifically for **Om Traders (Kalwan, Nashik)** featuring an **instant customer quotation generator**, direct **WhatsApp order sharing**, an **admin Excel rate list uploader** with auto-column mapping, and a **1-click Excel export for all customer enquiries**.

Designed to be **100% compatible with GitHub Pages** — requires **zero server installation**, zero database setup, and zero build commands!

---

## 🌐 How to Make Your Domain Start with "OM Traders"

When hosting on GitHub Pages, GitHub automatically formats your web address based on your repository name:

```text
https://<your-github-username>.github.io/<repository-name>/
```

### Option A: Free GitHub Address starting with `om-traders` (Recommended)
1. When you create your new repository on [GitHub](https://github.com/new), set the **Repository name** to:
   👉 **`om-traders`**
2. Upload the files from this folder (`index.html`, `app.js`, `styles.css`, `sample-catalog.csv`).
3. Enable GitHub Pages in **Settings > Pages > Branch: main / root**.
4. Your live website link will automatically start with `om-traders`:
   > 🔗 **`https://<your-username>.github.io/om-traders/`**

### Option B: Using an Organization Name
* If you create a free GitHub Organization named `om-traders`, and create a repository named `om-traders.github.io`, your site address will be:
  > 🔗 **`https://om-traders.github.io/`**

### Option C: Custom Domain (e.g., `omtraders.com` or `omtraders.in`)
* If you have purchased a domain name, simply go to your GitHub repository **Settings > Pages > Custom domain**, type your domain name (e.g., `omtraders.in`), and click **Save**. GitHub Pages will automatically provide free SSL certificates (HTTPS).

---

## 🚀 Key Features Built to Match Your Design

### 👤 Customer Experience (Matching Lovable Screenshot)
- **Professional Company Header**:
  - Sacred **ॐ** in vibrant orange logo box.
  - **OM TRADERS** in bold corporate font.
  - Subtitle: **KALWAN, NASHIK**.
  - Navigation: **Home**, **Products**, **Get Quotation**, **Login**, and **Register**.
  - Live **Quotation Cart pill** showing selected item count and real-time total.
- **Hero Warehouse Banner**:
  - Authentic hardware & plumbing warehouse background with dark navy overlay.
  - Location badge: **`KALWAN, NASHIK, MAHARASHTRA`**.
  - Headline: **Everything you need to <span style="color:#ea580c">build</span>, fix and finish.**
  - Subtitle: *"Om Traders supplies hardware, plumbing and building materials. Browse our catalogue and get an instant estimated quotation online."*
  - CTA buttons: `Get a quotation →` and `View products`.
- **Interactive 3-Step Process (All Steps are Clickable)**:
  - **Step 1: Select Items & Quantities** -> Clicks directly to the products list and highlights it.
  - **Step 2: Review & Calculate Quote** -> Clicks to open the instant quotation calculation drawer.
  - **Step 3: Download or Submit** -> Clicks to download the official PDF quotation or share via WhatsApp.
- **Live Materials Rate List**:
  - Filter by tabs: *Cement & Aggregates*, *Steel & TMT*, *Plumbing & Pipes*, *Sanitary & Fittings*, *Waterproofing*, *Bricks*, *Finishing & Paint*.
  - Quantity selectors with +/- controls and "Add to Quote" buttons.
- **Direct WhatsApp Quote Sharing**:
  - Pre-populates the complete itemized quotation, quantities, and totals directly into WhatsApp to chat with Om Traders.
- **Download Official Quotation (PDF)**:
  - Formatted invoice layout with Om Traders business header, GST calculations, quotation reference ID, date, customer name, and terms & conditions.

---

### 🛡️ Admin Portal (Upload Excel & Download Enquiries)
- **Access**: Click **"Login"** in the top right header (Default password: **`Amit@OmTraders`** or **`admin123`**).
- **Smart Excel Rate List Uploader**:
  - Drag & drop any `.xlsx`, `.xls`, or `.csv` spreadsheet.
  - **Smart Header Detection**: Detects header rows even if your Excel file has titles on Row 1 or 2.
  - **Auto-Mapping**: Recognizes column names like `Particulars`, `Material`, `Item`, `Rate`, `Price`, `UOM`, `Unit`, `Category`.
  - **Auto-Categorization**: Automatically sorts products into appropriate categories (Cement, Pipes, Steel, Sanitaryware, etc.) even if your Excel sheet doesn't have a category column!
  - **Instant Live Publishing**: Clicking **"Publish to Website Now"** automatically switches to the customer view and highlights the new products live on the website!
- **Download Customer Enquiries as Excel**:
  - Under the **Customer Enquiries** tab, click **"Export to Excel"** to download all leads, customer phone numbers, emails, and requested materials as a formatted `.xlsx` report (`Customer_Enquiries_Report_YYYY-MM-DD.xlsx`).

---

## 📁 Project Structure

```text
business-quotation-website/
├── index.html                 # Complete Single-Page Application (Customer, Admin & Recovery views)
├── app.js                     # SheetJS Excel parser, Quotation engine, Lead capture & Multi-device auth
├── styles.css                 # Custom styling, warehouse hero, and print invoice layout
├── sample-catalog.csv         # Ready-to-test Building & Plumbing materials rate list
└── README.md                  # Complete deployment, password recovery, and usage instructions
```

---

## ⚡ Quick Start (Local Testing)

1. Open the folder [`business-quotation-website`](file:///c:/Users/malpu/OneDrive\Documents\Antigravity\business-quotation-website) on your computer.
2. Double-click **`index.html`** to open it in Chrome or Edge.
3. Everything works immediately without any installation!
   - Click **"View products"** or **"Select Items & Quantities"** to browse materials.
   - Click **"Get a quotation"** or **"Review & Calculate Quote"** to view calculations.
   - Click **"Login"** (password: `Amit@OmTraders` or `admin123`) to upload Excel files or download leads!

---

## 🔐 Admin Credentials, Multi-Device Sync & Email Recovery

### 1. Universal Admin Master Passwords (Works for ALL Devices)
Any of the following master passwords can be used on any phone, laptop, or desktop across the world:
* **`Amit@OmTraders`** *(Primary Default)*
* **`admin123`**
* **`omtraders`**
* **`Amit@123`**
* **`omtraders123`**

### 2. Multi-Device Password Reset
- An administrator can reset or update the admin passcode from **any device** at any time.
- Simply log in, go to **Admin Dashboard -> Business Settings -> Change Admin Passcode**, enter your new password, and click **"Update & Sync"**.
- This updates the local device storage, syncs with the remote cloud key-value store, and automatically dispatches a notification email to **`Amit.omtraders@gmail.com`**.

### 3. Forgot Password / Email Recovery System
If an administrator forgets the password or accesses the website from a brand new device:
1. Click **"Login"** in the top navigation bar.
2. Click **"Forgot Password?"**.
3. Click **"Send Password to Amit.omtraders@gmail.com"**.
4. An automated email is immediately dispatched to **`Amit.omtraders@gmail.com`** containing:
   - Current active password
   - Universal master backup password (`Amit@OmTraders`)
   - A unique 6-digit verification security OTP
5. You can log in directly with the received password or enter the 6-digit verification code (or master emergency PIN: **`Amit789`**) directly on the recovery screen to set a new password on that device!

### 4. Direct Email Client Fallback
- A direct **"Open Gmail / Email App Directly"** (`mailto:Amit.omtraders@gmail.com`) option is also provided so the administrator can trigger an email recovery instantly with one tap from any mobile browser or desktop mail client.
