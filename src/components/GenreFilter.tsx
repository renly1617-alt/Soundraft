interface GenreFilterProps {
  genres: string[]
  selected: string | null
  onSelect: (genre: string | null) => void
  counts: Record<string, number>
  total: number
}

export default function GenreFilter({ genres, selected, onSelect, counts, total }: GenreFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      <button
        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
          selected === null
            ? 'bg-[#fa2d48] text-white'
            : 'bg-[#f2f2f6] text-[#1d1d1f] hover:bg-[#e5e5ea]'
        }`}
        onClick={() => onSelect(null)}
      >
        全部（{total}）
      </button>
      {genres.map((genre) => (
        <button
          key={genre}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            selected === genre
              ? 'bg-[#fa2d48] text-white'
              : 'bg-[#f2f2f6] text-[#1d1d1f] hover:bg-[#e5e5ea]'
          }`}
          onClick={() => onSelect(selected === genre ? null : genre)}
        >
          {genre}（{counts[genre] || 0}）
        </button>
      ))}
    </div>
  )
}
