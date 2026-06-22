import { useState, useRef } from 'react'
import { ArrowLeft, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/stores/userStore'
import Avatar from '@/components/Avatar'

export default function SettingsPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const profile = useUserStore(s => s.profile)
  const updateProfile = useUserStore(s => s.updateProfile)

  const [name, setName] = useState(profile.name)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setAvatarUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = () => {
    setAvatarUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSave = () => {
    updateProfile({ name: name.trim(), avatarUrl })
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#f2f2f6]">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-[#e5e5ea]/60 pt-safe">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full bg-[#f2f2f6] flex items-center justify-center hover:bg-[#e5e5ea] transition-colors"
          >
            <ArrowLeft size={20} className="text-[#1d1d1f]" />
          </button>
          <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">个人设置</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8 pb-safe">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              <Avatar size={80} />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#fa2d48] text-white flex items-center justify-center hover:bg-[#e0283f] transition-colors"
              >
                <Upload size={12} />
              </button>
            </div>
            <div>
              <p className="font-semibold text-[#1d1d1f] text-lg">
                {profile.name || '音乐爱好者'}
              </p>
              <p className="text-sm text-[#8e8e93]">点击头像下方按钮上传</p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="mb-6">
            <label className="block text-sm font-medium text-[#8e8e93] mb-1.5">昵称</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="输入你的昵称..."
              maxLength={12}
              className="w-full h-11 px-4 rounded-xl border border-[#e5e5ea] bg-[#f9f9fb] text-sm text-[#1d1d1f] placeholder-[#c7c7cc] outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48]/20 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8e8e93] mb-2">头像</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-10 px-5 rounded-full bg-[#f2f2f6] text-[#1d1d1f] text-sm font-medium hover:bg-[#e5e5ea] transition-colors"
              >
                选择图片
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="h-10 px-5 rounded-full text-sm text-[#fa2d48] font-medium hover:bg-[#fce4e8] transition-colors"
                >
                  移除头像
                </button>
              )}
            </div>
            <p className="mt-2 text-xs text-[#c7c7cc]">支持 JPG、PNG 格式</p>
          </div>
        </div>

        <div className="flex justify-end pb-8">
          <button
            onClick={handleSave}
            className="h-11 px-8 rounded-full bg-[#fa2d48] text-white text-sm font-semibold hover:bg-[#e0283f] active:scale-95 transition-all"
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  )
}
