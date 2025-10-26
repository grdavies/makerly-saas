# **Makerly — AI Coding Configuration (Constraint Guide)**

**Version:** 2025-10-24 (Audited for RBAC, Formulas, I18N)

This document contains the consolidated technical constraints, dependencies, and design tokens required for all subsequent coding prompts. This data should be strictly adhered to.

## **1\. Tech Stack & Dependencies**

* **Frontend:** Nuxt 3 (Monorepo web package)  
* **UI Framework:** Nuxt UI Pro (using Tailwind CSS)  
* **State Management:** Pinia  
* **Database:** Supabase Postgres (with nuxtjs/supabase)  
* **Business Logic:** Supabase Edge Functions (Deno/TypeScript)

## **2\. Core Schema Snippets (Postgres/Supabase)**

### **A. Tenancy, I18N, & Core Tables (Updated)**

All tables MUST include team\_id and be protected by RLS.

\-- Core Tenancy & I18N Configuration  
CREATE TABLE teams (  
    id uuid PRIMARY KEY,  
    name text NOT NULL,  
    base\_currency\_code text NOT NULL,        \-- e.g., 'USD'. Base for COGS.  
    default\_unit\_family text NOT NULL,       \-- e.g., 'METRIC', 'IMPERIAL'  
    default\_date\_format text NOT NULL,       \-- e.g., 'YYYY-MM-DD'  
    default\_time\_format text NOT NULL  
);

CREATE TABLE users (  
    id uuid PRIMARY KEY,  
    team\_id uuid REFERENCES teams(id),  
    \-- I18N Overrides (NULL means use team default)  
    override\_unit\_family text,  
    override\_date\_format text,  
    override\_time\_format text  
);

\-- Core Inventory Items  
CREATE TABLE items (  
    id uuid PRIMARY KEY,  
    team\_id uuid REFERENCES teams(id),  
    name text NOT NULL,  
    item\_type text CHECK (item\_type IN ('MATERIAL', 'COMPONENT', 'FINISHED\_GOOD')),  
    base\_uom text NOT NULL, \-- Base Unit of Measure  
    min\_level numeric DEFAULT 0  
);

\-- Locations  
CREATE TABLE locations (  
    id uuid PRIMARY KEY,  
    team\_id uuid REFERENCES teams(id),  
    name text NOT NULL  
);

\-- Stock & Costing  
CREATE TABLE stock\_ledger (  
    id uuid PRIMARY KEY,  
    team\_id uuid REFERENCES teams(id),  
    item\_id uuid REFERENCES items(id),  
    location\_id uuid REFERENCES locations(id),  
    transaction\_type text NOT NULL, \-- e.g., 'RECEIVE', 'CONSUME', 'ADJUST'  
    quantity numeric NOT NULL,  
    unit\_cost numeric \-- Cost at the time of transaction (in Base Currency)  
);  
CREATE TABLE fifo\_layers (  
    id uuid PRIMARY KEY,  
    team\_id uuid REFERENCES teams(id),  
    item\_id uuid REFERENCES items(id),  
    location\_id uuid REFERENCES locations(id),  
    quantity\_remaining numeric NOT NULL, \-- What's still available  
    unit\_cost numeric NOT NULL,          \-- In Base Currency  
    receipt\_date timestamp with time zone NOT NULL  
);

### **B. Custom RBAC (New)**

\-- Roles and Permissions for Custom RBAC  
CREATE TABLE roles (  
    id uuid PRIMARY KEY,  
    team\_id uuid REFERENCES teams(id),  
    name text NOT NULL,  
    is\_custom boolean DEFAULT TRUE \-- FALSE for system roles (Admin, Member)  
);

CREATE TABLE role\_permissions (  
    role\_id uuid REFERENCES roles(id),  
    resource text NOT NULL,          \-- e.g., 'inventory\_item', 'work\_order'  
    action text NOT NULL,            \-- e.g., 'CREATE', 'READ', 'UPDATE', 'DELETE'  
    location\_scope text DEFAULT 'ANY', \-- e.g., 'ANY', 'SELF\_CREATED', or specific location ID (omitted for MVP constraint)  
    PRIMARY KEY (role\_id, resource, action)  
);

CREATE TABLE team\_members (  
    user\_id uuid REFERENCES users(id),  
    team\_id uuid REFERENCES teams(id),  
    role\_id uuid REFERENCES roles(id),  
    PRIMARY KEY (user\_id, team\_id)  
);

### **C. Formula Engine (New)**

\-- Formula Definitions and Calculated Values  
CREATE TABLE custom\_field\_defs (  
    id uuid PRIMARY KEY,  
    team\_id uuid REFERENCES teams(id),  
    name text NOT NULL,  
    target\_entity text NOT NULL CHECK (target\_entity \= 'ITEM'),  
    formula\_string text NOT NULL \-- e.g., 'field\_a \* (field\_b / 100)'  
);

CREATE TABLE custom\_field\_values (  
    custom\_field\_def\_id uuid REFERENCES custom\_field\_defs(id),  
    entity\_id uuid REFERENCES items(id), \-- Only on items for MVP  
    calculated\_value numeric,  
    PRIMARY KEY (custom\_field\_def\_id, entity\_id)  
);

### **D. Core Business Logic Rules (Updated)**

* ***Location-Specific FIFO Rule:*** *When consuming inventory (e.g., in a Work Order), the system must always relieve the oldest available **fifo\_layers** associated with the specific **location\_id** designated for consumption.*  
* ***Formula Engine Sandboxing (CRITICAL):*** *The **formula\_string** must be executed exclusively within a **secure, sandboxed Supabase Edge Function (Deno)** environment. Direct usage of eval() or similar functions within the Node.js/Nuxt application is strictly **forbidden** due to security risk.*  
* ***Currency Constraint:*** *The **unit\_cost** stored in both **stock\_ledger** and **fifo\_layers** must always be denominated in the **teams.base\_currency\_code**.*