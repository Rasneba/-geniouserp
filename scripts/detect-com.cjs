const ffi = require("ffi-napi");
const path = require("path");
const fs = require("fs");

const dllPath = path.join(__dirname, "..", "AccessTcp.dll");
console.log("[*] Loading:", dllPath);
console.log("[*] File size:", fs.statSync(dllPath).size, "bytes");

// Try to load the DLL and check for standard COM exports
const lib = ffi.Library(dllPath, {
  DllRegisterServer: ["int", []],
  DllUnregisterServer: ["int", []],
  DllGetClassObject: ["int", ["pointer", "pointer", "pointer"]],
  DllCanUnloadNow: ["int", []],
});

for (const fn of ["DllRegisterServer", "DllUnregisterServer", "DllGetClassObject", "DllCanUnloadNow"]) {
  try {
    if (typeof lib[fn] === "function") {
      console.log(`[+] ${fn}: EXPORTED`);
    }
  } catch (e) {
    console.log(`[-] ${fn}: NOT FOUND`);
  }
}

console.log("\n[*] Try running this in PowerShell to find the COM class:");
console.log(`
  Get-ChildItem HKLM:\\SOFTWARE\\Classes\\CLSID -ErrorAction SilentlyContinue | ForEach-Object {
    \$guid = \$_.PSChildName
    \$val = try { (Get-ItemProperty "HKLM:\\SOFTWARE\\Classes\\CLSID\\\$guid\\InprocServer32" -Name '(default)' -ErrorAction Stop).'(default)' } catch { \$null }
    if (\$val -and \$val -like '*AccessTcp*') { Write-Host "CLSID: \$guid -> \$val" }
  }
`);
