"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThumbsUp, MapPin, Calendar } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface Report {
  id: string
  title: string
  description: string
  image_url: string
  city: string
  vote_count: number
  created_at: string
  user_id: string
}

export function ReportCard({
  report,
  user,
  onVoteChange,
}: {
  report: Report
  user: User | null
  onVoteChange: () => void
}) {
  const router = useRouter()
  const [hasVoted, setHasVoted] = useState(false)
  const [isVoting, setIsVoting] = useState(false)

  useEffect(() => {
    const checkVoteStatus = async () => {
      if (!user) return

      const supabase = createClient()
      const { data } = await supabase.from("votes").select().eq("user_id", user.id).eq("report_id", report.id).single()

      setHasVoted(!!data)
    }

    checkVoteStatus()
  }, [user, report.id])

  const handleVote = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    setIsVoting(true)
    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: report.id }),
      })

      const data = await response.json()
      setHasVoted(data.voted)
      onVoteChange()
    } catch (error) {
      console.error("Error voting:", error)
    } finally {
      setIsVoting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video w-full">
        <Image src={report.image_url || "/placeholder.svg"} alt={report.title} fill className="object-cover" />
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">{report.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{report.description}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{report.city}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(report.created_at)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button onClick={handleVote} disabled={isVoting} variant={hasVoted ? "default" : "outline"} className="w-full">
          <ThumbsUp className="mr-2 h-4 w-4" />
          {hasVoted ? "Supported" : "Support"} ({report.vote_count})
        </Button>
      </CardFooter>
    </Card>
  )
}
