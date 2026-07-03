import { auth } from "@/auth"

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold">Welcome, {session?.user?.name}</h1>
      <p className="text-muted-foreground">Email: {session?.user?.email}</p>
      <p className="text-muted-foreground">Role: {session?.user?.role}</p>
    </div>
  )
}