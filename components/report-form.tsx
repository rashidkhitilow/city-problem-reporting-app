"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Loader2, MapPin } from "lucide-react"
import Image from "next/image"

export function ReportForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState<{ lat: number; lng: number; city: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude

          // Reverse geocoding to get city name
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            )
            const data = await response.json()
            const city = data.address?.city || data.address?.town || data.address?.village || "Unknown City"

            setLocation({ lat, lng, city })
          } catch (error) {
            console.error("Error getting city:", error)
            setLocation({ lat, lng, city: "Unknown City" })
          }
        },
        (error) => {
          console.error("Error getting location:", error)
          setError("Unable to get your location. Please enable location services.")
        },
      )
    } else {
      setError("Geolocation is not supported by your browser")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!imageFile) {
      setError("Please upload an image")
      return
    }

    if (!location) {
      setError("Please enable location")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Upload image
      const formData = new FormData()
      formData.append("file", imageFile)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) throw new Error("Failed to upload image")

      const { url: imageUrl } = await uploadResponse.json()

      // Create report
      const reportResponse = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          imageUrl,
          latitude: location.lat,
          longitude: location.lng,
          city: location.city,
        }),
      })

      if (!reportResponse.ok) throw new Error("Failed to create report")

      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error submitting report:", error)
      setError("Failed to submit report. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report a City Issue</CardTitle>
        <CardDescription>Help improve your community by reporting problems</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="image">Photo</Label>
            <div className="flex flex-col gap-4">
              {imagePreview ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                  <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                </div>
              ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed">
                  <div className="text-center">
                    <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Upload a photo of the issue</p>
                  </div>
                </div>
              )}
              <Input id="image" type="file" accept="image/*" onChange={handleImageChange} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Brief description of the issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide more details about the problem"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            {location ? (
              <div className="flex items-center gap-2 rounded-lg border p-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{location.city}</p>
                  <p className="text-xs text-muted-foreground">
                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={getLocation} className="w-full bg-transparent">
                <MapPin className="mr-2 h-4 w-4" />
                Get Current Location
              </Button>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
