<?php
include 'config.php';
if (empty($_SESSION['admin_logged_in'])) {
    header('Location: login.php'); exit;
}

$_SESSION['csrf_token'] = $_SESSION['csrf_token'] ?? bin2hex(random_bytes(32));
$csrf_token = $_SESSION['csrf_token'];

function require_csrf(): void {
    if (!hash_equals($_SESSION['csrf_token'] ?? '', $_POST['csrf_token'] ?? '')) {
        http_response_code(403);
        exit('Invalid request.');
    }
}

// CSV Export
if (isset($_GET['export']) && $_GET['export'] === 'csv') {
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="leads-'.date('Y-m-d').'.csv"');
    $out = fopen('php://output', 'w');
    fputcsv($out, ['ID','Date','Name','Phone','Email','Address','Source','Status']);
    $all = $conn->query("SELECT * FROM leads ORDER BY id DESC");
    while ($r = $all->fetch_assoc()) {
        fputcsv($out, [$r['id'],$r['created_at'],$r['name'],$r['phone'],$r['email'],$r['address'],$r['source']??'',$r['status']]);
    }
    fclose($out);
    exit;
}

// Handle status update
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_status'])) {
    require_csrf();
    $id     = (int)($_POST['lead_id'] ?? 0);
    $status = $_POST['status'] ?? 'New';
    $allowed = ['New','Contacted','Offer Made','Closed','Not Interested'];
    if ($id > 0 && in_array($status, $allowed, true)) {
        $stmt = $conn->prepare("UPDATE leads SET status=? WHERE id=?");
        $stmt->bind_param('si', $status, $id);
        $stmt->execute();
    }
    header('Location: admin.php'); exit;
}

// Handle delete
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete'])) {
    require_csrf();
    $id = (int)$_POST['delete'];
    if ($id > 0) {
        $stmt = $conn->prepare("DELETE FROM leads WHERE id=?");
        $stmt->bind_param('i', $id);
        $stmt->execute();
    }
    header('Location: admin.php'); exit;
}

// Filter
$filter = $_GET['status'] ?? '';
$search = trim($_GET['q'] ?? '');
$where  = [];
if ($filter && $filter !== 'all') $where[] = "status='".mysqli_real_escape_string($conn,$filter)."'";
if ($search) $where[] = "(name LIKE '%".mysqli_real_escape_string($conn,$search)."%' OR phone LIKE '%".mysqli_real_escape_string($conn,$search)."%' OR email LIKE '%".mysqli_real_escape_string($conn,$search)."%' OR address LIKE '%".mysqli_real_escape_string($conn,$search)."%')";
$sql    = "SELECT * FROM leads" . ($where ? " WHERE ".implode(' AND ',$where) : "") . " ORDER BY id DESC";
$result = $conn->query($sql);

// Stats
$total     = $conn->query("SELECT COUNT(*) c FROM leads")->fetch_assoc()['c'];
$new_count = $conn->query("SELECT COUNT(*) c FROM leads WHERE status='New'")->fetch_assoc()['c'];
$contacted = $conn->query("SELECT COUNT(*) c FROM leads WHERE status='Contacted'")->fetch_assoc()['c'];
$closed    = $conn->query("SELECT COUNT(*) c FROM leads WHERE status='Closed'")->fetch_assoc()['c'];

