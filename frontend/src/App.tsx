import { Route, Routes } from 'react-router'
import HomePage from './pages/HomePage'
import ExplorePage from './pages/ExplorePage'
import WikiPage from './pages/WikiPage'
import AnalysisPage from './pages/AnalysisPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/wiki" element={<WikiPage />} />
      <Route path="/analysis" element={<AnalysisPage />} />
    </Routes>
  )
}

export default App
