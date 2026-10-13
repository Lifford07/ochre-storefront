export function HeroRoom({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 460" className={className} role="img" aria-label="A print above a sofa, drawn as a stand-in">
      <rect width="640" height="460" fill="#E7E1D6" />
      <rect x="150" y="36" width="340" height="150" fill="#F7F3EC" />
      <rect x="168" y="52" width="304" height="118" fill="#F3D2B0" />
      <rect x="168" y="118" width="304" height="52" fill="#1B3A4B" />
      <circle cx="320" cy="108" r="16" fill="#E07A5F" />
      <path d="M70 300c40-70 90-78 140-40 30 24 70 28 120 8 40-16 90-10 140 28 30 22 70 30 110 18v86H70z" fill="#F7F4EE" />
      <rect x="118" y="292" width="78" height="58" rx="8" fill="#E07A5F" />
      <rect x="210" y="300" width="78" height="52" rx="8" fill="#1B3A4B" />
      <rect y="390" width="640" height="70" fill="#C4B49A" />
    </svg>
  )
}
