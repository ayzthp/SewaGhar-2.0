"use client"

import type React from "react"

import { useState } from "react"
import { ref, push, set } from "firebase/database"
import { db, auth } from "@/lib/firebase"
import ImageUpload from "@/components/ImageUpload"

const categories = ["Plumbing", "Electrical", "Cleaning", "Carpentry", "Painting", "Gardening", "Other"]

export default function ProblemSubmissionForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState(categories[0])
  const [location, setLocation] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [wage, setWage] = useState("")
  const [contactNumber, setContactNumber] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = auth.currentUser
    if (user) {
      try {
        const newRequestRef = push(ref(db, "service_requests"))
        const newRequest = {
          id: newRequestRef.key!,
          customer_id: user.uid,
          provider_id: null,
          title,
          description,
          category,
          location,
          status: "pending",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          imageUrl,
          latitude,
          longitude,
          wage: Number.parseFloat(wage),
          contactNumber,
        }
        await set(newRequestRef, newRequest)

        // Reset form
        setTitle("")
        setDescription("")
        setCategory(categories[0])
        setLocation("")
        setImageUrl("")
        setLatitude(null)
        setLongitude(null)
        setWage("")
        setContactNumber("")

        alert("Service request submitted successfully!")
      } catch (error) {
        console.error("Error creating service request:", error)
        alert("Failed to submit service request. Please try again.")
      }
    } else {
      alert("You must be signed in to submit a request.")
    }
  }

  const handleImageUpload = (url: string) => {
    setImageUrl(url)
  }

  const handleLocationCapture = (lat: number, lng: number) => {
    setLatitude(lat)
    setLongitude(lng)
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Submit a New Request</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            rows={3}
          ></textarea>
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="wage" className="block text-sm font-medium text-gray-700">
            Wage (per hour)
          </label>
          <input
            type="number"
            id="wage"
            value={wage}
            onChange={(e) => setWage(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
            Contact Number
          </label>
          <input
            type="tel"
            id="contactNumber"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <ImageUpload onImageUpload={handleImageUpload} onLocationCapture={handleLocationCapture} />
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition-colors"
        >
          Submit Request
        </button>
      </form>
    </div>
  )
}

