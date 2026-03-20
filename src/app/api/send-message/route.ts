import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { psid, message } = await request.json();

    if (!psid || !message) {
      return new NextResponse(
        JSON.stringify({ error: "Missing PSID or message text." }),
        { status: 400 }
      );
    }

    const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
    if (!PAGE_ACCESS_TOKEN) {
      return new NextResponse(
        JSON.stringify({ error: "No Page Access Token configured." }),
        { status: 500 }
      );
    }

    const url = `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`;

    const requestBody = {
      recipient: { id: psid },
      message: { text: message },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Failed to send FB message", data);
      return new NextResponse(
        JSON.stringify({ error: "Failed to send message via Messenger API", details: data }),
        { status: res.status }
      );
    }

    return new NextResponse(JSON.stringify({ success: true, ...data }), {
      status: 200,
    });
  } catch (error) {
    console.error("Send Message Exception:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
