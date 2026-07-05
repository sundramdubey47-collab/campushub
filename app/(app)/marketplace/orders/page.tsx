"use client"

import { useEffect, useState } from "react"

type Order = {
  id: number
  finalPrice: number | null
  createdAt: string
  listing: {
    title: string
    imageUrl: string | null
    category: string
    seller: { name: string }
  }
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/my-orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data)
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Orders</h1>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground">No order available yet, check after some time</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4 flex items-center gap-4">
              {order.listing.imageUrl && (
                <img
                  src={order.listing.imageUrl}
                  alt={order.listing.title}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h2 className="font-semibold">{order.listing.title}</h2>
                <p className="text-sm text-muted-foreground">
                  Seller: {order.listing.seller.name} • {order.listing.category}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              {order.finalPrice && <p className="font-bold">₹{order.finalPrice}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}