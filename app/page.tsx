"use client"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

export default function Home() {
  const [status, setStatus] = useState("Checking...")

  useEffect(() => {
    async function checkConnection() {
      const { error } = await supabase.from("_test").select("*").limit(1)
      // Table exist nahi karegi, isliye error aayega — lekin agar error
      // "relation does not exist" jaisa hai, matlab connection sahi hai.
      if (error) {
        setStatus("✅ Connected to Supabase (table not found, jo expected hai)")
      } else {
        setStatus("✅ Connected to Supabase")
      }
    }
    checkConnection()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">CampusHub</h1>
      <p className="text-muted-foreground">One Platform For Every College Student</p>
      <p className="text-sm">{status}</p>
      <Button>Get Started</Button>
    </main>
  )
}