CREATE TABLE IF NOT EXISTS customers (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  whatsapp text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id bigserial PRIMARY KEY,
  code text UNIQUE NOT NULL,
  customer_id bigint NOT NULL REFERENCES customers(id),
  service_type text NOT NULL CHECK (service_type IN ('wisata', 'travel', 'rental')),
  service_name text NOT NULL,
  travel_date date NOT NULL,
  people integer NOT NULL CHECK (people BETWEEN 1 AND 50),
  details jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'baru' CHECK (status IN ('baru', 'dikonfirmasi', 'selesai', 'dibatalkan')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bookings_status_created_idx ON bookings(status, created_at DESC);
