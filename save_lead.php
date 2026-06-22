<?php
// ═══════════════════════════════════════════════════════════════
// GREAT PROPERTIES GA — Save Lead
// ═══════════════════════════════════════════════════════════════
include 'config.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// ── Sanitize inputs ───────────────────────────────────────────
$address = trim($_POST['address'] ?? '');
$name    = trim($_POST['name']    ?? '');
$phone   = trim($_POST['phone']   ?? '');
$email   = trim($_POST['email']   ?? '');
$source  = trim($_POST['source']  ?? 'website');
$message = trim($_POST['message'] ?? '');

// ── Validate ──────────────────────────────────────────────────
if ($name === '' || $phone === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Name and phone are required.']);
    exit;
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address.']);
    exit;
}
$safe_reply_to = filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : $from_email;

// ── Save to database ─────────────────────────────────────────
$stmt = $conn->prepare(
    "INSERT INTO leads (address, name, phone, email, source, message, status)
     VALUES (?, ?, ?, ?, ?, ?, 'New')"
);
$stmt->bind_param('ssssss', $address, $name, $phone, $email, $source, $message);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error. Please try again.']);
    exit;
}

// ── Send email notification ──────────────────────────────────
$subject = "🏠 New Lead — Great Properties GA";
$body = "New lead received from the website!\n\n"
      . "Name:    $name\n"
      . "Phone:   $phone\n"
      . "Email:   $email\n"
      . "Address: $address\n"
      . "Source:  $source\n"
      . "Message: $message\n\n"
      . "Login to admin to view all leads:\n"
      . "https://greatpropertiesga.com/login.php";
$headers = "From: $from_name <$from_email>\r\nReply-To: $safe_reply_to";
@mail($lead_notification_email, $subject, $body, $headers);

// ── SMS via Twilio (optional) ────────────────────────────────
if ($enable_sms && $twilio_sid && $twilio_token && $twilio_from) {
    $twilio_url = "https://api.twilio.com/2010-04-01/Accounts/$twilio_sid/Messages.json";
    $sms_body   = "New Lead: $name | $phone | $address";
    $ch = curl_init($twilio_url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query(['To' => $twilio_to, 'From' => $twilio_from, 'Body' => $sms_body]),
        CURLOPT_USERPWD        => "$twilio_sid:$twilio_token",
    ]);
    curl_exec($ch);
    curl_close($ch);
}

$conn->close();
echo json_encode(['success' => true, 'message' => 'Thank you! We will contact you within 24 hours.']);
