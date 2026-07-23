"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CampusHubLogo } from "@/components/campushub-logo"

type IdData = {
  name: string
  email: string
  role: string
  college: string | null
  course: string | null
  semester: number | null
  section: string | null
  avatarUrl: string | null
  memberSince: string
  qrImage: string
  idNumber: string
}

export function DigitalIdCard() {
  const [data, setData] = useState<IdData | null>(null)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    fetch("/api/profile/id-card").then((r) => r.json()).then(setData)
  }, [])

  if (!data) return null

  const initials = data.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()

  return (
    <div className="w-full max-w-sm mx-auto" style={{ perspective: "1000px" }}>
      <motion.div
        className="relative w-full aspect-[1.6/1] cursor-pointer"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
        onClick={() => setFlipped(!flipped)}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.32_0.15_278)] p-5 text-white shadow-lg"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CampusHubLogo className="h-5 w-5" />
              <span className="text-xs font-bold">CampusHub ID</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{data.role}</span>
          </div>

          <div className="flex items-center gap-3 mt-4">
            {data.avatarUrl ? (
              <img src={data.avatarUrl} alt="" className="h-14 w-14 rounded-full object-cover border-2 border-white/30" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{data.name}</p>
              <p className="text-[11px] opacity-80 truncate">{data.college}</p>
              <p className="text-[11px] opacity-80">
                {data.course}{data.semester ? ` • Sem ${data.semester}` : ""}{data.section ? ` • Sec ${data.section}` : ""}
              </p>
            </div>
          </div>

          <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
            <span className="text-[10px] font-mono opacity-70">{data.idNumber}</span>
            <span className="text-[9px] opacity-60">Tap to flip →</span>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.32_0.15_278)] p-5 text-white shadow-lg flex flex-col items-center justify-center gap-2"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <img src={data.qrImage} alt="QR" className="h-32 w-32 rounded-lg bg-white p-2" />
          <p className="text-[10px] opacity-70">Scan to verify identity</p>
          <p className="text-[9px] opacity-60">Member since {new Date(data.memberSince).toLocaleDateString()}</p>
        </div>
      </motion.div>
    </div>
  )
}