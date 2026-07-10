const ffi = require("ffi-napi");
const ref = require("ref-napi");
const path = require("path");

const dllPath = path.join(__dirname, "..", "AccessTcp.dll");
console.log("[*] Loading DLL:", dllPath);

try {
  const lib = ffi.Library(dllPath, {});
  console.log("[+] DLL loaded successfully");
  console.log("[*] Note: ffi-napi can't enumerate exports automatically");
  console.log("[*] You need to know the function signatures.");
  console.log("\nCommon functions for access control DLLs:");
  console.log("  OpenNet(ip: string, port: int) -> int");
  console.log("  CloseNet() -> int");
  console.log("  OpenDoor(doorId: int) -> int");
  console.log("  CloseDoor(doorId: int) -> int");
  console.log("  ReadCard() -> string");
  console.log("  GetCardCount() -> int");
  console.log("  GetDeviceInfo() -> string");
} catch (err) {
  console.error("[!] Failed to load DLL:", err.message);
}
