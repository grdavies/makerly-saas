# **Makerly — User Flows (MVP)**

**Version:** 2025-10-24 (RBAC, I18N, Label Printing Added)

## **Onboarding**

1. **Profile** → update name, email confirmed.  
2. **Invites** → accept/decline pending team invites.  
3. If no team: **Create team** → choose plan → **payment (MoR)** → Dashboard.

## **Inventory Demo Flow**

* Create items & categories → PO → partial receive (pack→inventory conversion) → **Print Item Label (QR)** → min-level triggers alert → create **Work Order** → complete → FIFO layers created → valuation/COGS reflect batch.

## **Manufacturing Flow**

* Create recipe → approve → create work order → issue materials (backflush/manual) → capture yield/scrap → produce finished lot (fifo layer) → QA test run attached to recipe revision.

## **Administration Flow (New)**

* **Team Settings**: Admin accesses settings → defines **Base Currency**, **Default Unit Family**, and **Date/Time formats**.  
* **Role Management**: Admin creates/edits custom roles → assigns CRUD permissions by Resource/Action → assigns users to Predefined/Custom roles.  
* **User Profile**: User overrides **Date/Time format** and **Display Unit Family** from team defaults.

## **Exception Flows**

* **Over-receipt \> 5%** → approval required.  
* **Cycle count variance \> ±2% or \> $250** → approval gate.  
* **Negative stock** → blocked (prompt allocate later / admin override).  
* **Failed import** → error ledger with reprocess.

## **Sales**

* Sales → Channels (disabled cards \+ Notify me).  
* Sales → Sync History (logs/retries).  
* CSV order import → allocations → fulfillments.

## **Upgrade Experience**

* Global banner while in grace/over limit \+ inline per-feature gates.  
* Upgrade → planShip/nuxt matrix → apply capabilities immediately; usage counters recalc; grace cleared.