const ZKLib = require("node-zklib");

const DEVICE_IP = "192.168.0.68";
const DEVICE_PORT = 8000;

async function test() {
  console.log(`[*] Attempting ZKTeco protocol to ${DEVICE_IP}:${DEVICE_PORT}...`);

  const zk = new ZKLib(DEVICE_IP, DEVICE_PORT, 5000, 4000);

  try {
    await zk.connect();
    console.log("[+] Connected! Device speaks ZKTeco protocol");

    await zk.disableDevice();
    console.log("[+] Device disabled");

    try {
      const info = await zk.getInfo();
      console.log("[+] Device info:", JSON.stringify(info, null, 2));
    } catch (e) {
      console.log("[!] getInfo failed:", e.message);
    }

    try {
      const users = await zk.getUsers();
      console.log(`[+] Users: ${users?.data?.length || 0}`);
      if (users?.data?.length > 0) {
        console.log("  First user:", JSON.stringify(users.data[0]));
      }
    } catch (e) {
      console.log("[!] getUsers failed:", e.message);
    }

    try {
      const att = await zk.getAttendances();
      console.log(`[+] Attendance logs: ${att?.data?.length || 0}`);
    } catch (e) {
      console.log("[!] getAttendances failed:", e.message);
    }

    await zk.enableDevice();
    await zk.disconnect();
    console.log("[+] Disconnected OK");

  } catch (err) {
    console.log(`[!] FAILED - Not a ZKTeco-compatible device`);
    console.log(`    ${err.message}`);
    console.log(`\n[*] Try using accesstcp.dll instead with ffi-napi`);
  }
}

test().catch(console.error);
