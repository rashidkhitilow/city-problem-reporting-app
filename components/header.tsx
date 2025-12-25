"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import type { User } from "@supabase/supabase-js"

export function Header({ user }: { user: User | null }) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <AlertTriangle className="h-5 w-5 text-primary" />
          <span className="text-lg">CityReport</span>
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="default">
                <Link href="/report">Report Issue</Link>
              </Button>
              <Button onClick={handleSignOut} variant="ghost">
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/auth/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
