# **Makerly — Schema Design (key entities)**

**Version:** 2025-10-24 (I18N Fields Explicitly Defined)

## **Tenancy & Security**

* team\_id on all rows; **RLS** policies ensure isolation.  
* Soft delete for content (archive flags); hard delete for PII on user deletion (with anonymization for audits).  
* Optimistic locking: row\_version (bigint) on write-heavy tables.

## **Inventory Core**

* **items** (material/component/finished\_good), categories.  
* **custom\_field\_defs** (typed, with formula definition) → **custom\_field\_values** (per item, stores calculated output).  
* **stock\_ledger** (immutable transactions: receive, consume, manufacture, transfer, adjust, count).  
* **fifo\_layers** (lot cost layers created on receipt/production; relieved by oldest).  
* **locations**, **bins**, **transfer\_orders**, **transfers** (in-transit).

## **Purchasing**

* **suppliers**, **purchase\_orders**, **po\_lines** (pack → inventory conversion, supplier SKU).  
* **receipts**, **receipt\_lines** (partial, over-receipt flag, landed cost allocation).  
* **returns\_to\_vendor**.

## **Manufacturing & QA**

* **recipes**, **recipe\_revisions**, **recipe\_components**.  
* **work\_orders**, **wo\_operations**, **wo\_consumptions**, **wo\_outputs** (link to fifo\_layers).  
* **test\_plans**, **test\_plan\_revisions**, **test\_runs**, **test\_results** (bound to product+recipe revision).

## **Sales & Channels**

* **channels** (Shopify, Square, etc.), **channel\_interest** (notify-me), **channel\_settings**.  
* **orders**, **order\_lines**, **allocations**, **fulfillments**.  
* **sync\_events** (imports/webhooks with retry state).

## **Plans & Flags**

* **plans**, **capabilities**, **plan\_capabilities** (limit, window), **grace\_windows**.  
* **team\_plan** (current plan), **usage\_counters** (rolling windows).

## **Admin & Audit**

* **users**, **teams**, **team\_members** (role \+ attributes).  
  * **Teams (I18N Config)**: base\_currency\_code (e.g., USD), default\_unit\_family (e.g., metric), default\_date\_format, default\_time\_format.  
  * **Users (I18N Overrides)**: override\_unit\_family, override\_date\_format, override\_time\_format.  
* **audit\_log** (who, when, what, entity, delta/diff).  
* **roles**, **role\_permissions** (action, resource, location\_scope).