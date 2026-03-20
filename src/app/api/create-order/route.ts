import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized. Please log in." }),
        { status: 401 }
      );
    }
    
    const userSession = session.user as any;
    if (!userSession?.id) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized. Missing user ID." }),
        { status: 401 }
      );
    }

    const userId = userSession.id;

    // Fetch user to check if they have a PSID linked
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "User not found." }), {
        status: 404,
      });
    }

    // 1. Create order in DB
    const body = await request.json();
    const items = body.items || JSON.stringify([{ name: "Product A", price: 15.99 }]);
    const total = body.total || 15.99;

    const newOrder = await prisma.order.create({
      data: {
        userId: user.id,
        items: items,
        total: total,
        status: "pending",
      },
    });

    console.log("Order created:", newOrder.id);

    // 2. Check if PSID exists
    if (!user.psid) {
      // Return flag to prompt user to connect messenger
      return new NextResponse(
        JSON.stringify({
          order: newOrder,
          connect_messenger_required: true,
          message: "Order created successfully! Please connect your Facebook Messenger to get updates.",
        }),
        { status: 200 }
      );
    }

    // 3. User has a PSID! Send the order summary
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const sendMessageUrl = `${baseUrl}/api/send-message`;

    const summaryText = `Hello ${user.name || "Customer"}, your order #${newOrder.id} has been created successfully! Total: $${total.toFixed(2)}`;

    try {
      const sendRes = await fetch(sendMessageUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ psid: user.psid, message: summaryText }),
      });

      if (!sendRes.ok) {
        console.error("Message send failed.");
      }
    } catch (e) {
      console.error("Failed to trigger message API:", e);
    }

    return new NextResponse(
      JSON.stringify({
        order: newOrder,
        connect_messenger_required: false,
        message: "Order placed and summary sent to Messenger!",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Order Creation Error:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
