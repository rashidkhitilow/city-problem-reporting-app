import { createClient } from "@/lib/supabase/server"
import { ReportsFeed } from "@/components/reports-feed"
import { Header } from "@/components/header"

export default async function Page() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <main className="container mx-auto px-4 py-6 md:py-8">
        <ReportsFeed user={user} />
      </main>
    </div>
  )
}
