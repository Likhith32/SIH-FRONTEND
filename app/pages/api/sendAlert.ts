import type { NextApiRequest, NextApiResponse } from "next"
import twilio from "twilio"

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" })

  const { phone, title, message, severity, location, type } = req.body

  if (!phone || !message) return res.status(400).json({ message: "Phone and message are required" })

  try {
    const result = await client.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio number
      to: phone,                              // Include country code, e.g., +919876543210
      body: `ALERT: ${title}\nType: ${type}\nSeverity: ${severity}\nLocation: ${location}\nMessage: ${message}`,
    })

    return res.status(200).json({ success: true, sid: result.sid })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, error: "Failed to send message" })
  }
}
