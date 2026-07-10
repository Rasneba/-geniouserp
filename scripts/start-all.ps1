Write-Host "Starting Genius HRMS + Access Relay..." -ForegroundColor Cyan

# Start Next.js dev server in background
$devJob = Start-Job -ScriptBlock {
  Set-Location $using:PWD
  npm run dev
}

# Wait for dev server to be ready
Write-Host "Waiting for dev server..." -ForegroundColor Yellow
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 1
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    if ($r.StatusCode -eq 200) { $ready = $true; break }
  } catch {}
}
if (-not $ready) {
  Write-Host "Dev server failed to start" -ForegroundColor Red
  exit 1
}
Write-Host "Dev server ready!" -ForegroundColor Green

# Start the relay
Write-Host "Starting access relay..." -ForegroundColor Yellow
node scripts/local-relay.mjs
