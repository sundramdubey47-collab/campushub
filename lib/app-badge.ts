export async function updateAppBadge(count: number) {
  try {
    if (count > 0 && "setAppBadge" in navigator) {
      await (navigator as any).setAppBadge(count)
    } else if ("clearAppBadge" in navigator) {
      await (navigator as any).clearAppBadge()
    }
  } catch (err) {
    console.error("[App Badge] Failed to update:", err)
  }
}