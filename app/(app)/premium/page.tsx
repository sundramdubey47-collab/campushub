"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    Razorpay: any
  }
}

const PLANS = [
  { type: "WEEKLY", label: "Weekly", price: 49 },
  { type: "MONTHLY", label: "Monthly", price: 149 },
  { type: "YEARLY", label: "Yearly", price: 999 },
]

export default function PremiumPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function handleSubscribe(planType: string) {
    setError("")
    setLoading(planType)

    const orderRes = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planType }),
    })
    const orderData = await orderRes.json()

    if (!orderRes.ok) {
      setError(orderData.error)
      setLoading(null)
      return
    }

    const razorpayOptions = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: "INR",
      name: "CampusHub Premium",
      description: `${planType} Plan`,
      order_id: orderData.orderId,
      prefill: {
        name: session?.user?.name || "",
        email: session?.user?.email || "",
      },
      handler: async function (response: any) {
        const verifyRes = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        })

        if (verifyRes.ok) {
          router.push("/dashboard")
        } else {
          setError("Payment verify nahi ho paya")
        }
      },
      modal: {
        ondismiss: () => setLoading(null),
      },
      theme: { color: "#000000" },
    }

    const rzp = new window.Razorpay(razorpayOptions)
    rzp.open()
    setLoading(null)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Premium Membership</h1>
      <p className="text-muted-foreground">Unlock Premium to download exclusive notes/Academic Resources</p>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLANS.map((plan) => (
          <div key={plan.type} className="border rounded-lg p-6 text-center space-y-3">
            <h2 className="font-semibold text-lg">{plan.label}</h2>
            <p className="text-3xl font-bold">₹{plan.price}</p>
            <Button className="w-full" onClick={() => handleSubscribe(plan.type)} disabled={loading === plan.type}>
              {loading === plan.type ? "Loading..." : "Subscribe"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}