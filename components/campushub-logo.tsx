export function CampusHubLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="40" height="40" rx="10" fill="oklch(0.38 0.15 278)" />
      <path
        d="M20 9L31 14.5V15.5L20 21L9 15.5V14.5L20 9Z"
        fill="oklch(0.985 0.004 90)"
      />
      <path
        d="M13 18.5V25.5C13 25.5 15.5 28 20 28C24.5 28 27 25.5 27 25.5V18.5L20 22L13 18.5Z"
        fill="oklch(0.72 0.15 60)"
      />
      <circle cx="30" cy="17" r="1.6" fill="oklch(0.985 0.004 90)" />
    </svg>
  )
}