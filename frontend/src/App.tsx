import { Link, Route, Routes, useLocation } from 'react-router'
import HomePage from './pages/HomePage'
import ExplorePage from './pages/ExplorePage'

function App() {
  const isExplorer = useLocation().pathname === '/explore'

  return (
    <>
      {!isExplorer && (
        <header className="site-header">
          <Link className="site-brand" to="/">El Parque</Link>

          <nav aria-label="Main navigation">
            <Link to="/">Home</Link>
            <Link to="/explore">Explore</Link>
          </nav>
        </header>
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
      </Routes>
    </>
  )
}

export default App