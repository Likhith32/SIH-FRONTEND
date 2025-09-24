import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

// Ensure environment variables exist
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioNumber) {
  throw new Error("Twilio environment variables are missing!");
}

const client = twilio(accountSid, authToken);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, title, message, severity, location, type } = body;

    if (!phone || !message) {
      return NextResponse.json(
        { success: false, error: "Phone and message are required" },
        { status: 400 }
      );
    }

    // Ensure phone includes country code
    const phoneWithCode = phone.startsWith("+") ? phone : `+${phone}`;

    const result = await client.messages.create({
      from: twilioNumber,
      to: phoneWithCode,
      body: `ALERT: ${title || "No Title"}\nType: ${type || "General"}\nSeverity: ${severity || "N/A"}\nLocation: ${location || "Unknown"}\nMessage: ${message}`,
    });

    console.log("Twilio message sent:", result.sid);

    return NextResponse.json({ success: true, sid: result.sid });
  } catch (err: any) {
    console.error("Twilio send failed:", err);

    // Include Twilio error message if available
    const errorMessage = err?.message || "Failed to send message";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
