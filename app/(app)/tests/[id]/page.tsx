"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    Razorpay: any
  }
}

type Test = {
  id: number
  title: string
  topic: string
  difficulty: string
  durationMinutes: number
  isPremium: boolean
  price: number | null
  hasAccess: boolean
  createdBy: { name: string }
  _count: { questions: number }
}

export default function TestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const testId = params.id

  const [test, setTest] = useState<Test | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/tests/${testId}`).then((r) => r.json()).then(setTest)
  }, [testId])

  async function handleUnlock() {
    setError("")
    setLoading(true)

    const orderRes = await fetch(`/api/tests/${testId}/purchase`, { method: "POST" })
    const orderData = await orderRes.json()

    if (!orderRes.ok) {
      setError(orderData.error)
      setLoading(false)
      return
    }

    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: "INR",
      name: "CampusHub Test",
      description: test?.title,
      order_id: orderData.orderId,
      prefill: { name: session?.user?.name || "", email: session?.user?.email || "" },
      handler: async (response: any) => {
        const verifyRes = await fetch(`/api/tests/${testId}/verify-purchase`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        })
        if (verifyRes.ok) {
          const updated = await fetch(`/api/tests/${testId}`).then((r) => r.json())
          setTest(updated)
        } else {
          setError("Payment verify nahi ho paya")
        }
      },
      modal: { ondismiss: () => setLoading(false) },
      theme: { color: "#000000" },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
    setLoading(false)
  }

  if (!test) return <p className="text-muted-foreground">Load ho raha hai...</p>

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-bold">{test.title}</h1>
      <p className="text-muted-foreground">{test.topic}</p>

      <div className="flex gap-1">
        <span className="text-xs bg-muted px-2 py-1 rounded">{test.difficulty}</span>
        <span className="text-xs bg-muted px-2 py-1 rounded">{test.durationMinutes} min</span>
        <span className="text-xs bg-muted px-2 py-1 rounded">{test._count.questions} Questions</span>
      </div>

      <p className="text-sm text-muted-foreground">By {test.createdBy.name}</p>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {test.hasAccess ? (
        <Button onClick={() => router.push(`/tests/${test.id}/attempt`)}>Test Shuru Karo</Button>
      ) : (
        <div className="space-y-2">
          <p className="text-sm">Ye paid test hai — ₹{test.price} me unlock karo</p>
          <Button onClick={handleUnlock} disabled={loading}>
            {loading ? "Loading..." : `Unlock Karo (₹${test.price})`}
          </Button>
        </div>
      )}
    </div>
  )
}