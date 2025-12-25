import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get("sortBy") || "votes"
    const city = searchParams.get("city")

    const supabase = await createClient()

    let query = supabase.from("reports").select(`
        *,
        votes(count)
      `)

    if (city) {
      query = query.eq("city", city)
    }

    if (sortBy === "votes") {
      query = query.order("vote_count", { ascending: false })
    } else {
      query = query.order("created_at", { ascending: false })
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ reports: data })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}

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
    const { title, description, imageUrl, latitude, longitude, city } = body

    const { data, error } = await supabase
      .from("reports")
      .insert({
        user_id: user.id,
        title,
        description,
        image_url: imageUrl,
        latitude,
        longitude,
        city,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ report: data })
  } catch (error) {
    console.error("Error creating report:", error)
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 })
  }
}
