<?php
// ═══════════════════════════════════════════════════════════════
// GREAT PROPERTIES GA — Configuration
// ═══════════════════════════════════════════════════════════════

error_reporting(E_ALL);
ini_set('display_errors', getenv('APP_DEBUG') === 'true' ? '1' : '0');
ini_set('log_errors', '1');
ini_set('expose_php', '0');

function required_env(string $name): string {
    $value = getenv($name);
    if ($value === false || trim($value) === '') {
        error_log("Missing required environment variable: $name");
        http_response_code(500);
        exit('Server configuration error.');
    }
    return $value;
}

// ── DATABASE ──────────────────────────────────────────────────
$host     = getenv('DB_HOST')     ?: 'localhost';
$dbname   = getenv('DB_NAME')     ?: 'leads_db';
$username = getenv('DB_USER')     ?: 'leads_user';
$password = required_env('DB_PASSWORD');

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    error_log("Database connection failed: " . $conn->connect_error);
    http_response_code(500);
    exit('Server configuration error.');
}
$conn->set_charset("utf8mb4");

// ── SESSION ───────────────────────────────────────────────────
if (session_status() === PHP_SESSION_NONE) {
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

// ── ADMIN CREDENTIALS ─────────────────────────────────────────
$admin_user = getenv('ADMIN_USER') ?: 'admin';
$admin_pass = required_env('ADMIN_PASS');

// ── EMAIL (SMTP via Hostinger) ────────────────────────────────
$smtp_host     = 'smtp.hostinger.com';
$smtp_port     = 465;
$smtp_username = 'info@greatpropertiesga.com';
$smtp_password = getenv('SMTP_PASSWORD') ?: '';
$smtp_secure   = 'ssl';

$lead_notification_email = 'info@greatpropertiesga.com';
$from_email = 'info@greatpropertiesga.com';
$from_name  = 'Great Properties GA';

// ── SMS / TWILIO (optional) ───────────────────────────────────
$enable_sms   = filter_var(getenv('ENABLE_SMS') ?: 'false', FILTER_VALIDATE_BOOLEAN);
$twilio_sid   = getenv('TWILIO_SID')   ?: '';
$twilio_token = getenv('TWILIO_TOKEN') ?: '';
$twilio_from  = getenv('TWILIO_FROM')  ?: '';
$twilio_to    = getenv('TWILIO_TO')    ?: '+14045901613';
