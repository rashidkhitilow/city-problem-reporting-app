import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { reportId } = body

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from("votes")
      .select()
      .eq("user_id", user.id)
      .eq("report_id", reportId)
      .single()

    if (existingVote) {
      // Remove vote
      await supabase.from("votes").delete().eq("user_id", user.id).eq("report_id", reportId)

      // Decrement vote count
      await supabase.rpc("decrement_vote_count", { report_id: reportId })

      return NextResponse.json({ voted: false })
    } else {
      // Add vote
      await supabase.from("votes").insert({
        user_id: user.id,
        report_id: reportId,
      })

      // Increment vote count
      await supabase.rpc("increment_vote_count", { report_id: reportId })

      return NextResponse.json({ voted: true })
    }
  } catch (error) {
    console.error("Error toggling vote:", error)
    return NextResponse.json({ error: "Failed to toggle vote" }, { status: 500 })
  }
}
