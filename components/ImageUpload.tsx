"use client"

import type React from "react"
import { useState } from "react"
import axios from "axios"

interface Props {
  onImageUpload: (imageUrl: string) => void
  onLocationCapture: (lat: number, lng: number) => void
}

const ImageUpload: React.FC<Props> = ({ onImageUpload, onLocationCapture }) => {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const API_KEY = "51abfda0d80668f7065c8b890a06b282"

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)

    const formData = new FormData()
    formData.append("image", file)

    try {
      const response = await axios.post(`https://api.imgbb.com/1/upload?key=${API_KEY}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      if (response.data && response.data.data?.url) {
        onImageUpload(response.data.data.url)
        alert("Image uploaded successfully!")
      } else {
        alert("Failed to upload image.")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Error uploading image.")
    } finally {
      setUploading(false)
    }
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setLocation({ lat, lng })
          onLocationCapture(lat, lng)
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Error getting location. Please make sure you have granted permission to access your location.")
        },
      )
    } else {
      alert("Geolocation is not supported by this browser.")
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
          Upload Image
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload Image"}
      </button>
      <div>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Get Current Location
        </button>
        {location && (
          <p className="mt-2 text-sm text-gray-600">
            Latitude: {location.lat.toFixed(6)}, Longitude: {location.lng.toFixed(6)}
          </p>
        )}
      </div>
    </div>
  )
}

export default ImageUpload

