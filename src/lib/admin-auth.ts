import { createHash, timingSafeEqual } from "node:crypto"

const COOKIE = "ochre_admin"

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD?.trim())
}

export function adminToken(password = process.env.ADMIN_PASSWORD?.trim() ?? "") {
  return createHash("sha256").update(`ochre-admin\n${password}`).digest("hex")
}

function safeEqual(presented: string, expected: string) {
  const left = Buffer.from(presented)
  const right = Buffer.from(expected)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

function cookieValue(request: Request) {
  const header = request.headers.get("cookie") ?? ""
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=")
    if (name === COOKIE) return decodeURIComponent(rest.join("="))
  }
  return ""
}

export function isAdminRequest(request: Request) {
  if (!adminConfigured()) return false
  const expected = adminToken()
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ?? ""
  const fromPassword = bearer && bearer !== expected ? adminToken(bearer) : ""
  const presented = cookieValue(request) || (bearer === expected ? bearer : fromPassword)
  return safeEqual(presented, expected)
}

export function adminCookie(password: string) {
  const secure = process.env.VERCEL ? "; Secure" : ""
  return `${COOKIE}=${adminToken(password)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800${secure}`
}

export function adminRequired(request: Request): Response | null {
  if (!adminConfigured()) {
    return Response.json({ error: "Set ADMIN_PASSWORD before the order desk can open." }, { status: 503 })
  }
  if (!isAdminRequest(request)) {
    return Response.json({ error: "The order desk is locked." }, { status: 401 })
  }
  return null
}
