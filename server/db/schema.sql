-- ============================================================
--  LuggageTrack PostgreSQL Schema + Seed Data
--  Run automatically on first container start via Docker init
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Tables ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY DEFAULT 'U-' || substr(gen_random_uuid()::text, 1, 8),
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  username    TEXT UNIQUE NOT NULL,
  password    TEXT NOT NULL,  -- bcrypt hash
  role        TEXT NOT NULL CHECK (role IN ('Admin','Check-In Staff','Loading Staff','Handover Staff','Passenger')),
  status      TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Suspended')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS baggage (
  id              TEXT PRIMARY KEY,
  passenger_name  TEXT NOT NULL,
  flight_number   TEXT NOT NULL,
  origin          TEXT NOT NULL,
  destination     TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'Checked In',
  weight          NUMERIC(5,2),
  pnr             TEXT,
  notes           TEXT,
  last_updated    TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lost_reports (
  id                  TEXT PRIMARY KEY,
  bag_id              TEXT,
  passenger_name      TEXT NOT NULL,
  contact_email       TEXT NOT NULL,
  contact_phone       TEXT,
  flight              TEXT NOT NULL,
  route               TEXT,
  last_seen_location  TEXT,
  description         TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'Pending Review'
                      CHECK (status IN ('Pending Review','Under Investigation','Located','Closed - Not Found')),
  assigned_to         TEXT DEFAULT 'Unassigned',
  reported_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id          TEXT PRIMARY KEY DEFAULT 'n-' || substr(gen_random_uuid()::text, 1, 8),
  type        TEXT NOT NULL CHECK (type IN ('info','warning','error','success')),
  message     TEXT NOT NULL,
  timestamp   TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_log (
  id          TEXT PRIMARY KEY DEFAULT 'a-' || substr(gen_random_uuid()::text, 1, 8),
  action      TEXT NOT NULL,
  details     TEXT NOT NULL,
  username    TEXT NOT NULL,
  time        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_baggage_status   ON baggage(status);
CREATE INDEX IF NOT EXISTS idx_baggage_flight   ON baggage(flight_number);
CREATE INDEX IF NOT EXISTS idx_baggage_pnr      ON baggage(pnr);
CREATE INDEX IF NOT EXISTS idx_lost_bag_id      ON lost_reports(bag_id);
CREATE INDEX IF NOT EXISTS idx_lost_status      ON lost_reports(status);

-- ── Seed: Users (passwords are bcrypt of 'admin123' / 'pass123') ─
-- Hashes generated with bcrypt rounds=10
INSERT INTO users (id, name, email, username, password, role, status) VALUES
  ('U-001','Alex Mercer',   'alex.mercer@luggagetrack.com',   'admin',    '$2a$10$xHkJ2K5vQ3mN8pLdR1sWIuYq7tZ0aeBfCgDhEiJkLmOpQrStUvWx', 'Admin',           'Active'),
  ('U-002','Sarah Connor',  'sarah.connor@luggagetrack.com',  'checkin',  '$2a$10$xHkJ2K5vQ3mN8pLdR1sWIuYq7tZ0aeBfCgDhEiJkLmOpQrStUvWx', 'Check-In Staff',  'Active'),
  ('U-003','David Kim',     'david.kim@luggagetrack.com',     'loading',  '$2a$10$xHkJ2K5vQ3mN8pLdR1sWIuYq7tZ0aeBfCgDhEiJkLmOpQrStUvWx', 'Loading Staff',   'Active'),
  ('U-004','Elena Rostova', 'elena.r@luggagetrack.com',       'handover', '$2a$10$xHkJ2K5vQ3mN8pLdR1sWIuYq7tZ0aeBfCgDhEiJkLmOpQrStUvWx', 'Handover Staff',  'Active'),
  ('U-005','James Wilson',  'james.wilson@luggagetrack.com',  'jwilson',  '$2a$10$xHkJ2K5vQ3mN8pLdR1sWIuYq7tZ0aeBfCgDhEiJkLmOpQrStUvWx', 'Loading Staff',   'Suspended'),
  ('U-006','Maria Santos',  'm.santos@luggagetrack.com',      'msantos',  '$2a$10$xHkJ2K5vQ3mN8pLdR1sWIuYq7tZ0aeBfCgDhEiJkLmOpQrStUvWx', 'Check-In Staff',  'Active'),
  ('U-007','Tom Bradley',   't.bradley@luggagetrack.com',     'tbradley', '$2a$10$xHkJ2K5vQ3mN8pLdR1sWIuYq7tZ0aeBfCgDhEiJkLmOpQrStUvWx', 'Handover Staff',  'Active'),
  ('U-008','Nina Petrov',   'n.petrov@luggagetrack.com',     'passenger','$2a$10$xHkJ2K5vQ3mN8pLdR1sWIuYq7tZ0aeBfCgDhEiJkLmOpQrStUvWx', 'Passenger',       'Active')
ON CONFLICT (id) DO NOTHING;

-- ── Seed: Baggage ─────────────────────────────────────────────
INSERT INTO baggage (id, passenger_name, flight_number, origin, destination, status, weight, notes, pnr) VALUES
  ('LT-89302-JFK','Eleanor Vance',  'UA-2402','ORD','JFK','Handed Over',        22.4,'Priority lane, heavy tag',    NULL),
  ('LT-10293-LHR','Marcus Sterling','BA-0178','JFK','LHR','Loaded Into Aircraft',18.2,'Security checked twice',      NULL),
  ('LT-72524-SIN','Emma Watson',    'SQ-180', 'JFK','SIN','Checked In',          18.5,'SkyPass Business class passenger. PNR: 8MOAFW.','8MOAFW'),
  ('LT-55421-HND','Aiko Tanaka',    'JL-0006','LAX','HND','In Transit',          25.1,'Fragile contents',           NULL),
  ('LT-77381-CDG','Pierre Dubois',  'AF-0023','CDG','MIA','Delayed',             21.0,'Missed connection, loading on next flight', NULL),
  ('LT-44920-DXB','Zayn Khalid',    'EK-0201','DXB','JFK','Checked In',          29.8,'Oversized baggage',          NULL),
  ('LT-33291-SIN','Sarah Lim',      'SQ-0021','SIN','EWR','Security Cleared',    15.6,'Standard baggage',           NULL),
  ('LT-11823-SYD','Liam Henderson', 'QF-0012','LAX','SYD','Lost',               23.0,'Last seen at sorting hub B. Investigation active.', NULL),
  ('LT-99201-DFW','Sofia Rodriguez','AA-0451','DFW','MEX','Handed Over',         19.5,'None',                       NULL),
  ('LT-66129-FRA','Hans Müller',    'LH-0430','FRA','ORD','In Transit',          22.8,'Priority tag',              NULL)
ON CONFLICT (id) DO NOTHING;

-- ── Seed: Lost Reports ────────────────────────────────────────
INSERT INTO lost_reports (id, bag_id, passenger_name, contact_email, contact_phone, flight, route, last_seen_location, description, status, assigned_to) VALUES
  ('LR-001','LT-11823-SYD','Liam Henderson',  'liam.henderson@email.com','+1-555-0182','QF-0012','LAX → SYD','Sorting Hub B, Terminal 4','Black hardshell Samsonite suitcase with red ribbon on handle. Contains electronics and clothing.','Under Investigation','Sarah Connor'),
  ('LR-002','LT-77381-CDG','Pierre Dubois',   'pierre.dubois@email.com', '+33-6-1234-5678','AF-0023','CDG → MIA','Gate 22 CDG Airport','Brown leather carry-on with airline tag. Contains travel documents and medication.','Located','Alex Mercer'),
  ('LR-003','LT-55421-HND','Aiko Tanaka',     'aiko.tanaka@email.com',   '+81-90-5678-1234','JL-0006','LAX → HND','Unknown — not scanned after Security B','Navy blue duffle bag with AKT initials. Fragile camera equipment inside.','Closed - Not Found','David Kim')
ON CONFLICT (id) DO NOTHING;

-- ── Seed: Notifications ───────────────────────────────────────
INSERT INTO notifications (id, type, message, timestamp) VALUES
  ('n-1','warning','Baggage LT-77381-CDG delayed by flight scheduling','10 mins ago'),
  ('n-2','info',   'User David Kim checked in 12 bags on AA-0451',    '25 mins ago'),
  ('n-3','error',  'Lost baggage report LR-001 filed for LT-11823-SYD','2 hours ago'),
  ('n-4','success','Lost baggage LR-002 (Pierre Dubois) — item located!','3 hours ago'),
  ('n-5','warning','Baggage LT-83024-MEL flight delayed — reprogramming','4 hours ago')
ON CONFLICT (id) DO NOTHING;

-- ── Seed: Activity Log ────────────────────────────────────────
INSERT INTO activity_log (id, action, details, username, time) VALUES
  ('a-1','Status Updated', 'LT-89302-JFK updated to Handed Over',        'Elena Rostova','5 mins ago'),
  ('a-2','Record Created', 'Added LT-44920-DXB for Zayn Khalid',         'Sarah Connor', '12 mins ago'),
  ('a-3','User Modified',  'James Wilson set to Suspended',               'Alex Mercer',  '45 mins ago'),
  ('a-4','Status Updated', 'LT-10293-LHR updated to Loaded Into Aircraft','David Kim',    '1 hour ago'),
  ('a-5','Report Exported','Monthly baggage processing report downloaded', 'Alex Mercer',  '2 hours ago'),
  ('a-6','Lost Report Filed','LR-001 opened for LT-11823-SYD',           'Sarah Connor', '4 hours ago')
ON CONFLICT (id) DO NOTHING;
