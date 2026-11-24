# 🚀 Azad SEO All-In-One Professional Web Suite

> **Official All-In-One Digital Management Suite for Azad SEO**  
> 100% Serverless • Offline-Ready • Client-Side Database • Ready for **GitHub Pages Root Hosting**

---

## 🌟 Overview & Integrated Modules

This suite unifies and significantly improves upon the three desktop software tools into a single, cohesive, modern responsive web application:

1. **Azad SEO Tools Catalog & Package Builder (`tools.js`)**:
   - Comprehensive catalog of all 42+ SEO, AI, Graphic, and E-commerce tools (*SEMrush, Ahrefs, Canva Pro, Word.ai, Freepik, Envato, Copymatic, Jasper, Moz, etc.*).
   - Real-time instant search across tool keywords, names, and usage specifications.
   - Category filtering pills (*SEO / Research, Content & AI, Design & Graphics, E-Commerce, Developer & Indexing*).
   - **Full Tool Management (Add / Edit / Delete)**: Add custom tools, update prices, edit specs, or remove tools anytime with instant IndexedDB persistence.
   - Interactive Floating **Package Builder Dock**: Multi-select tools, apply bundle discounts, copy WhatsApp quotation scripts, or send directly to Invoice Maker.
   - **"Export for GitHub"**: 1-click export of your custom tool catalog so you can update the default tools on your GitHub repository for all visitors worldwide!

2. **Azad SEO Invoice Professional (`invoice.js`)**:
   - Dynamic line items with quantities, 30-day service durations, and unit pricing.
   - 5 Designer Invoice Templates (*Modern Blue*, *Emerald Classic*, *Dark Executive*, *Minimalist Gray*, *Purple Pro*).
   - Real-time client auto-complete and client directory auto-saving.
   - Dynamic Verification QR Code generator (`qrcode.min.js`).
   - High-resolution PDF generation and **Zero-Bleed Isolated Print Engine** (`prepareAndPrint`).
   - Saved Invoices History with 1-click reloading into the editor, status badges, and search.

3. **Azad SEO Salary & Shift Commission System (`salary.js`)**:
   - **Multi-Staff Attendance System**: Intelligently handles both single-person shifts (*Harris Irfan*) and multi-person shifts (*Mehrooz & Zain*).
   - **Individual Attendance Controls**: Each staff member gets their own attendance selector (*Present*, *Absent*, *Leave*, *Half Day*, *Off Day*) with live color coding.
   - **Staff & Shifts Manager**: Add custom shifts, edit roster members, hours, commission rates, and base salaries.
   - Full 1–31 Day Monthly Spreadsheet Grid with real-time keystroke auto-saving.
   - Live KPI dashboard cards: Total Monthly Sales, 2% Sales Commission, Base Salary, Advances/Deductions, Net Payable Salary, and Daily Averages.
   - Official Printable Salary Statement & Pay Slip with individual attendance records and dedicated signature blocks for each staff member.
   - 1-Click CSV / Excel Export.

4. **Settings & GitHub Pages Database Hub (`db.js`, `app.js`)**:
   - Company profile customization (Company Name, Tagline, Phone, Email, Bank Payment details, Invoice prefix).
   - Database metrics and storage statistics.
   - **1-Click Full Database Backup (Export JSON)** and **Restore Backup (Import JSON)**.

---

## ❓ How Saving Works on GitHub Pages: Will Changes Be Saved for Everyone?

> **Question: "If I make changes to tools, settings, or data on GitHub and save it, will it be saved for everyone who accesses it?"**

Here is the exact answer and how to manage it:

### 1. Changes Made on GitHub (Source Code) → ✅ UPDATES FOR EVERYONE WORLDWIDE
* When you host files on GitHub Pages (e.g. `yourname.github.io/azad-seo/`), GitHub serves those exact files to every visitor.
* If you edit files directly in your GitHub repository (for example, updating default prices in `db.js` or replacing `default_tools.json` via our **"Export for GitHub"** button) and commit:
  👉 **YES! Every employee, client, or visitor worldwide who opens your link will immediately see the updated tools, new prices, and company profile!**

### 2. Changes Made in the Browser (IndexedDB) → 🔒 SAVED LOCALLY ON THAT DEVICE
* When you or an employee opens the web app and types a daily sale, creates an invoice, or marks attendance, that data is saved inside **that specific computer or phone's IndexedDB**.
* **Why this is great**: Visitors or clients cannot accidentally delete your salary logs or mess up other employees' shifts!
* **How to share/sync data between devices**:
  * **Option A (Instant JSON Export/Import)**: Go to **Settings & Data** → Click **"Export JSON Backup"** → send the file to another computer or phone → click **"Import JSON Backup"**. Done in 2 seconds!
  * **Option B (Free Google Firebase Real-Time Sync)**: You can connect free Firebase Firestore so all computers and phones automatically synchronize live without needing any backend server.

---

## 🌐 Deploying to GitHub Pages in 60 Seconds

All 14 files in this folder are designed to live in the **same root directory**, making deployment completely effortless:

1. Create a new repository on [GitHub.com](https://github.com) (e.g. `azad-seo-suite`).
2. Upload all files from this directory directly into the repository root:
   - `index.html`
   - `style.css`
   - `assets_base64.js`
   - `db.js`
   - `tools.js`
   - `salary.js`
   - `invoice.js`
   - `app.js`
   - `dexie.min.js`
   - `html2pdf.bundle.min.js`
   - `qrcode.min.js`
   - `logo.png`
   - `icon.png`
   - `README.md`
3. In your GitHub repository, click on **Settings** (top menu) → **Pages** (left sidebar).
4. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: `main` (or `master`)
   - Folder: `/ (root)`
5. Click **Save**.
6. GitHub will provide your live URL within seconds:  
   👉 `https://<your-username>.github.io/<repository-name>/`

---

## 💻 Running Offline on Your Local Computer

You don't even need internet access or a web server to use this suite!

- Simply double-click **`index.html`** in this folder.
- It will open immediately in your default browser with all libraries (Dexie, QRCode, html2pdf, Base64 assets) loaded locally!

---

© 2026 Azad SEO. All rights reserved.
