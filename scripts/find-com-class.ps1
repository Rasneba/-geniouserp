Write-Host "Searching for AccessTcp COM registration..."
Write-Host ""

# Method 1: Search all InprocServer32 entries for AccessTcp.dll
Write-Host "=== Method 1: Search InprocServer32 ==="
$key = "HKLM:\SOFTWARE\Classes\CLSID"
Get-ChildItem $key -ErrorAction SilentlyContinue | ForEach-Object {
    $guid = $_.PSChildName
    $inprocPath = "$key\$guid\InprocServer32"
    try {
        $val = (Get-ItemProperty -LiteralPath $inprocPath -Name '(default)' -ErrorAction Stop).'(default)'
        if ($val -and $val -like '*AccessTcp*') {
            Write-Host "FOUND: CLSID=$guid Path=$val"
            # Get the ProgID if any
            $progIdPath = "$key\$guid\ProgID"
            $progId = (Get-ItemProperty -LiteralPath $progIdPath -Name '(default)' -ErrorAction SilentlyContinue).'(default)'
            if ($progId) { Write-Host "  ProgID: $progId" }
        }
    } catch { }
}

# Method 2: Search for any key containing AccessTcp
Write-Host ""
Write-Host "=== Method 2: Search Registry Keys ==="
Get-ChildItem $key -ErrorAction SilentlyContinue | ForEach-Object {
    $guid = $_.PSChildName
    $path = "$key\$guid"
    (Get-ItemProperty -LiteralPath $path -ErrorAction SilentlyContinue).PSObject.Properties | ForEach-Object {
        if ($_.Value -is [string] -and $_.Value -like '*AccessTcp*') {
            Write-Host "FOUND: $guid -> $($_.Name) = $($_.Value)"
        }
    }
}

Write-Host ""
Write-Host "=== Done ==="
