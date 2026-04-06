-- Yaratilishi kerak bo'lgan jadvallar skriptlari
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS patients (
  id VARCHAR(20) PRIMARY KEY, -- masalan 'B-001'
  last_name VARCHAR(50) NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  dob DATE,
  gender VARCHAR(10),
  phone VARCHAR(20),
  address VARCHAR(255),
  complaint TEXT,
  diag VARCHAR(255),
  doctor VARCHAR(100),
  note TEXT,
  status VARCHAR(20),
  last_visit DATE
);

CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  patient_name VARCHAR(100) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  doctor VARCHAR(100) NOT NULL,
  type VARCHAR(50),
  status VARCHAR(20),
  note TEXT
);

CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  qty INT DEFAULT 0,
  min_qty INT DEFAULT 50,
  unit VARCHAR(20),
  exp_date VARCHAR(20),
  crit BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS finance (
  id VARCHAR(20) PRIMARY KEY, -- masalan 'T-1024'
  patient_name VARCHAR(100) NOT NULL,
  service VARCHAR(100),
  amount NUMERIC(12, 2),
  date DATE,
  type VARCHAR(20),
  status VARCHAR(20)
);

-- Boshlang'ich datalarni kiritish (faqat test uchun)
INSERT INTO inventory (name, category, qty, min_qty, unit, exp_date, crit) VALUES
('Amoxicillin 500mg', 'Antibiotik', 12, 50, 'dona', '2025-06', TRUE),
('Metformin 1000mg', 'Diabet dori', 250, 100, 'dona', '2025-12', FALSE)
ON CONFLICT DO NOTHING;
