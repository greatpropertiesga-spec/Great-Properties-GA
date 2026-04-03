<?php
include 'config.php';
if (!empty($_SESSION['admin_logged_in'])) {
    header('Location: admin.php'); exit;
}
$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = trim($_POST['username'] ?? '');
    $pass = trim($_POST['password'] ?? '');
    if ($user === $admin_user && $pass === $admin_pass) {
        $_SESSION['admin_logged_in'] = true;
        header('Location: admin.php'); exit;
    }
    $error = 'Wrong username or password.';
}
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin Login — Great Properties GA</title>
<meta name="robots" content="noindex, nofollow">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Oswald',Arial,sans-serif;background:#1a1520;display:flex;align-items:center;justify-content:center;min-height:100vh}
.box{background:#221e2e;border:1px solid rgba(255,255,255,.1);border-top:3px solid #cc2200;padding:44px 40px;width:100%;max-width:380px}
.logo{text-align:center;margin-bottom:32px}
.logo-eagle{font-size:40px;display:block;margin-bottom:8px}
.logo h1{font-size:20px;font-weight:700;color:#f0ede8;text-transform:uppercase;letter-spacing:1px}
.logo p{font-size:11px;color:#6b5f50;letter-spacing:2px;text-transform:uppercase;margin-top:4px}
label{display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#8a7f78;margin-bottom:6px;margin-top:18px}
input{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);padding:13px 16px;font-size:14px;color:#f0ede8;font-family:inherit;outline:none;transition:border-color .2s}
input:focus{border-color:#cc2200}
.btn{display:block;width:100%;background:#cc2200;color:#fff;border:none;padding:15px;font-family:'Oswald',Arial,sans-serif;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;cursor:pointer;margin-top:24px;transition:background .2s}
.btn:hover{background:#e63000}
.error{background:rgba(220,38,38,.15);border:1px solid rgba(220,38,38,.4);color:#f87171;padding:12px 16px;font-size:13px;margin-top:16px}
.back{text-align:center;margin-top:20px;font-size:12px;color:#6b5f50}
.back a{color:#e8a020;text-decoration:none}
</style>
</head>
<body>
<div class="box">
  <div class="logo">
    <span class="logo-eagle">🦅</span>
    <h1>Great Properties GA</h1>
    <p>Admin Panel</p>
  </div>
  <?php if ($error): ?>
    <div class="error">⚠️ <?= htmlspecialchars($error) ?></div>
  <?php endif; ?>
  <form method="POST">
    <label>Username</label>
    <input type="text" name="username" placeholder="admin" required autofocus>
    <label>Password</label>
    <input type="password" name="password" placeholder="••••••••" required>
    <button type="submit" class="btn">Login to Admin →</button>
  </form>
  <div class="back"><a href="index.php">← Back to website</a></div>
</div>
</body>
</html>
