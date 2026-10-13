import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"
import { cookies } from "next/headers"
import { getJSON, putJSON, remove } from "./account-store.ts"

const scryptAsync = promisify(scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>
export const SESSION_COOKIE = "ochre_session"
const MAX_AGE = 60 * 60 * 24 * 30

export type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  passwordHash: string
  createdAt: string
}
export type PublicUser = Omit<User, "passwordHash">

export function publicUser(user: User): PublicUser {
  const { passwordHash: _hidden, ...rest } = user
  void _hidden
  return rest
}

function secret() {
  const fromEnv = process.env.ACCOUNT_SESSION_SECRET?.trim()
  if (fromEnv) return fromEnv
  // Production must set a real secret; previews and local dev use a fixed fallback.
  if (process.env.VERCEL_ENV === "production") return null
  return "ochre-preview-only-session-secret"
}

export function accountsEnabled() {
  return secret() !== null
}

export function normaliseEmail(email: string) {
  return email.trim().toLowerCase()
}

export function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 200
}

export function passwordProblem(pw: string) {
  if (pw.length < 8) return "Use at least 8 characters."
  if (!/[a-z]/i.test(pw) || !/[0-9]/.test(pw)) return "Use at least one letter and one number."
  if (pw.length > 200) return "That password is too long."
  return null
}

export async function hashPassword(pw: string) {
  const salt = randomBytes(16)
  const key = await scryptAsync(pw, salt, 64)
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`
}

export async function checkPassword(pw: string, stored: string) {
  const [kind, saltHex, keyHex] = stored.split("$")
  if (kind !== "scrypt" || !saltHex || !keyHex) return false
  const key = await scryptAsync(pw, Buffer.from(saltHex, "hex"), 64)
  const expected = Buffer.from(keyHex, "hex")
  return expected.length === key.length && timingSafeEqual(key, expected)
}

function emailKey(email: string) {
  return `email/${createHash("sha256").update(normaliseEmail(email)).digest("hex")}.json`
}

export async function findUserByEmail(email: string) {
  const ref = await getJSON<{ id: string }>(emailKey(email))
  return ref ? getUser(ref.id) : null
}

export function getUser(id: string) {
  if (!/^[a-f0-9]{32}$/.test(id)) return Promise.resolve(null)
  return getJSON<User>(`users/${id}.json`)
}

export async function createUser(input: { email: string; firstName: string; lastName: string; password: string }) {
  const user: User = {
    id: randomBytes(16).toString("hex"),
    email: normaliseEmail(input.email),
    firstName: input.firstName.trim().slice(0, 80),
    lastName: input.lastName.trim().slice(0, 80),
    passwordHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
  }
  await putJSON(`users/${user.id}.json`, user)
  await putJSON(emailKey(user.email), { id: user.id })
  return user
}

export async function saveUser(user: User, previousEmail?: string) {
  await putJSON(`users/${user.id}.json`, user)
  if (previousEmail && previousEmail !== user.email) {
    await putJSON(emailKey(user.email), { id: user.id })
    await remove(emailKey(previousEmail))
  }
}

function sign(payload: string) {
  return createHmac("sha256", secret() ?? "").update(payload).digest("base64url")
}

export function sessionCookie(userId: string) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE
  const payload = `${userId}.${exp}`
  const secure = process.env.VERCEL ? "; Secure" : ""
  return `${SESSION_COOKIE}=${payload}.${sign(payload)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${MAX_AGE}${secure}`
}

export function clearedCookie() {
  return `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`
}

export function readSession(value: string | undefined): string | null {
  if (!value || !accountsEnabled()) return null
  const [id, exp, sig] = value.split(".")
  if (!id || !exp || !sig) return null
  const expected = Buffer.from(sign(`${id}.${exp}`))
  const given = Buffer.from(sig)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null
  if (Number(exp) < Date.now() / 1000) return null
  return id
}

function cookieFromRequest(request: Request) {
  for (const part of (request.headers.get("cookie") ?? "").split(";")) {
    const [name, ...rest] = part.trim().split("=")
    if (name === SESSION_COOKIE) return rest.join("=")
  }
  return undefined
}

export async function userFromRequest(request: Request) {
  const id = readSession(cookieFromRequest(request))
  return id ? getUser(id) : null
}

/** For server components. */
export async function currentUser() {
  const jar = await cookies()
  const id = readSession(jar.get(SESSION_COOKIE)?.value)
  return id ? getUser(id) : null
}
