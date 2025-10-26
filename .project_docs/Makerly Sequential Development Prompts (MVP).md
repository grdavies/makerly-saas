# **Makerly — Sequential Development Prompts**

**Version:** 2025-10-24

This ordered list of prompts covers the MVP development, starting with the foundation and moving through the core inventory, purchasing, manufacturing, and flow requirements detailed in the full product documentation. The sequence prioritizes **Custom RBAC** and **I18N** to de-risk the project early.

## **Phase 1: Foundation, Security, and Administration (De-risking)**

This phase establishes the foundational security, authentication, internationalization, and permission systems. **Successful completion of this phase mitigates the two highest risks (Custom RBAC and RLS).**

| Order | Prompt Title | Focus Area | Key Deliverable |
| :---- | :---- | :---- | :---- |
| **1.1** | **Core Infrastructure, Auth, and I18N Setup** | Tech Stack, Auth, Settings | Implement Nuxt project, setup **Supabase** connection, sidebase/nuxt-auth, and the **Team/User I18N Config** (currency, date, units) database tables and client-side context. Build the RFC-7807 Plan Gates/Messaging composables. |
| **1.2** | **Custom RBAC Implementation and Admin Flow** | Security, RLS, Admin UI | Build the **dedicated Role Management Screen** UI. Implement the full **Action-Level RBAC** logic using Supabase RLS. Ensure all subsequent API calls are correctly checking the user's custom role permissions against resources. |
| **1.3** | **Onboarding and User Management** | Core User Flows | Implement the full **Onboarding Flow** (Profile → Invites → Create Team → MoR Payment). Build the basic **User Management Screen** allowing Admin to assign users to defined or custom roles. |

## **Phase 2: Core Inventory, Data Definition, and Metadata**

This phase focuses on the fundamental static data structures, the Item Master, and the two new calculated features.

| Order | Prompt Title | Focus Area | Key Deliverable |
| :---- | :---- | :---- | :---- |
| **2.1** | **Units, Locations, and Item Master** | Data Core | Implement the **Units & Conversions** management UI and data structure. Build **Locations & Bins** management. Implement the **Items (Material/Component/FG)** CRUD UI, ensuring **I18N display** for quantities. |
| **2.2** | **Formula Engine Integration** | Technical Feature | Implement the **custom\_field\_defs** and **custom\_field\_values** schemas. Build the **Constrained Formula Engine** logic as a Supabase Edge Function that safely executes simple arithmetic on item save and updates the calculated value. |
| **2.3** | **Inventory Label Printing** | Physical Workflow | Implement the **Inventory Label Printing** feature on the Item Detail page. This must generate a printable label with the item name, location, and a **QR code** linking to the item's detail page. |

## **Phase 3: Transactional Flows, Manufacturing, and Sales Import**

This phase implements the high-volume transactional flows (Purchasing, Manufacturing, Sales) that rely heavily on the stable core and security built in Phases 1 and 2\.

| Order | Prompt Title | Focus Area | Key Deliverable |
| :---- | :---- | :---- | :---- |
| **3.1** | **Purchasing & FIFO Layering** | Core Financials | Implement **Suppliers** and **Purchase Order (PO)** creation. Implement the **Receipts** flow, including **FIFO layer creation** (fifo\_layers) and stock\_ledger entries. Include over-receipt approval logic. |
| **3.2** | **Manufacturing and QA** | Production | Implement **Recipe Revisions** and the **Work Order (WO)** creation/completion flows. Implement material consumption (backflush) and output creation. Implement **QA Test Plan** setup and **Test Run** attachment to the WO. |
| **3.3** | **CSV Sales Import and Reporting** | Final MVP Features | Build the **CSV Order Import** feature, including the error ledger and retry mechanism. Implement the basic **Reporting** views for **Valuation** and **COGS**, pulling data from fifo\_layers and the stock\_ledger for MVP acceptance. |