$status_colors = [
    'New'          => '#cc2200',
    'Contacted'    => '#1a4fa0',
    'Offer Made'   => '#e8a020',
    'Closed'       => '#16a34a',
    'Not Interested'=> '#6b7280',
];
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin — Great Properties GA Leads</title>
<meta name="robots" content="noindex, nofollow">
<style>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Open+Sans:wght@400;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Open Sans',Arial,sans-serif;background:#1a1520;color:#f0ede8;font-size:14px}
.topbar{background:#0d0b12;border-bottom:1px solid rgba(255,255,255,.08);padding:14px 28px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
.topbar-logo{font-family:'Oswald',Arial;font-size:18px;font-weight:700;color:#f0ede8;text-transform:uppercase;letter-spacing:1px;display:flex;align-items:center;gap:10px}
.topbar-right{display:flex;gap:16px;align-items:center}
.topbar-right a{font-size:12px;color:#8a7f78;text-decoration:none;text-transform:uppercase;letter-spacing:1px;padding:7px 16px;border:1px solid rgba(255,255,255,.1);transition:all .2s}
.topbar-right a:hover{border-color:#cc2200;color:#f0ede8}
.topbar-right a.danger{border-color:rgba(204,34,0,.4);color:#cc2200}
.wrap{max-width:1300px;margin:0 auto;padding:32px 24px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;background:rgba(255,255,255,.08);margin-bottom:32px}
.stat{background:#221e2e;padding:24px 20px;text-align:center}
.stat-num{font-family:'Oswald',Arial;font-size:42px;font-weight:700;line-height:1;margin-bottom:6px}
.stat-label{font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#8a7f78;font-weight:600}
.toolbar{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;align-items:center}
.toolbar form{display:flex;gap:8px;flex:1;min-width:200px}
.toolbar input{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);padding:10px 16px;color:#f0ede8;font-size:13px;font-family:inherit;outline:none}
.toolbar input:focus{border-color:#cc2200}
.toolbar select{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);padding:10px 14px;color:#f0ede8;font-size:13px;font-family:inherit;outline:none;cursor:pointer}
.btn-search{background:#cc2200;color:#fff;border:none;padding:10px 20px;font-family:'Oswald',Arial;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;cursor:pointer}
.btn-export{background:rgba(232,160,32,.12);border:1px solid rgba(232,160,32,.4);color:#e8a020;padding:10px 18px;font-size:12px;font-weight:600;text-decoration:none;letter-spacing:.5px;font-family:inherit;cursor:pointer;text-transform:uppercase;letter-spacing:1px}
.filter-tabs{display:flex;gap:0}
.filter-tab{padding:8px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;text-decoration:none;color:#8a7f78;border:1px solid rgba(255,255,255,.08);border-right:none;transition:all .2s}
.filter-tab:last-child{border-right:1px solid rgba(255,255,255,.08)}
.filter-tab:hover,.filter-tab.active{background:#cc2200;border-color:#cc2200;color:#fff}
table{width:100%;border-collapse:collapse;background:#221e2e}
thead th{background:#0d0b12;padding:12px 16px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#8a7f78;border-bottom:1px solid rgba(255,255,255,.08);white-space:nowrap}
tbody tr{border-bottom:1px solid rgba(255,255,255,.06);transition:background .15s}
tbody tr:hover{background:rgba(255,255,255,.04)}
td{padding:14px 16px;font-size:13px;color:#c8c0b8;vertical-align:middle}
td.bold{color:#f0ede8;font-weight:600}
.badge{display:inline-block;padding:4px 12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;border-radius:2px}
.actions{display:flex;gap:8px;align-items:center}
.btn-sm{padding:6px 14px;font-size:11px;font-weight:600;cursor:pointer;border:none;text-transform:uppercase;letter-spacing:.5px;font-family:inherit;transition:all .2s;white-space:nowrap}
.btn-delete{background:rgba(204,34,0,.12);border:1px solid rgba(204,34,0,.3);color:#cc2200}
.btn-delete:hover{background:#cc2200;color:#fff}
select.status-sel{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#f0ede8;padding:6px 10px;font-size:11px;font-family:inherit;cursor:pointer;outline:none}
.empty{text-align:center;padding:80px 20px;color:#6b5f50}
.empty-icon{font-size:48px;opacity:.3;display:block;margin-bottom:14px}
@media(max-width:768px){
  .stats{grid-template-columns:repeat(2,1fr)}
  .filter-tabs{flex-wrap:wrap}
  .topbar{flex-direction:column;gap:12px;text-align:center}
  table{display:block;overflow-x:auto}
}
</style>
</head>
<body>
<div class="topbar">
  <div class="topbar-logo">🦅 Great Properties GA &mdash; Leads Admin</div>
  <div class="topbar-right">
    <a href="index.php">View Site</a>
    <a href="admin.php?export=csv">Export CSV</a>
    <a href="logout.php" class="danger">Logout</a>
  </div>
</div>

<div class="wrap">

<!-- Stats -->
<div class="stats">
  <div class="stat"><div class="stat-num" style="color:#cc2200"><?= $total ?></div><div class="stat-label">Total Leads</div></div>
  <div class="stat"><div class="stat-num" style="color:#e8a020"><?= $new_count ?></div><div class="stat-label">New Leads</div></div>
  <div class="stat"><div class="stat-num" style="color:#1a4fa0"><?= $contacted ?></div><div class="stat-label">Contacted</div></div>
  <div class="stat"><div class="stat-num" style="color:#16a34a"><?= $closed ?></div><div class="stat-label">Closed</div></div>
</div>

<!-- Toolbar -->
<div class="toolbar">
  <div class="filter-tabs">
    <a href="admin.php" class="filter-tab <?= !$filter ? 'active' : '' ?>">All</a>
    <a href="admin.php?status=New" class="filter-tab <?= $filter==='New' ? 'active' : '' ?>">New</a>
    <a href="admin.php?status=Contacted" class="filter-tab <?= $filter==='Contacted' ? 'active' : '' ?>">Contacted</a>
    <a href="admin.php?status=Offer+Made" class="filter-tab <?= $filter==='Offer Made' ? 'active' : '' ?>">Offer Made</a>
    <a href="admin.php?status=Closed" class="filter-tab <?= $filter==='Closed' ? 'active' : '' ?>">Closed</a>
  </div>
  <form method="GET" style="display:flex;gap:8px;flex:1;min-width:200px">
    <input name="q" value="<?= htmlspecialchars($search) ?>" placeholder="Search name, phone, email, address…">
    <?php if ($filter): ?><input type="hidden" name="status" value="<?= htmlspecialchars($filter) ?>"><?php endif; ?>
    <button type="submit" class="btn-search">Search</button>
  </form>
  <a href="admin.php?export=csv" class="btn-export">⬇ Export CSV</a>
</div>

<!-- Table -->
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Date</th>
      <th>Name</th>
      <th>Phone</th>
      <th>Email</th>
      <th>Address</th>
      <th>Source</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
  <?php if ($result && $result->num_rows > 0):
    while ($row = $result->fetch_assoc()):
      $color = $status_colors[$row['status']] ?? '#6b7280';
  ?>
    <tr>
      <td style="color:#6b5f50"><?= $row['id'] ?></td>
      <td style="white-space:nowrap;color:#6b5f50"><?= date('M j, Y', strtotime($row['created_at'])) ?><br><span style="font-size:11px"><?= date('g:i A', strtotime($row['created_at'])) ?></span></td>
      <td class="bold"><?= htmlspecialchars($row['name']) ?></td>
      <td><a href="tel:<?= htmlspecialchars($row['phone']) ?>" style="color:#e8a020;font-weight:600"><?= htmlspecialchars($row['phone']) ?></a></td>
      <td><a href="mailto:<?= htmlspecialchars($row['email']) ?>" style="color:#c8c0b8"><?= htmlspecialchars($row['email']) ?></a></td>
      <td style="max-width:200px"><?= htmlspecialchars($row['address']) ?></td>
      <td style="color:#6b5f50;font-size:11px"><?= htmlspecialchars($row['source'] ?? 'website') ?></td>
      <td>
        <form method="POST" style="display:flex;gap:6px;align-items:center">
          <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf_token) ?>">
          <input type="hidden" name="lead_id" value="<?= $row['id'] ?>">
          <select name="status" class="status-sel" onchange="this.form.submit()">
            <?php foreach (array_keys($status_colors) as $s): ?>
              <option value="<?= $s ?>" <?= $s===$row['status']?'selected':'' ?>><?= $s ?></option>
            <?php endforeach; ?>
          </select>
          <input type="hidden" name="update_status" value="1">
        </form>
      </td>
      <td>
        <div class="actions">
          <a href="tel:<?= htmlspecialchars($row['phone']) ?>" class="btn-sm" style="background:rgba(26,79,160,.12);border:1px solid rgba(26,79,160,.3);color:#1a7fff;text-decoration:none">📞 Call</a>
          <form method="POST" style="display:inline" onsubmit="return confirm('Delete this lead?')">
            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf_token) ?>">
            <input type="hidden" name="delete" value="<?= $row['id'] ?>">
            <button type="submit" class="btn-sm btn-delete">Delete</button>
          </form>
        </div>
      </td>
    </tr>
  <?php endwhile; else: ?>
    <tr><td colspan="9">
      <div class="empty">
        <span class="empty-icon">📋</span>
        <div style="font-family:'Oswald',Arial;font-size:18px;color:#6b5f50;text-transform:uppercase">No leads yet</div>
        <div style="margin-top:8px;font-size:13px">Leads will appear here when visitors submit the form on your website.</div>
      </div>
    </td></tr>
  <?php endif; ?>
  </tbody>
</table>

</div>

</body>
</html>
