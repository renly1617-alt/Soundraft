import { User } from 'lucide-react'
import { useUserStore } from '@/stores/userStore'

interface AvatarProps {
  size?: number
  onClick?: () => void
}

export default function Avatar({ size = 36, onClick }: AvatarProps) {
  const profile = useUserStore(s => s.profile)

  return (
    <button
      onClick={onClick}
      className="rounded-full flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-[#fa2d48]/30 transition-all shrink-0 bg-[#e5e5ea]"
      style={{ width: size, height: size }}
    >
      {profile.avatarUrl ? (
        <img
          src={profile.avatarUrl}
          alt="头像"
          className="w-full h-full object-cover"
        />
      ) : (
        <User size={size * 0.5} className="text-[#8e8e93]" />
      )}
    </button>
  )
}
