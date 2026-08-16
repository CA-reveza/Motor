# MoveIT

A Porter-style on-demand logistics app: customers book a vehicle (two-wheeler
through large truck), nearby drivers accept and run the trip, and admins
watch the whole fleet from one dashboard. Built with Vite + React + Supabase.

## Stack

- **Vite + React 18** — frontend, no framework lock-in
- **React Router** — role-based routing (`/`, `/driver`, `/admin`)
- **Supabase** — Postgres + Auth + Realtime (row-level security enforced)
- **Tailwind CSS** — asphalt/road-marking design system (see `tailwind.config.js`)

No external maps/geocoding provider is wired in — pickup/drop are plain text
fields and distance is entered by hand. See "Extending this scaffold" below
for how to add real geocoding later, on your own terms.

## Setup

1. **Create a Supabase project** at supabase.com.
2. **Run the schema**: open the SQL editor in your Supabase project and run
   the contents of `supabase/schema.sql`. This creates `profiles`,
   `bookings`, `ratings`, and all RLS policies. The whole file is safe to
   re-run any time you pull an update to it.
3. **Copy env vars**:
   ```bash
   cp .env.example .env
   ```
   Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from
   Project Settings → API in your Supabase dashboard.
4. **Install & run**:
   ```bash
   npm install
   npm run dev
   ```
   App runs at `http://localhost:5173`.

## How roles work

Every user signs up as either `customer` or `driver` (pick on the signup
screen) — this is written to `profiles.role`. There's no self-serve `admin`
signup: promote a user to admin manually after they sign up:

```sql
update profiles set role = 'admin' where id = 'the-users-uuid';
```

The router (`src/App.jsx`) sends each role to its own home:
- `customer` → `/` (book + track trips)
- `driver` → `/driver` (go online, accept jobs, run trips)
- `admin` → `/admin` (fleet stats, all bookings, all drivers)

## Booking flow

1. Customer submits pickup/drop address + distance + vehicle type from
   `/book`. Fare is estimated client-side (`src/lib/pricing.js`) and stored
   as `fare_estimate`.
2. Booking lands in `pending`. Any online driver sees it in their feed
   (`/driver`) and can accept — the first accept wins (guarded by a
   conditional update on `status = 'pending'`, backed by an RLS policy that
   lets a driver claim an unassigned pending row).
3. Driver walks the trip through `accepted → picked_up → in_transit →
   completed` from `/driver/trip/:id`. The customer's `/track/:id` page
   updates live via Supabase Realtime subscriptions — no polling.
4. On completion the customer can leave a 1–5 rating.

## Extending this scaffold

- **Real geocoding/maps**: `distance_km` is currently entered by hand.
  If you want address autocomplete and computed distance later, `bookings`
  already has `pickup_lat`/`pickup_lng`/`drop_lat`/`drop_lng` columns ready
  to populate — you'd wire up whichever geocoding provider you're
  comfortable with (Google, Mappls, OpenStreetMap/Nominatim, etc.) and feed
  the result into `estimateFare()`. Worth checking a provider's CORS policy
  and console UI before committing — that's what cost the most time last
  time around.
- **Live driver location**: add a `driver_locations` table and push
  lat/lng from the driver app every few seconds; subscribe to it from
  `TrackBooking.jsx` to render a moving marker.
- **Payments**: `fare_final` is set to `fare_estimate` on completion —
  wire in Razorpay/Stripe before that step for real charges.
- **Vehicle capacity matching**: `src/lib/pricing.js` already carries
  `capacityKg` per vehicle type if you want to filter/suggest by load.
