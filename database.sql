-- ═══════════════════════════════════════════════════════════════
-- GREAT PROPERTIES GA — Database Schema
-- Run this SQL on your MySQL/MariaDB server
-- ═══════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS leads_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE leads_db;

CREATE TABLE IF NOT EXISTS leads (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  address    VARCHAR(255) NOT NULL DEFAULT '',
  name       VARCHAR(255) NOT NULL,
  phone      VARCHAR(50)  NOT NULL,
  email      VARCHAR(255) NOT NULL DEFAULT '',
  source     VARCHAR(100) NOT NULL DEFAULT 'website',
  message    TEXT,
  status     VARCHAR(50)  NOT NULL DEFAULT 'New',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create a dedicated DB user (change YOUR_DB_PASSWORD)
-- CREATE USER 'leads_user'@'localhost' IDENTIFIED BY 'YOUR_DB_PASSWORD';
-- GRANT ALL PRIVILEGES ON leads_db.* TO 'leads_user'@'localhost';
-- FLUSH PRIVILEGES;
