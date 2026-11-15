# REST API reference

Base URL: `http://localhost:8080/api`. JSON request/response bodies. Dates are UTC ISO timestamps. IDs are UUID strings. Prices are decimal LKR amounts.

Public endpoints: health, registration, login, catalog GET requests. All other routes require `Authorization: Bearer <accessToken>`. An expired/invalid token returns 401; a missing role returns 403; another customer's order/payment ID returns 404 to avoid disclosing it.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | /health | Public | Startup check |
| POST | /auth/register | Public | Register CUSTOMER; create cart |
| POST | /auth/login | Public | Issue JWT |
| GET | /foods | Public | List non-deleted foods; optional categoryId and search |
| GET | /foods/{id} | Public | Food detail |
| POST | /foods | ADMIN | Create food |
| PUT | /foods/{id} | ADMIN | Update food/status |
| DELETE | /foods/{id} | ADMIN | Archive food and remove it from carts |
| GET | /categories | Public | List categories |
| POST | /categories | ADMIN | Create category |
| PUT | /categories/{id} | ADMIN | Rename category |
| DELETE | /categories/{id} | ADMIN | Delete unreferenced category |
| GET | /cart | Signed-in user | Their persistent cart and totals |
| POST | /cart/items | Signed-in user | Add quantity to food line |
| PUT | /cart/items/{foodId} | Signed-in user | Replace quantity |
| DELETE | /cart/items/{foodId} | Signed-in user | Remove food line |
| DELETE | /cart | Signed-in user | Clear own cart |
| GET | /orders | Signed-in user | Own orders |
| GET | /orders/{id} | Owner or ADMIN | Order details |
| POST | /orders | Signed-in user | Checkout own stored cart |
| PUT | /orders/{id}/cancel | Owner | Cancel own PLACED order |
| PUT | /orders/{id}/status | ADMIN | Validated status transition |
| GET | /admin/orders | ADMIN | All orders |
| GET | /payments | Signed-in user | Own payments; admin sees all |
| GET | /payments/{id} | Owner or ADMIN | Payment detail |
| PUT | /payments/{id}/status | ADMIN | Record cash collection/failure |
| GET | /users/me | Signed-in user | Own profile |
| PUT | /users/me | Signed-in user | Update own name |
| GET | /users | ADMIN | Users without password hashes |

## Authentication

Registration:
```json
{"name":"Test Customer","email":"student@example.test","password":"UseYourOwnTestPassword"}
```

Returns HTTP 201 with `{id,name,email,role}`. Login uses `{email,password}` and returns:
```json
{"accessToken":"<signed JWT>","user":{"id":"<uuid>","name":"Test Customer","email":"student@example.test","role":"CUSTOMER"},"expiresIn":1800}
```

Only fields in the request DTO are accepted. Adding `role: ADMIN` to registration is rejected. Passwords use BCrypt. JWT signature, issuer and timestamps are validated by Spring Security; role claim maps to ROLE_ADMIN / ROLE_CUSTOMER. Use HTTPS outside localhost.

## Catalog

Category create/update: `{"name":"Desserts"}`.

Food create/update:
```json
{"name":"Chicken rice","description":"Freshly prepared rice and chicken","price":1250.00,"categoryId":"<category UUID>","image":"photo-1512058564366-18510be2db19","vegetarian":false,"status":"AVAILABLE"}
```

Use `OUT_OF_STOCK` for unavailable dishes. Food deletion is a soft delete to preserve historical order references. A category containing even archived food records cannot be deleted; rename/reuse it instead. The UI uses the API adapter to map the enum to its display state.

## Cart

Add: `{"foodId":"<food UUID>","quantity":2}`. Update: `{"quantity":3}`. Range: 1–20 per dish. Use DELETE for quantity zero. Food must be AVAILABLE. Cart responses contain `{id,items:[{id,food,quantity}],subtotal,deliveryFee,total}`. Values come from database prices; empty carts have zero fee.

## Checkout

POST /orders with a unique `Idempotency-Key` header (8–64 alphanumeric/hyphen characters, UUID recommended):
```json
{"address":"10 Test Street, Demo City","phone":"0700000000","paymentMethod":"CASH_ON_DELIVERY"}
```

Do not submit userId, item prices, totals or an items list. The server loads the signed-in user's stored cart, checks availability, calculates prices, creates snapshot order items and a PENDING payment, then clears the cart in the same transaction. A duplicate successful key returns the original order without creating another one. Reuse the key only for retrying the same checkout attempt; a new checkout needs a new key.

Order response fields: `id,userId,items,subtotal,deliveryFee,total,address,phone,status,paymentMethod,paymentStatus,paymentId,createdAt`. Each order item contains `id,foodId,foodName,image,unitPrice,quantity`.

## Status rules

Order update: `{"status":"PREPARING"}`.

- PLACED → PREPARING or CANCELLED.
- PREPARING → DELIVERED or CANCELLED.
- DELIVERED and CANCELLED are terminal.
- Customers may cancel only their own PLACED orders.
- Cancelling a pending-payment order marks its payment FAILED. Completed payments block cancellation.

Payment update: `{"status":"COMPLETED"}` or `{"status":"FAILED"}`.

- Only ADMIN can update payments.
- COMPLETED requires the order to be DELIVERED.
- Only PENDING payments can transition; repeated identical status is idempotent.
- This records cash collection; it does not process a card payment or refund.

## Errors

```json
{"status":409,"message":"Food is out of stock","timestamp":"2026-11-15T10:00:00Z"}
```

400 invalid input/empty cart; 401 missing/invalid login; 403 forbidden; 404 missing/not-owned resource; 409 duplicate/conflicting state; 500 unexpected server failure. Security-filter errors contain status/message. API responses do not expose database exceptions, password hashes or stack traces.
