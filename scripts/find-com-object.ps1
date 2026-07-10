Write-Host "Searching for AccessTcp COM objects..."
Write-Host ""

# Check if regsvr32 actually registered it
Write-Host "--- InprocServer32 entries ---"
Get-ChildItem HKLM:\SOFTWARE\Classes\CLSID -ErrorAction SilentlyContinue | ForEach-Object {
    $guid = $_.PSChildName
    $inproc = "HKLM:\SOFTWARE\Classes\CLSID\$guid\InprocServer32"
    $val = (Get-ItemProperty -LiteralPath $inproc -Name '(default)' -ErrorAction SilentlyContinue).'(default)'
    if ($val -and $val -match 'AccessTcp') {
        Write-Host "CLSID: $guid -> $val"
    }
}

Write-Host ""
Write-Host "--- ProgIDs ---"
Get-ChildItem HKLM:\SOFTWARE\Classes -ErrorAction SilentlyContinue | ForEach-Object {
    $name = $_.PSChildName
    if ($name -match 'AccessTcp|access_tcp|AccessTCP') {
        Write-Host "Found: $name"
    }
}

Write-Host ""
Write-Host "--- Trying to create COM objects ---"
$progIds = @(
    "AccessTcp.AccessTcpCtrl.1",
    "AccessTcp.AccessTcpCtrl",
    "AccessTcp.AccessTcp.1",
    "AccessTcp.AccessTcp",
    "AccessTcpCtrl",
    "AccessTcp.1",
    "ACAccessTcp.AccessTcp"
)

foreach ($progId in $progIds) {
    try {
        $type = [System.Type]::GetTypeFromProgID($progId)
        if ($type) {
            $obj = [System.Activator]::CreateInstance($type)
            Write-Host "[+] $progId - CREATED OK"
            $obj | Get-Member | Select-Object Name, MemberType | Format-Table -AutoSize
        } else {
            Write-Host "[-] $progId - Type not found"
        }
    } catch {
        Write-Host "[-] $progId - Error: $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "Done"
