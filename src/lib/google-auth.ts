export function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim())
}

export function googleRedirectUri(request: Request) {
  return `${new URL(request.url).origin}/api/auth/google/callback`
}
