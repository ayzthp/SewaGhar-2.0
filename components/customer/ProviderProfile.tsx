import type React from "react"
import type { ProviderProfile } from "@/lib/firebase"
import { Star } from "lucide-react"
import Image from "next/image"

interface ProviderProfileProps {
  profile: ProviderProfile
}

const ProviderProfileView: React.FC<ProviderProfileProps> = ({ profile }) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Provider Profile</h3>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.name}</dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Average Rating</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              <div className="flex items-center">
                <span className="mr-2">{profile.averageRating?.toFixed(1) || 'No ratings yet'}</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      profile.averageRating && star <= profile.averageRating ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </dd>
          </div>

          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Bio</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile.bio}</dd>
          </div>
        </dl>
      </div>
      {profile.profilePicture && (
        <div className="px-4 py-5 sm:px-6">
          <Image
            src={profile.profilePicture || "/placeholder.svg"}
            alt={`${profile.name}'s profile`}
            width={128}
            height={128}
            className="w-32 h-32 rounded-full mx-auto"
          />
        </div>
      )}
    </div>
  )
}

export default ProviderProfileView

