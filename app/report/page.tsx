import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ReportForm } from "@/components/report-form"
import { Header } from "@/components/header"

export default async function Page() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <main className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
        <ReportForm />
      </main>
    </div>
  )
}
