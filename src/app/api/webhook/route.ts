import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET handler to verify the webhook from Facebook
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode && token) {
    if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
      console.log("WEBHOOK VERIFIED!");
      return new NextResponse(challenge, { status: 200 });
    } else {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  return new NextResponse("Bad Request", { status: 400 });
}

// POST handler to receive incoming events
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Make sure this is a page subscription
    if (body.object === "page") {
      for (const entry of body.entry) {
        // Gets the body of the webhook event
        if (!entry.messaging) continue;
        
        for (const webhook_event of entry.messaging) {
          console.log("Incoming Messenger Event: ", JSON.stringify(webhook_event));

          // 1. Get the PSID
          const sender_psid = webhook_event.sender.id;
          
          let refParam = null;

          // 2. Extract the 'ref' parameter to link PSID with internalUser
          // The ref parameter can come in via postback, referral, or message referral.
          if (webhook_event.postback?.referral?.ref) {
            refParam = webhook_event.postback.referral.ref;
          } else if (webhook_event.referral?.ref) {
            refParam = webhook_event.referral.ref;
          } else if (webhook_event.message?.referral?.ref) {
             refParam = webhook_event.message.referral.ref;
          }

          // 3. If we received a mapping string we can link the PSID
          // Example link: m.me/YourPage?ref=some_internal_id
          if (refParam && sender_psid) {
            console.log(`Mapping Internal User: ${refParam} to PSID: ${sender_psid}`);
            try {
              // Ensure we only link to an existing user
              await prisma.user.update({
                where: { id: refParam },
                data: { psid: sender_psid },
              });
              console.log("Successfully linked PSID to user in DB.");
            } catch (err) {
              console.error("Failed to map PSID. User not found or DB error:", err);
            }
          }
        }
      }
      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    } else {
      return new NextResponse("Not Found", { status: 404 });
    }
  } catch (error) {
    console.error("Webhook Error: ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
