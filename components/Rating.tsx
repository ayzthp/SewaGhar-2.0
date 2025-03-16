"use client";

import { useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { ref, update, get } from 'firebase/database';
import { Button } from './ui/button';
import { toast } from '@/hooks/use-toast';

interface RatingProps {
  targetUserId: string;
  requestId: string;
  userType: 'provider' | 'customer';
}

const Rating: React.FC<RatingProps> = ({ targetUserId, requestId, userType }) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

  const handleSubmitRating = async () => {
    if (!auth.currentUser) return;

    try {
      const ratingData = {
        rating,
        comment,
        createdAt: Date.now(),
        fromUserId: auth.currentUser.uid,
        fromUserType: userType === 'provider' ? 'customer' : 'provider'
      };

      // Update the rating in the user's profile
      const userRatingsRef = ref(db, `users/${targetUserId}/ratings/${requestId}`);
      await update(userRatingsRef, ratingData);

      // Calculate and update average rating
      const userRef = ref(db, `users/${targetUserId}`);
      const ratingsRef = ref(db, `users/${targetUserId}/ratings`);
      const ratingsSnapshot = await get(ratingsRef);
      const ratings = ratingsSnapshot.val() || {};
      
      type RatingItem = { rating: number };
      const ratingValues = Object.values(ratings as Record<string, RatingItem>).map(r => r.rating);
      const averageRating = ratingValues.reduce((a: number, b: number) => a + b, 0) / ratingValues.length;
      
      await update(userRef, { averageRating });

      // Mark the request as reviewed
      const requestRef = ref(db, `service_requests/${requestId}`);
      await update(requestRef, { reviewed: true });

      toast({
        title: "Rating submitted",
        description: "Thank you for your feedback!"
      });
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Rate your experience</h3>
      <div className="flex mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Leave a comment (optional)"
        className="w-full p-2 border rounded-md mb-4"
        rows={3}
      />
      <Button
        onClick={handleSubmitRating}
        disabled={rating === 0}
        className="w-full"
      >
        Submit Rating
      </Button>
    </div>
  );
};

export default Rating;