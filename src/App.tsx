import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import AddAlbumPage from '@/pages/AddAlbumPage'
import AlbumDetailPage from '@/pages/AlbumDetailPage'
import SettingsPage from '@/pages/SettingsPage'
import TrackDetailPage from '@/pages/TrackDetailPage'
import WatchlistPage from '@/pages/WatchlistPage'
import StatsPage from '@/pages/StatsPage'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add" element={<AddAlbumPage />} />
        <Route path="/add-track" element={<TrackDetailPage />} />
        <Route path="/album/:id" element={<AlbumDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </Router>
  )
}
