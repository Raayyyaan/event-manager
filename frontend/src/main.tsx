import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Login } from './pages/App.tsx'
import { Profile } from './pages/Profile.tsx'
import { CreateEvent } from './pages/CreateEvent.tsx'
import { EditEvent } from './pages/EditEvent.tsx'
import { DiscoverEvents } from './pages/DiscoverEvent.tsx'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '1px solid #334155',
        },
      }}
    />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/edit-event/:id" element={<EditEvent />} />
        <Route path="/discover" element={<DiscoverEvents />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)