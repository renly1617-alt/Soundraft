import { Disc3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function EmptyState() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center py-32 px-4">
      <div className="w-32 h-32 rounded-full bg-[#f2f2f6] flex items-center justify-center mb-8">
        <Disc3 size={56} className="text-[#c7c7cc]" />
      </div>
      <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-2 tracking-tight">
        还没有专辑
      </h2>
      <p className="text-[#8e8e93] mb-8 text-center max-w-sm leading-relaxed">
        粘贴网易云专辑分享链接，自动获取专辑信息，记录你的音乐品味
      </p>
      <button
        onClick={() => navigate('/add')}
        className="px-8 py-3 bg-[#fa2d48] text-white rounded-full text-sm font-semibold hover:bg-[#e0283f] active:scale-95 transition-all"
      >
        添加第一张专辑
      </button>
    </div>
  )
}
