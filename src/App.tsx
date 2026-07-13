import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MapPage } from './pages/MapPage'
import { SavedStormsPage } from './pages/SavedStormsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/saved" element={<SavedStormsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
