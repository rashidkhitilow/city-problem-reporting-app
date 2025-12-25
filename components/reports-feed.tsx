"use client"

import { useEffect, useState } from "react"
import { ReportCard } from "@/components/report-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Loader2, Search } from "lucide-react"
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
  latitude: number
  longitude: number
}

export function ReportsFeed({ user }: { user: User | null }) {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState("votes")
  const [cityFilter, setCityFilter] = useState("")
  const [searchCity, setSearchCity] = useState("")

  const fetchReports = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({ sortBy })
      if (cityFilter) params.append("city", cityFilter)

      const response = await fetch(`/api/reports?${params}`)
      const data = await response.json()
      setReports(data.reports)
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [sortBy, cityFilter])

  const handleSearch = () => {
    setCityFilter(searchCity)
  }

  const handleClearFilter = () => {
    setSearchCity("")
    setCityFilter("")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-balance">Community Reports</h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Help prioritize city issues by supporting reports that matter most
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Filter by city</label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter city name"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} variant="secondary">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 sm:w-48">
          <label className="text-sm font-medium">Sort by</label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="votes">Most Supported</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {cityFilter && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing reports for: <strong>{cityFilter}</strong>
          </span>
          <Button size="sm" variant="ghost" onClick={handleClearFilter}>
            Clear filter
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No reports found. Be the first to report an issue!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} user={user} onVoteChange={fetchReports} />
          ))}
        </div>
      )}
    </div>
  )
}
