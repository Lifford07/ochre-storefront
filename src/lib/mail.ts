const FOUNDER = "segunjunaid1@gmail.com"

type Letter = { to: string; subject: string; text: string }

export async function sendMail(letter: Letter) {
  const key = process.env.RESEND_API_KEY?.trim()
  const from = process.env.RESEND_FROM?.trim()
  if (!key || !from) return { sent: false as const }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ from, to: [letter.to], subject: letter.subject, text: letter.text }),
  })
  if (!response.ok) {
    console.error("order-mail", response.status)
    return { sent: false as const }
  }
  return { sent: true as const }
}

export function confirmCustomer(input: { to: string; id: string; summary: string; link: string }) {
  return sendMail({
    to: input.to,
    subject: `Ochré order ${input.id}`,
    text: [
      `Your Ochré order ${input.id} is open.`,
      input.summary,
      "We make the piece after the USDC payment has cleared and a person has checked the file.",
      `Certificate: ${input.link}`,
    ].join("\n\n"),
  })
}

export function alertFounder(input: { id: string; summary: string; ship: string; payer: string }) {
  return sendMail({
    to: FOUNDER,
    subject: `Paid Ochré order ${input.id}`,
    text: [`Paid order ${input.id}.`, input.summary, `Payer wallet: ${input.payer}`, input.ship, "Check /admin/orders for the print file."].join("\n\n"),
  })
}
