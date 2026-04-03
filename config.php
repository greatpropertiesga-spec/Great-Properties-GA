<?php
// ═══════════════════════════════════════════════════════════════
// GREAT PROPERTIES GA — Configuration
// ═══════════════════════════════════════════════════════════════

// ── DATABASE ──────────────────────────────────────────────────
$host     = getenv('DB_HOST')     ?: 'localhost';
$dbname   = getenv('DB_NAME')     ?: 'leads_db';
$username = getenv('DB_USER')     ?: 'leads_user';
$password = getenv('DB_PASSWORD') ?: 'YOUR_DB_PASSWORD';

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}
$conn->set_charset("utf8mb4");

// ── SESSION ───────────────────────────────────────────────────
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ── ADMIN CREDENTIALS ─────────────────────────────────────────
$admin_user = getenv('ADMIN_USER') ?: 'admin';
$admin_pass = getenv('ADMIN_PASS') ?: 'ChangeThis123!';

// ── EMAIL (SMTP via Hostinger) ────────────────────────────────
$smtp_host     = 'smtp.hostinger.com';
$smtp_port     = 465;
$smtp_username = 'info@greatpropertiesga.com';
$smtp_password = getenv('SMTP_PASSWORD') ?: 'YOUR_EMAIL_PASSWORD';
$smtp_secure   = 'ssl';

$lead_notification_email = 'info@greatpropertiesga.com';
$from_email = 'info@greatpropertiesga.com';
$from_name  = 'Great Properties GA';

// ── SMS / TWILIO (optional) ───────────────────────────────────
$enable_sms   = false;
$twilio_sid   = getenv('TWILIO_SID')   ?: 'YOUR_TWILIO_SID';
$twilio_token = getenv('TWILIO_TOKEN') ?: 'YOUR_TWILIO_AUTH_TOKEN';
$twilio_from  = getenv('TWILIO_FROM')  ?: '+1XXXXXXXXXX';
$twilio_to    = '+14045901613';
