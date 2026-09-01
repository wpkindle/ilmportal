import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 5.0, count, size = 'sm', showScore = true }) => {
  const numRating = Number(rating) || 5.0;
  const starSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSizes[size] || 'w-4 h-4'} ${
              star <= Math.round(numRating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-300'
            }`}
          />
        ))}
      </div>
      {showScore && (
        <span className="text-xs font-bold text-slate-700 ml-1">
          {numRating.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-xs text-slate-500">
          ({count})
        </span>
      )}
    </div>
  );
};

export default RatingStars;
