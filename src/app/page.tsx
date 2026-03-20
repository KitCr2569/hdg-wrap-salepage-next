"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = () => signIn("facebook");
  const handleLogout = () => signOut();

  const createOrder = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: JSON.stringify([{ name: "Premium Widget", price: 49.99 }]),
          total: 49.99,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.connect_messenger_required) {
          setMessage(`Order created, but we need you to connect Messenger to send your summary!`);
        } else {
          setMessage(`Order created & summary sent to your Messenger!`);
        }
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (e) {
      setMessage("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const pageName = process.env.NEXT_PUBLIC_PAGE_NAME || "YOUR_PAGE_NAME";
  const user = session?.user as any;
  const internalUserId = user?.id;
  const isMessengerConnected = user?.hasMessengerLinked;

  if (status === "loading") {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900 font-sans flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        <h1 className="text-3xl font-bold mb-2 text-blue-600">Dual-App Facebook Integration</h1>
        <p className="text-gray-500 mb-8 border-b pb-6">
          App A (Auth) and App B (Messenger) working together via PSID mapping.
        </p>

        {!session ? (
          <div className="flex flex-col items-center space-y-4 py-12">
            <h2 className="text-xl font-semibold text-gray-700">Step 1: Authenticate</h2>
            <p className="text-gray-500 text-sm text-center">Log in with App A (public_profile, email only)</p>
            <button
              onClick={handleLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition shadow-md shadow-blue-200"
            >
              Login with Facebook
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h2 className="text-lg font-semibold text-blue-900 mb-1">Hello, {user?.name}</h2>
              <p className="text-sm text-blue-700 mb-4">{user?.email}</p>
              
              <div className="flex items-center space-x-2 text-sm font-medium">
                <span className="text-gray-600">Messenger Status:</span>
                {isMessengerConnected ? (
                  <span className="text-green-600 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    Connected
                  </span>
                ) : (
                  <span className="text-amber-500 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
                    Not Connected
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition">
                <h3 className="font-semibold text-gray-800 mb-2">Create an Order</h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                  Simulate a purchase. If Messenger is connected, you'll receive a receipt instantly.
                </p>
                <button
                  onClick={createOrder}
                  disabled={loading}
                  className="w-full bg-gray-900 hover:bg-black text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition"
                >
                  {loading ? "Processing..." : "Buy Premium Widget ($49.99)"}
                </button>
              </div>

              <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Connect Messenger</h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Link your PSID via an m.me referral link using App B.
                  </p>
                </div>
                <a
                  href={`https://m.me/${pageName}?ref=${internalUserId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center block bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 py-2.5 rounded-lg text-sm font-medium transition"
                >
                  Contact via Messenger
                </a>
              </div>
            </div>

            {message && (
              <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm font-medium">
                {message}
              </div>
            )}

            <div className="pt-6 border-t flex justify-end">
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-800 text-sm font-medium transition"
              >
                Log out
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
