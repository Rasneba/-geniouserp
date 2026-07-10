const net = require("net");

const DEVICE_IP = "192.168.0.68";
const DEVICE_PORT = 8000;
const TIMEOUT = 5000;

const socket = new net.Socket();

console.log(`[*] Connecting to ${DEVICE_IP}:${DEVICE_PORT}...`);

socket.setTimeout(TIMEOUT);

socket.on("connect", () => {
  console.log("[+] TCP CONNECTED!");
  console.log("[*] Sending probe packet...");

  // Send a simple probe - many controllers respond to a magic byte or status request
  // Common probe: 0x00 or a simple packet
  const probe = Buffer.alloc(8, 0);
  socket.write(probe);
});

socket.on("data", (data) => {
  console.log(`[+] RECEIVED ${data.length} bytes:`);
  console.log("  Hex:", data.toString("hex").match(/.{1,2}/g).join(" "));
  console.log("  ASCII:", data.toString("ascii").replace(/[\x00-\x1f]/g, "."));
  socket.destroy();
});

socket.on("timeout", () => {
  console.log("[!] Connection timeout (no response in 5s)");
  socket.destroy();
});

socket.on("error", (err) => {
  console.log(`[!] Connection error: ${err.message}`);
  console.log("[*] Make sure you're on the same LAN (192.168.0.x)");
  console.log("[*] And the device is powered on");
});

socket.on("close", () => {
  console.log("[*] Connection closed");
  process.exit(0);
});

socket.connect(DEVICE_PORT, DEVICE_IP);
