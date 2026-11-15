import { useEffect, useRef, useState } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import { Link } from 'react-router'
import regionsRaw from '../data/regiones_lluvia_ndvi.geojson?raw'

type Region = {
  properties: {
    name: string
    climate: string
    role: string
  }
  geometry: {
    type: 'Polygon'
    coordinates: number[][][]
  }
}

const collection = JSON.parse(regionsRaw) as { features: Region[] }

const regions = collection.features.map((region) => ({
  ...region,
  geometry: {
    ...region.geometry,
    coordinates: region.geometry.coordinates.map((ring) => [...ring].reverse()),
  },
}))

function getRegionCenter(region: Region) {
  const points = region.geometry.coordinates[0]
  const longitudes = points.map(([longitude]) => longitude)
  const latitudes = points.map(([, latitude]) => latitude)

  return {
    lng: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
    lat: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
  }
}

const resultGroups = [
  {
    id: 'comparison',
    label: 'Before & after',
    items: [
      {
        title: 'Before',
        src: '/test-results/before.png',
        alt: 'Test image before',
      },
      {
        title: 'After',
        src: '/test-results/after.png',
        alt: 'Test image after',
      },
    ],
  },
  {
    id: 'graphs',
    label: 'Graphs',
    items: [
      {
        title: 'Graph 1',
        src: '/test-results/graph1.webp',
        alt: 'First simulated graph',
      },
      {
        title: 'Graph 2',
        src: '/test-results/graph2.webp',
        alt: 'Second simulated graph',
      },
    ],
  },
  {
    id: 'animation',
    label: 'Animation',
    items: [
      {
        title: 'Evolution',
        src: '/test-results/animation.gif',
        alt: 'Test animation',
      },
    ],
  },
] as const

type ResultGroupId = (typeof resultGroups)[number]['id']

function ExplorePage() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const [hoveredRegion, setHoveredRegion] = useState<Region | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)
  const [activeGroupId, setActiveGroupId] = useState<ResultGroupId>('comparison')
  const [itemIndex, setItemIndex] = useState(0)
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  const activeGroup =
    resultGroups.find((group) => group.id === activeGroupId) ?? resultGroups[0]
  const activeItem = activeGroup.items[itemIndex]

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  function selectRegion(region: Region) {
    setSelectedRegion(region)
    setActiveGroupId('comparison')
    setItemIndex(0)

    const globe = globeRef.current
    if (!globe) return

    const center = getRegionCenter(region)
    globe.pointOfView(
      { lat: center.lat, lng: center.lng, altitude: 2.3 },
      900,
    )
  }

  return (
    <main className={`explore-page ${selectedRegion ? 'has-selection' : ''}`}>
      {!selectedRegion && (
        <Link className="panel-close explore-home-link" to="/" aria-label="Back to home">
          ×
        </Link>
      )}

      {!selectedRegion && (
        <nav className="region-nav" aria-label="Available regions">
          {regions.map((region) => (
            <button
              key={region.properties.name}
              type="button"
              onClick={() => selectRegion(region)}
            >
              {region.properties.name}
            </button>
          ))}
        </nav>
      )}

      <div className="globe-shell">
        <Globe
          ref={globeRef}
          width={viewport.width + 1200}
          height={viewport.height}
          backgroundColor="#101b2a"
          globeImageUrl="https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
          polygonsData={regions}
          polygonLabel={(polygon) => (polygon as Region).properties.name}
          polygonCapColor={(polygon) =>
            polygon === selectedRegion
              ? 'rgba(121, 217, 208, 0.75)'
              : polygon === hoveredRegion
                ? 'rgba(121, 217, 208, 0.55)'
                : 'rgba(121, 217, 208, 0.30)'
          }
          polygonSideColor={() => 'rgba(121, 217, 208, 0.15)'}
          polygonStrokeColor={() => '#79d9d0'}
          polygonAltitude={0.004}
          polygonsTransitionDuration={0}
          onPolygonHover={(polygon) =>
            setHoveredRegion(polygon as Region | null)
          }
          onPolygonClick={(polygon) => selectRegion(polygon as Region)}
          onGlobeReady={() => {
            const globe = globeRef.current
            if (!globe) return

            const controls = globe.controls()
            const radius = globe.getGlobeRadius()

            controls.enableRotate = true
            controls.enableZoom = true
            controls.enablePan = false
            controls.minDistance = radius * 2
            controls.maxDistance = radius * 5

            globe.pointOfView({ lat: 13, lng: 5, altitude: 2.15 })
          }}
        />
      </div>

      <aside
        className="results-panel"
        aria-hidden={!selectedRegion}
        inert={!selectedRegion}
      >
        {selectedRegion && (
          <>
            <div className="panel-header">
              <h2>{selectedRegion.properties.name}</h2>
              <button
                className="panel-close"
                type="button"
                aria-label="Close results"
                onClick={() => setSelectedRegion(null)}
              >
                ×
              </button>
            </div>

            <nav className="result-tabs" aria-label="Result type">
              {resultGroups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  className={group.id === activeGroupId ? 'active' : ''}
                  aria-pressed={group.id === activeGroupId}
                  onClick={() => {
                    setActiveGroupId(group.id)
                    setItemIndex(0)
                  }}
                >
                  {group.label}
                </button>
              ))}
            </nav>

            <section className="result-content">
              <h3>{activeItem.title}</h3>

              <div className="media-frame">
                <img
                  key={activeItem.src}
                  src={activeItem.src}
                  alt={activeItem.alt}
                />
              </div>

              <div className="media-controls">
                {activeGroupId === 'comparison' &&
                  activeGroup.items.map((item, index) => (
                    <button
                      key={item.src}
                      type="button"
                      className={index === itemIndex ? 'active' : ''}
                      aria-pressed={index === itemIndex}
                      onClick={() => setItemIndex(index)}
                    >
                      {item.title}
                    </button>
                  ))}

                {activeGroupId === 'graphs' && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous graph"
                      onClick={() =>
                        setItemIndex((current) =>
                          (current - 1 + activeGroup.items.length) %
                          activeGroup.items.length
                        )
                      }
                    >
                      ←
                    </button>
                    <span>
                      {itemIndex + 1} / {activeGroup.items.length}
                    </span>
                    <button
                      type="button"
                      aria-label="Next graph"
                      onClick={() =>
                        setItemIndex((current) =>
                          (current + 1) % activeGroup.items.length
                        )
                      }
                    >
                      →
                    </button>
                  </>
                )}
              </div>
            </section>

            <p className="test-label">Test content · Not scientific results</p>
          </>
        )}
      </aside>
    </main>
  )
}

export default ExplorePage
