"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useGoogleLogin } from "@react-oauth/google"
import axios from "axios"
import { Loader } from "@googlemaps/js-api-loader"
import { env } from "@/env.mjs"

interface Props {
  onImageUpload: (imageUrl: string) => void
  onLocationCapture: (lat: number, lng: number) => void
}

declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (input: HTMLInputElement, options?: object) => {
            addListener: (event: string, callback: () => void) => void;
            getPlace: () => {
              geometry?: {
                location: {
                  lat: () => number;
                  lng: () => number;
                };
              };
            };
          };
        };
      };
    };
  }
}

const ImageUploadAndLocation: React.FC<Props> = ({ onImageUpload, onLocationCapture }) => {
  const [file, setFile] = useState<File | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [address, setAddress] = useState("")
  const [uploading, setUploading] = useState(false)

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (file) {
        await uploadFileToDrive(tokenResponse.access_token)
      }
    },
    scope: "https://www.googleapis.com/auth/drive.file",
  })

  useEffect(() => {
    const loader = new Loader({
      apiKey: env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places"],
    })

    loader.load().then(() => {
      const autocomplete = new window.google.maps.places.Autocomplete(
        document.getElementById("address-input") as HTMLInputElement,
        { types: ["geocode"] },
      )

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace()
        if (place.geometry && place.geometry.location) {
          setLocation({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          })
          onLocationCapture(place.geometry.location.lat(), place.geometry.location.lng())
        }
      })
    })
  }, [onLocationCapture])

  const uploadFileToDrive = async (accessToken: string) => {
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const uploadResponse = await axios.post(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        },
      )

      const fileId = uploadResponse.data.id

      // Make file publicly accessible
      await axios.post(
        `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
        {
          role: "reader",
          type: "anyone",
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      const imageUrl = `https://drive.google.com/uc?id=${fileId}`
      onImageUpload(imageUrl)
    } catch (error) {
      console.error("Error uploading file:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleUpload = () => {
    if (file) {
      login()
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
        },
      )
    } else {
      console.error("Geolocation is not supported by this browser.")
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
        {uploading ? "Uploading..." : "Upload to Google Drive"}
      </button>
      <div>
        <label htmlFor="address-input" className="block text-sm font-medium text-gray-700">
          Enter Location
        </label>
        <input
          id="address-input"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your address"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <button
        onClick={handleGetCurrentLocation}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Get Current Location
      </button>
      {location && (
        <p className="text-sm text-gray-600">
          Latitude: {location.lat}, Longitude: {location.lng}
        </p>
      )}
    </div>
  )
}

export default ImageUploadAndLocation

