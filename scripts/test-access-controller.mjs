import net from "net";

const PORT = 8001;

const server = net.createServer((socket) => {
  const addr = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`[+] Device connected from ${addr}`);

  socket.on("data", (data) => {
    console.log(`\n[RECV ${data.length} bytes]`);
    console.log("Hex:", data.toString("hex").match(/.{1,2}/g).join(" "));
    console.log("ASCII:", data.toString("ascii").replace(/[\x00-\x1f]/g, "."));
  });

  socket.on("close", () => console.log(`[-] Device disconnected: ${addr}`));
  socket.on("error", (err) => console.log(`[!] Socket error: ${err.message}`));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[*] TCP listener running on 0.0.0.0:${PORT}`);
  console.log(`[*] Device at 192.168.0.68 is configured to connect here`);
  console.log(`[*] Make sure your machine IP matches 192.168.0.10, or:`);
  console.log(`    1. Change device Server IP to your machine's IP`);
  console.log(`    2. Or switch device to "Controller is Server" mode`);
  console.log(`[*] Waiting for device connection...\n`);
});
