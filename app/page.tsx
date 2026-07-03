import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">CampusHub</h1>
      <p className="text-muted-foreground">One Platform For Every College Student</p>
      <Button>Get Started</Button>
    </main>
  )
}