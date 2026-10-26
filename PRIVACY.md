# Privacy and Booking Data

This is an operational data inventory, not a legal privacy notice. It records what the application stores, why, who can reach it, and how an admin can export or delete it. Legal review and the public consent wording are still required before launch.

## Data collected

A booking can contain:

- booking code, idempotency key, service type and name, travel date, number of guests, status, created and updated timestamps;
- customer name, WhatsApp number, optional notes, and site locale;
- for travel bookings: origin and destination labels, origin and destination coordinates, GPS accuracy and source, pickup time, routed distance, and estimated price.

The site does not collect payment card data or create customer accounts. Payment and final confirmation happen outside the site through WhatsApp.

## Why it is collected

- Name and WhatsApp number let the team confirm the booking and contact the customer.
- Travel date, guests, service, and notes let the team plan the trip.
- Pickup and destination coordinates are used to calculate the road route and estimate the travel price, and to tell the driver where to go.
- Status and timestamps support admin follow-up.

## Location data

Coordinates are stored only for the pickup point and destination the customer selected. The application does not track location in the background, does not store a location history, and does not expose booking coordinates in the public catalog, sitemap, structured data, or public API.

During a travel quote, coordinates are sent to the configured road-routing provider. Address searches are sent to the configured geocoding provider. Those providers process the request to return a route or place result; the application does not add customer name or WhatsApp number to those requests.

Coordinates are kept with the booking because operations need the pickup point for dispatch and customer support. If precise coordinates are not needed for a future service type, do not add them to that service's detail schema.

## Who can access it

- Authenticated admin users can read bookings through the admin page and admin-only APIs.
- The CSV export endpoint is admin-only and sends `Cache-Control: no-store`.
- Convex and hosting operators with deployment or database access can reach stored data as part of running the service.
- Booking data is not returned by public catalog or booking-creation responses; the public response only returns the booking code.

## Retention target

The current operating target is:

- booking records: delete 12 months after the travel date, or earlier when the customer requests deletion and there is no open operational or legal need to keep them;
- removed catalog media: delete permanently on the next successful catalog save, as implemented in `catalog:save`; the admin confirmation warns that there is no undo, so keep an approved backup before removing media that may be needed again;
- orphaned uploads that were never saved: review monthly and delete; client-side cleanup is not implemented, so an upload abandoned before a catalog save remains until this manual review;
- application logs: the application does not write booking payloads or secrets to logs. Hosting and database logs follow the provider's retention settings.

This period and the public privacy notice still require owner and legal approval. Automated expiry cleanup is not implemented yet, so the process below is manual until a scheduled cleanup is added.

## Export and deletion process

Export:

1. Sign in to the admin page and open **Pemesanan**.
2. Choose **Unduh CSV**, or send an authenticated `GET /api/admin/bookings/export`.
3. The CSV includes the entire booking history, read page by page without a silent row cap. A large export may take longer. The file is UTF-8 with a BOM, escapes spreadsheet formula prefixes, and is served with `no-store`.

Delete a booking:

1. In **Pemesanan**, choose **Hapus** for the booking and confirm the prompt.
2. Alternatively, send an authenticated `DELETE /api/admin/bookings/<id>` with a trusted `Origin` header.
3. The mutation deletes the booking and its `bookingRequests` idempotency record. A successful response is `204`; a missing booking returns `404`.

Both routes require an active admin session. The delete route also passes through the application's trusted-origin check. Backup copies may remain until the provider's backup rotation completes, so a deletion request is not complete until that window has passed.

## Verification

- `tests/bookings-csv.test.js` covers CSV escaping, formula-injection protection, headers, and BOM output.
- `tests/booking-data.test.js` covers booking deletion, idempotency-record cleanup, and missing records.
- `tests/request-security.test.js` covers trusted-origin enforcement for admin mutation paths.
