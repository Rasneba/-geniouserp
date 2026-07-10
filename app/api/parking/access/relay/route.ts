import { NextResponse } from "next/server";

const IP = "192.168.0.68";
const USER = "admin";
const PASSWORD = "888888";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let url = "";

    if (body.action === "open") {
      url = `http://${IP}/cdor.cgi?open=1&door=0`;
    }

    if (body.action === "close") {
      url = `http://${IP}/cdor.cgi?open=0&door=0`;
    }

    if (!url) {
      return NextResponse.json({ success: false, error: "invalid action" });
    }

    const r = await fetch(url, {
      headers: {
        Authorization:
          "Basic " + Buffer.from(`${USER}:${PASSWORD}`).toString("base64"),
      },
    });

    return NextResponse.json({ success: r.ok, status: r.status });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message });
  }
}
