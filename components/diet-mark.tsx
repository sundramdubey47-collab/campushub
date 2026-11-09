export function DietMark({ diet }: { diet: string }) {
  const color = diet === "VEG" ? "#16a34a" : diet === "EGG" ? "#d97706" : "#dc2626"
  const label = diet === "VEG" ? "Veg" : diet === "EGG" ? "Egg" : "Non-Veg"

  return (
    <span
      title={label}
      className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border-2"
      style={{ borderColor: color }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
    </span>
  )
}