// src/App.jsx
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import Sobre from './pages/Sobre'
import Arquivos from './pages/Arquivos'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/arquivos" element={<Arquivos />} />
        <Route path="/sobre" element={<Sobre />} />   {/* adiciona a rota de Sobre */}
        <Route path="*" element={<LandingPage />} />  {/* fallback opcional */}
      </Route>
    </Routes>
  )
}

export default App
