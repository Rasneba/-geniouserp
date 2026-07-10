const ffi = require("ffi-napi");
const path = require("path");

const dllPath = path.join(__dirname, "..", "AccessTcp.dll");
console.log("[*] Loading DLL:", dllPath);

// Try common access control DLL function signatures
const lib = ffi.Library(dllPath, {
  // Network functions
  "OpenNet": ["int", ["string", "int"]],
  "CloseNet": ["int", []],
  "Connect": ["int", ["string", "int"]],
  "Disconnect": ["int", []],
  "CloseAll": ["int", []],

  // Door control
  "OpenDoor": ["int", ["int"]],
  "CloseDoor": ["int", ["int"]],
  "GetDoorState": ["int", ["int"]],

  // Card operations
  "ReadCard": ["int", []],
  "ReadCardNo": ["string", []],
  "GetCardCount": ["int", []],
  "GetCardByIndex": ["string", ["int"]],
  "GetCardById": ["string", ["int"]],

  // Device info
  "GetDeviceInfo": ["string", []],
  "GetSerialNumber": ["string", []],
  "GetDeviceTime": ["string", []],
  "SetDeviceTime": ["int", ["string"]],

  // Event monitoring
  "StartMonitor": ["int", ["int"]],
  "StopMonitor": ["int", []],
  "GetEvent": ["string", []],

  // User management
  "GetUserCount": ["int", []],
  "GetUser": ["string", ["int"]],
  "SetUser": ["int", ["string"]],

  // System
  "GetStatus": ["int", []],
  "Reboot": ["int", []],
  "Restart": ["int", []],
  "Reset": ["int", []],
});

// Try to call each function to see which ones exist
const toTest = [
  "OpenNet", "CloseNet", "Connect", "Disconnect",
  "OpenDoor", "CloseDoor", "GetDoorState",
  "ReadCard", "ReadCardNo",
  "GetDeviceInfo", "GetSerialNumber", "GetDeviceTime",
  "GetStatus", "Reboot", "Reset",
  "GetUserCount", "GetCardCount"
];

for (const fn of toTest) {
  try {
    const result = lib[fn]();
    console.log(`  ${fn}() =>`, result);
  } catch (e) {
    console.log(`  ${fn}() => NOT FOUND`);
  }
}
