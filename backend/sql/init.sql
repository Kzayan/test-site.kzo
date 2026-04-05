-- ============================================================
--  АО «Қазақстан Темір Жолы» — PostgreSQL Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- === USERS ===
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('passenger', 'shipper', 'admin')),
    iin VARCHAR(12),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- === STATIONS ===
CREATE TABLE stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_kk VARCHAR(150) NOT NULL,
    name_ru VARCHAR(150) NOT NULL,
    name_en VARCHAR(150) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO stations (name_kk, name_ru, name_en, code, latitude, longitude, city) VALUES
('Алматы-1', 'Алматы-1', 'Almaty-1', 'AL1', 43.2380, 76.9100, 'Алматы'),
('Астана', 'Астана', 'Astana', 'AST', 51.1694, 71.4491, 'Астана'),
('Шымкент', 'Шымкент', 'Shymkent', 'SHI', 42.3417, 69.5901, 'Шымкент'),
('Қарағанды', 'Караганда', 'Karaganda', 'KAR', 49.8020, 73.0993, 'Қарағанды'),
('Ақтау', 'Актау', 'Aktau', 'AKT', 43.6500, 51.1667, 'Ақтау'),
('Павлодар', 'Павлодар', 'Pavlodar', 'PAV', 52.2873, 76.9674, 'Павлодар'),
('Семей', 'Семей', 'Semey', 'SEM', 50.4111, 80.2275, 'Семей'),
('Орал', 'Уральск', 'Uralsk', 'URA', 51.2333, 51.3667, 'Орал'),
('Атырау', 'Атырау', 'Atyrau', 'ATY', 47.1064, 51.8831, 'Атырау'),
('Түркістан', 'Туркестан', 'Turkestan', 'TUR', 43.3000, 68.2500, 'Түркістан');

-- === TRAINS ===
CREATE TABLE trains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    train_number VARCHAR(20) UNIQUE NOT NULL,
    name_kk VARCHAR(200),
    name_ru VARCHAR(200),    name_en VARCHAR(200),
    type VARCHAR(30) CHECK (type IN ('passenger', 'cargo', 'express')),
    max_capacity INTEGER,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO trains (train_number, name_kk, name_ru, name_en, type, max_capacity) VALUES
('001А', 'Тұлпар', 'Тулпар', 'Tulpar', 'express', 300),
('003А', 'Алматы-Астана', 'Алматы-Астана', 'Almaty-Astana', 'passenger', 500),
('015Ц', 'Ордабасы', 'Ордабасы', 'Ordabasy', 'passenger', 400),
('041Ц', 'Астана-Шымкент', 'Астана-Шымкент', 'Astana-Shymkent', 'passenger', 450),
('3001', 'Жүк-Транзит', 'Груз-Транзит', 'Cargo-Transit', 'cargo', 0);

-- === SCHEDULE ===
CREATE TABLE schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    train_id UUID REFERENCES trains(id),
    station_from UUID REFERENCES stations(id),
    station_to UUID REFERENCES stations(id),
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    price_economy DECIMAL(10, 2),
    price_business DECIMAL(10, 2),
    price_sleeping DECIMAL(10, 2),
    available_seats INTEGER,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schedules (train_id, station_from, station_to, departure_time, arrival_time, price_economy, price_business, price_sleeping, available_seats)
VALUES
('4b190c8f-0000-0000-0000-000000000001', 
 (SELECT id FROM stations WHERE code='AL1'), 
 (SELECT id FROM stations WHERE code='AST'),
 '2026-04-10 20:00:00', '2026-04-11 08:00:00', 8500, 15000, 22000, 120),
('4b190c8f-0000-0000-0000-000000000002',
 (SELECT id FROM stations WHERE code='AST'),
 (SELECT id FROM stations WHERE code='SHI'),
 '2026-04-12 09:00:00', '2026-04-12 21:00:00', 7500, 13000, 19000, 95);

-- === TICKETS ===
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    schedule_id UUID REFERENCES schedules(id),
    seat_number VARCHAR(10),
    class VARCHAR(20) CHECK (class IN ('economy', 'business', 'sleeping')),
    price DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'booked',    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- === CARGO ===
CREATE TABLE cargo_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    tracking_number VARCHAR(30) UNIQUE NOT NULL,
    cargo_type VARCHAR(100),
    weight_kg DECIMAL(10, 2),
    station_from UUID REFERENCES stations(id),
    station_to UUID REFERENCES stations(id),
    departure_date DATE,
    estimated_arrival DATE,
    status VARCHAR(30) DEFAULT 'created',
    total_cost DECIMAL(12, 2),
    invoice_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- === INVOICES ===
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cargo_order_id UUID REFERENCES cargo_orders(id),
    ticket_id UUID REFERENCES tickets(id),
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- === EMPLOYEES ===
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) UNIQUE,
    position VARCHAR(100),
    department VARCHAR(100),
    hire_date DATE,
    status VARCHAR(20) DEFAULT 'active'
);

-- === ACCESS LOG ===
CREATE TABLE access_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100),
    ip_address INET,
    user_agent TEXT,    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- === CONTACT MESSAGES ===
CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    subject VARCHAR(200),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- === CARGO TRACKING EVENTS ===
CREATE TABLE cargo_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cargo_order_id UUID REFERENCES cargo_orders(id),
    event_type VARCHAR(50),
    description_kk TEXT,
    description_ru TEXT,
    location VARCHAR(200),
    event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- === CARGO TRACKING TRIGGER (immitation) ===
INSERT INTO cargo_orders (tracking_number, cargo_type, weight_kg, station_from, station_to, departure_date, estimated_arrival, status, total_cost)
VALUES
('KTZ-2026-000123', 'Астық', 25000, 
 (SELECT id FROM stations WHERE code='KAR'), 
 (SELECT id FROM stations WHERE code='AL1'),
 '2026-04-01', '2026-04-05', 'in_transit', 450000);

INSERT INTO cargo_events (cargo_order_id, event_type, description_kk, location)
VALUES
((SELECT id FROM cargo_orders WHERE tracking_number='KTZ-2026-000123'), 'created', 'Тапсырыс жасалды', 'Қарағанды'),
((SELECT id FROM cargo_orders WHERE tracking_number='KTZ-2026-000123'), 'loaded', 'Жүк тиеілді', 'Қарағанды'),
((SELECT id FROM cargo_orders WHERE tracking_number='KTZ-2026-000123'), 'in_transit', 'Жолда', 'Балқаш'),
((SELECT id FROM cargo_orders WHERE tracking_number='KTZ-2026-000123'), 'arrived', 'Алматы-1 станциясына жетті', 'Алматы');

-- INDEXES
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_schedules_route ON schedules(station_from, station_to);
CREATE INDEX idx_cargo_tracking ON cargo_orders(tracking_number);
CREATE INDEX idx_access_log_user ON access_log(user_id);
CREATE INDEX idx_tickets_user ON tickets(user_id);

-- DEFAULT ADMIN USER (password: Admin@1234)
INSERT INTO users (full_name, email, password_hash, role) VALUES('Әкімші', 'admin@ktz.kz', '$2b$10$Yc7R0g3bN5zK0X5qP8sW.eQ7fV8hG2jK9mL3nO4pQ5rS6tU7vW8x', 'admin');