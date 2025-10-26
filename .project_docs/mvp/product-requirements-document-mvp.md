# **Makerly — Product Requirements Document (MVP)**

**Version:** 2025-10-24

## **1\. Purpose & Vision**

Makerly helps solo makers and small teams track inventory, manufacture products reliably, and reconcile sales—without wrestling spreadsheets. It emphasizes lot-true inventory, simple manufacturing, and clear limits/plan gating.

### **Roadmap**

* **v1 (MVP):** Core Inventory, Purchasing, Manufacturing, Custom RBAC, FIFO, **CSV Sales Import**. (Focus of this PRD)  
* **v2:** Core Sales Integrations (Shopify, Etsy, etc.), Token Management.  
* **v3:** Order Imports (OCR/Email/Vendor API), Advanced Reporting.  
* **v4:** AI Recipe Assistant (Wicking suggestions, yield optimization).  
* **v5:** Dedicated Product Analytics.

## **2\. Personas & Jobs**

* **Solo Maker**: sets up items, receives materials, makes small batches, sells on one channel.  
* **Small Team**: multiple locations/bins, shared work orders, purchase & receiving separation.

**Top Jobs for MVP**

1. Build accurate inventory (materials, components, finished goods) with FIFO lot costing.  
2. Manufacture reliably (recipes/BOM revisions, work orders, QA test plans).  
3. Reconcile sales and plan channel integrations (Sales → Channels hub; CSV \+ Shopify later).

## **3\. Scope (MVP)**

### **Included**

* Inventory with **Stock Transactions** ledger and **FIFO** lot layers.  
* Purchasing: POs, partial receipts, over-receipts w/ approval, RTV, landed cost allocation.  
* Locations & bins; transfer orders with in-transit state; min levels.  
* **Units & conversions** with families (mass, volume, count, length, area, temperature); per-material density; **Nested UoM**.  
* **Calculable Metadata (Formula Engine)**: Simple arithmetic (+, \-, \*, /) only, operating only on `items`, calculated only upon save.  
* Manufacturing: versioned recipes/BOMs; work orders; sub-recipes; **QA test plans**.  
* Sales: **Sales → Channels** hub (disabled cards \+ "Notify me"), **CSV order import**, Sync History.  
* Reporting: saved views \+ CSV export (valuation, on hand, slow movers, COGS period, yield, sales by channel/product).  
* **Custom Role-Based Access Control (RBAC)**: User-defined roles with permissions scoped by action, resource, and location.  
* **Internationalization (I18N) & Multi-Currency:** Team-level base currency, date/time format, default unit family. User overrides for non-currency formatting. Multi-currency for **display/formatting only** (all core financials remain in Base Currency).  
* **Inventory Label Printing:** Print labels for items with **QR code** linking to the Item Detail page.

### **Not Included (MVP)**

* **AI/LLM Features:** (v4)  
* **Advanced Sales Integrations:** Shopify, Square, PayPal, WooCommerce, Wix, Faire, Amazon Handmade, Etsy. (v2)  
* **Order Import Automation:** OCR, email forwarding, vendor API integration. (v3)  
* **Dedicated Product Analytics:** (v5)

## **4\. Acceptance Criteria**

* Users can create items, receive stock, and complete a work order without support.  
* Inventory valuation and COGS reports reflect FIFO accuracy for sample scenarios.  
* “Notify me” interest captured per channel.

## **6\. Constraints & Targets**

* Scale targets: \~10k SKUs, \~200 orders/day, 10 locations, 10 users/team.  
* MoR for payments (future-proofing); $0 plans stored in app DB only.  
* Hosting: Vercel \+ Supabase; Redis marketplace add-on; Vercel Cron.  
* **Frontend Framework:** Must use **Nuxt 4** for compatibility with Nuxt UI.

## **7\. Exception Handling (MVP rules)**

* **Over-receipts:** allow up to **\+5%** with approval; block otherwise.  
* **Cycle counts:** auto-post; approvals for variances \> **±2%** or **\>$250**.  
* **Negative stock:** blocked; backflush prompts allocation later or admin override.  
* **Failed imports:** row-level error log; resubmit flows; batch cap 5k.  
* **Webhooks:** exponential backoff, max 10 retries; visible retry state.

## **8\. Plan Gates & Messaging**

* Backend returns **RFC-7807** `application/problem+json` with fields: `code`, `feature_id`, `limit`, `used`, `remaining`, `grace.active`, `grace.expires_at`, `upgrade_url`, `user_message`.  
* Frontend shows **global** status (grace/over-limit) **and** **inline** per-feature messaging with CTAs.

## **9\. Onboarding (MVP)**

Flow: Profile → process invites → (if none) create team → choose plan → **payment (MoR)** → Dashboard.

