const http = require("http");

const DEVICE_IP = "192.168.0.68";
const BASE = `http://${DEVICE_IP}`;
const AUTH = Buffer.from("admin:888888").toString("base64");

function fetch(path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`${BASE}${path}`, {
      headers: { Authorization: `Basic ${AUTH}` },
      timeout: 5000
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => resolve({ status: res.statusCode, data: data.slice(0, 500) }));
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Timeout")); });
  });
}

async function main() {
  console.log("[*] Testing web interface at", BASE);

  const endpoints = [
    "/", "/status", "/api/status", "/cgi-bin/status",
    "/param.cgi", "/config.cgi"
  ];

  for (const ep of endpoints) {
    try {
      const r = await fetch(ep);
      console.log(`[${r.status}] ${ep}`);
      if (r.data) console.log("  Response:", r.data.slice(0, 200));
    } catch (e) {
      console.log(`[!] ${ep} - ${e.message}`);
    }
  }
}

main().catch(console.error);
