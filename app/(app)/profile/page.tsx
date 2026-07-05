"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type Profile = {
  name: string
  email: string
  role: string
  isPremium: boolean
  college: { name: string } | null
  department: { name: string } | null
  course: { name: string } | null
  semester: { number: number } | null
  totalDownloadsReceived: number
  uploadedNotes: { id: number; title: string; views: number; downloads: number; createdAt: string }[]
  coupons: { id: number; code: string; discountPercent: number; isUsed: boolean }[]
  buyerOrders: { id: number; finalPrice: number | null; listing: { title: string; imageUrl: string | null } }[]
  bookmarks: { id: number; note: { id: number; title: string } }[]
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then(setProfile)
  }, [])

  if (!profile) return <p className="text-muted-foreground">Load ho raha hai...</p>

  return (
    <div className="max-w-3xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">{profile.name}</h1>
        <p className="text-muted-foreground">{profile.email}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-xs bg-muted px-2 py-1 rounded">{profile.role}</span>
          {profile.isPremium && (
            <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded">Premium</span>
          )}
          {profile.college && <span className="text-xs bg-muted px-2 py-1 rounded">{profile.college.name}</span>}
          {profile.department && <span className="text-xs bg-muted px-2 py-1 rounded">{profile.department.name}</span>}
          {profile.course && <span className="text-xs bg-muted px-2 py-1 rounded">{profile.course.name}</span>}
          {profile.semester && <span className="text-xs bg-muted px-2 py-1 rounded">Sem {profile.semester.number}</span>}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{profile.uploadedNotes.length}</p>
          <p className="text-xs text-muted-foreground">Uploads</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{profile.totalDownloadsReceived}</p>
          <p className="text-xs text-muted-foreground">Downloads Received</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{profile.coupons.length}</p>
          <p className="text-xs text-muted-foreground">Coupons</p>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{profile.buyerOrders.length}</p>
          <p className="text-xs text-muted-foreground">Orders</p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-lg">Mere Uploads</h2>
        {profile.uploadedNotes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Koi upload nahi hai</p>
        ) : (
          <div className="space-y-2">
            {profile.uploadedNotes.map((note) => (
              <Link key={note.id} href={`/notes/${note.id}`}>
                <div className="border rounded-lg p-3 hover:border-primary transition-colors">
                  <p className="font-medium">{note.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {note.views} views • {note.downloads} downloads
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-lg">Mere Coupons</h2>
        {profile.coupons.length === 0 ? (
          <p className="text-sm text-muted-foreground">Koi coupon nahi hai</p>
        ) : (
          <div className="space-y-2">
            {profile.coupons.map((coupon) => (
              <div key={coupon.id} className="border rounded-lg p-3 flex items-center justify-between">
                <span className="font-mono">{coupon.code}</span>
                <span className="text-sm">{coupon.discountPercent}% off</span>
                <span className={`text-xs px-2 py-1 rounded ${coupon.isUsed ? "bg-muted" : "bg-green-500/20 text-green-600"}`}>
                  {coupon.isUsed ? "Used" : "Available"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-lg">Meri Orders</h2>
        {profile.buyerOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Koi order nahi hai</p>
        ) : (
          <div className="space-y-2">
            {profile.buyerOrders.map((order) => (
              <div key={order.id} className="border rounded-lg p-3 flex items-center gap-3">
                {order.listing.imageUrl && (
                  <img src={order.listing.imageUrl} alt="" className="w-10 h-10 object-cover rounded" />
                )}
                <span>{order.listing.title}</span>
                {order.finalPrice && <span className="ml-auto font-bold">₹{order.finalPrice}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-lg">Mere Bookmarks</h2>
        {profile.bookmarks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Koi bookmark nahi hai</p>
        ) : (
          <div className="space-y-2">
            {profile.bookmarks.map((b) => (
              <Link key={b.id} href={`/notes/${b.note.id}`}>
                <div className="border rounded-lg p-3 hover:border-primary transition-colors">
                  {b.note.title}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}