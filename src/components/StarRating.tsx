import { Star } from 'lucide-react'

interface StarRatingProps {
  score: number
  onChange?: (score: number) => void
  size?: number
}

export default function StarRating({ score, onChange, size = 20 }: StarRatingProps) {
  const interactive = !!onChange

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          onClick={() => onChange?.(star === score ? 0 : star)}
        >
          <Star
            size={size}
            className={
              star <= score
                ? 'fill-[#fa2d48] text-[#fa2d48]'
                : 'fill-none text-[#c7c7cc]'
            }
          />
        </button>
      ))}
    </div>
  )
}
