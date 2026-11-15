import { useEffect, useRef, useState } from 'react'
import Globe, { type GlobeMethods } from 'react-globe.gl'
import { Link, useSearchParams } from 'react-router'
import ArrowIcon from '../components/ArrowIcon'
import RegionStudy from '../components/RegionStudy'
import SatelliteEvidence from '../components/SatelliteEvidence'
import regionsRaw from '../data/regions_rainfall_ndvi.geojson?raw'
import { formatMonth, getJson, plotUrl, usePlotImage, type RegionSummary, type VariableSummary } from '../lib/api'
import './ExplorePage.css'

type Region = {
  properties: { id: string; name: string; climate: string; role: string }
  geometry: { type: 'Polygon'; coordinates: number[][][] }
  id: string
}
type Tab = 'study' | 'variables' | 'satellite'
const tabs: { id: Tab; label: string }[] = [
  { id: 'study', label: 'Regional study' },
  { id: 'variables', label: 'Explore variables' },
  { id: 'satellite', label: 'Satellite evidence' },
]

const collection = JSON.parse(regionsRaw) as { features: Omit<Region, 'id'>[] }
const regions: Region[] = collection.features.map((region) => ({
  ...region,
  id: region.properties.id,
  geometry: { ...region.geometry, coordinates: region.geometry.coordinates.map((ring) => [...ring].reverse()) },
}))

function getRegionCenter(region: Region) {
  const points = region.geometry.coordinates[0]
  const longitudes = points.map(([longitude]) => longitude)
  const latitudes = points.map(([, latitude]) => latitude)
  return { lng: (Math.min(...longitudes) + Math.max(...longitudes)) / 2, lat: (Math.min(...latitudes) + Math.max(...latitudes)) / 2 }
}

function ExplorePage() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined)
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedId = searchParams.get('region') ?? ''
  const selectedRegion = regions.find((region) => region.id === selectedId) ?? null
  const [hoveredRegion, setHoveredRegion] = useState<Region | null>(null)
  const [catalog, setCatalog] = useState<{ variables: VariableSummary[]; regions: RegionSummary[] } | null>(null)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [catalogRetry, setCatalogRetry] = useState(0)
  const [selectedVariables, setSelectedVariables] = useState(['precipitation', 'ndvi'])
  const [activeTab, setActiveTab] = useState<Tab>('study')
  const [plotRetry, setPlotRetry] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth)
  const regionData = catalog?.regions.find((region) => region.id === selectedId)
  const globeWidth = viewportWidth > 1080 ? 300 : viewportWidth > 800 ? 250 : Math.max(220, Math.min(viewportWidth - 48, 480))
  const imageUrl = selectedRegion && catalog && selectedVariables.length > 0 && activeTab === 'variables' ? plotUrl(selectedId, selectedVariables) : null
  const plot = usePlotImage(imageUrl, plotRetry)

  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      getJson<VariableSummary[]>('/api/variables', controller.signal),
      getJson<RegionSummary[]>('/api/regions', controller.signal),
    ]).then(([variables, availableRegions]) => {
      if (!controller.signal.aborted) setCatalog({ variables, regions: availableRegions })
    }).catch((reason: unknown) => {
      if (!controller.signal.aborted) setCatalogError(reason instanceof Error ? reason.message : 'Unable to load the datasets.')
    })
    return () => controller.abort()
  }, [catalogRetry])

  useEffect(() => {
    const update = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    if (selectedRegion) globeRef.current?.pointOfView({ ...getRegionCenter(selectedRegion), altitude: 2.4 }, 700)
  }, [selectedRegion])

  function selectRegion(id: string) {
    setSearchParams(id ? { region: id } : {})
    setActiveTab('study')
  }

  function toggleVariable(id: string) {
    setSelectedVariables((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 5 ? [...current, id] : current)
  }

  return (
    <main className={`explore-page data-explorer ${selectedRegion ? 'has-selection' : ''}`}>
      <nav className="explorer-navigation" aria-label="Explorer navigation">
        <Link to="/" className="explorer-brand">MeteoPark <span>Earth insights</span></Link>
        <div className="explorer-links"><Link to="/wiki">Variable details</Link><Link to={`/analysis?region=${selectedId || 'Niger'}`}>Analysis details</Link></div>
      </nav>

      <div className="explorer-layout">
        <aside className="explorer-sidebar" aria-label="Region selection">
          <div className="explorer-sidebar-copy"><p className="explorer-eyebrow">Five regions. Different responses.</p><h2>Choose your study area</h2><p>Start with a place, then read the findings, compare its variables and inspect the satellite evidence.</p></div>
          <div className="explorer-region-picker"><label htmlFor="explore-region">Choose a region</label><select id="explore-region" value={selectedRegion?.id ?? ''} onChange={(event) => selectRegion(event.target.value)}><option value="">Select a study region</option>{regions.map((region) => <option key={region.id} value={region.id}>{region.properties.name}</option>)}</select></div>
          <div className="explorer-globe" aria-label="Interactive globe; regions can also be selected from the menu">
            <Globe ref={globeRef} width={globeWidth} height={globeWidth} backgroundColor="rgba(0, 0, 0, 0)" globeImageUrl="https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg" polygonsData={regions}
              polygonLabel={(polygon) => (polygon as Region).properties.name}
              polygonCapColor={(polygon) => polygon === selectedRegion ? 'rgba(15, 118, 110, 0.85)' : polygon === hoveredRegion ? 'rgba(67, 56, 202, 0.7)' : 'rgba(67, 56, 202, 0.45)'}
              polygonSideColor={() => 'rgba(67, 56, 202, 0.2)'} polygonStrokeColor={() => '#e0e7ff'} polygonAltitude={0.008} polygonsTransitionDuration={0}
              onPolygonHover={(polygon) => setHoveredRegion(polygon as Region | null)} onPolygonClick={(polygon) => selectRegion((polygon as Region).id)}
              onGlobeReady={() => {
                const globe = globeRef.current
                if (!globe) return
                const controls = globe.controls()
                const radius = globe.getGlobeRadius()
                controls.enableRotate = true; controls.enableZoom = true; controls.enablePan = false
                controls.minDistance = radius * 2; controls.maxDistance = radius * 5
                globe.pointOfView(selectedRegion ? { ...getRegionCenter(selectedRegion), altitude: 2.4 } : { lat: 10, lng: 10, altitude: 2.4 })
              }} />
          </div>
          <p className="explorer-map-note">The highlighted boxes are the study areas, rather than whole countries.</p>
          <a className="explorer-source-link" href="https://giovanni.gsfc.nasa.gov/giovanni/" target="_blank" rel="noreferrer">Data extracted from NASA Giovanni <ArrowIcon /></a>
        </aside>

        <section className="explorer-workspace" aria-label={selectedRegion ? 'Region results' : 'Choose a region to explore'}>
          {!selectedRegion ? <div className="explorer-welcome">
            <p className="explorer-eyebrow">Explore the evidence</p><h1>How does rain<br />shape greenness?</h1><p>Read a regional study, see how the seasonal cycle changes the interpretation, and compare dated satellite views. The variable explanations live here too.</p>
            {selectedId && <p className="data-message" role="status">That region is not available. Choose one of the five study areas below.</p>}
            <div className="explorer-region-cards">{regions.map((region) => <button type="button" key={region.id} onClick={() => selectRegion(region.id)}><strong>{region.properties.name}</strong><span>{region.properties.climate}</span><ArrowIcon /></button>)}</div>
          </div> : <>
            <header className="explorer-region-header"><div><p className="explorer-eyebrow">Regional evidence / {selectedRegion.properties.climate}</p><h1>{selectedRegion.properties.name}</h1>{regionData && <p className="dataset-period">{formatMonth(regionData.start)} – {formatMonth(regionData.end)} · {regionData.observations} monthly records</p>}</div><button className="explorer-reset" type="button" onClick={() => selectRegion('')}>All regions</button></header>
            <nav className="explorer-tabs" aria-label="Explore this region">{tabs.map((tab) => <button key={tab.id} type="button" className={activeTab === tab.id ? 'active' : ''} aria-pressed={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}</nav>
            <div className="explorer-tab-content">
              {activeTab === 'study' && <RegionStudy region={selectedId} onViewSatellite={() => setActiveTab('satellite')} />}
              {activeTab === 'satellite' && <SatelliteEvidence region={selectedId} />}
              {activeTab === 'variables' && <section className="explorer-graphs" aria-labelledby="variable-explorer-title">
                <div className="explorer-section-heading"><div><p className="explorer-eyebrow">The signals behind the study</p><h2 id="variable-explorer-title">Compare and understand the variables</h2></div><Link className="explorer-detail-link" to="/wiki">Full variable reference <ArrowIcon /></Link></div>
                <p className="explorer-section-copy">Choose one to five variables. Their meanings, source units and interpretation are included below, so you can explore without leaving this region.</p>
                <aside className="time-series-guide study-example" aria-label="How to read the time series">
                  <h3>What these time series tell us</h3>
                  <p>Each faint line follows the observed regional monthly values from 2000 to 2025. Repeating peaks and troughs reveal wet/dry seasons or other annual cycles. An isolated spike is a monthly observation, not automatically a lasting trend.</p>
                  <p>The stronger line is a centered 12-month moving mean: it smooths the seasonal swings so slower changes are easier to see. It uses 12 actual observations, so the ends of the record have no smoothed value. Smoothing alone does not establish a statistically significant trend.</p>
                  <p>Each variable has its own axis and original units. Compare when features occur, rather than comparing the visual heights of curves with different units. Precipitation here is a mean rate in mm/h; the regional study converts it to estimated monthly totals.</p>
                  <p>To investigate delayed greening, look for rainfall increases followed by NDVI/EVI increases, then check the Regional study: shared seasons can create an apparent relationship even without an independent rainfall effect.</p>
                </aside>
                {catalogError ? <div className="data-message" role="alert"><p>{catalogError}</p><button type="button" onClick={() => { setCatalogError(null); setCatalogRetry((value) => value + 1) }}>Retry datasets</button></div> : !catalog ? <p role="status">Loading the variable guide…</p> : <>
                  <fieldset className="variable-picker"><legend>Variables <span>{selectedVariables.length} / 5 selected</span></legend><p id="variable-help">Each variable keeps its own units and axis. Deselect one to add another after reaching five.</p><div className="variable-options">{catalog.variables.map((variable) => <article key={variable.id} className={`explorer-variable-card ${selectedVariables.includes(variable.id) ? 'selected' : ''}`}><label><input type="checkbox" checked={selectedVariables.includes(variable.id)} disabled={selectedVariables.length >= 5 && !selectedVariables.includes(variable.id)} onChange={() => toggleVariable(variable.id)} aria-describedby={`variable-help variable-definition-${variable.id}`} /><span>{variable.label}<small>{variable.unit}</small></span></label><p id={`variable-definition-${variable.id}`}>{variable.description}</p><details><summary>Interpretation & source</summary><p>{variable.interpretation}</p><dl><div><dt>Source</dt><dd>{variable.source}</dd></div><div><dt>Resolution</dt><dd>{variable.resolution}</dd></div></dl><Link to={`/wiki#${variable.id}`}>Read full definition <ArrowIcon /></Link></details></article>)}</div></fieldset>
                  {selectedVariables.length === 0 ? <p className="data-message" role="status">Select at least one variable to generate a graph.</p> : <figure className="scientific-plot" aria-busy={plot.loading}>{plot.loading && <p className="data-message" role="status">Generating the graph…</p>}{plot.error && <div className="data-message" role="alert"><p>{plot.error}</p><button type="button" onClick={() => setPlotRetry((value) => value + 1)}>Retry graph</button></div>}{plot.src && <><img src={plot.src} alt={`Monthly time series for ${selectedRegion.properties.name}: ${catalog.variables.filter((variable) => selectedVariables.includes(variable.id)).map((variable) => variable.label).join(', ')}`} /><figcaption>Regional monthly means in the supplied source units. Use the regional study for seasonal and lag comparisons.</figcaption><div className="plot-actions"><a href={plot.src} download={`MeteoPark-${selectedId}-time-series.png`}>Download PNG ↓</a><a href={plot.src} target="_blank" rel="noreferrer">View full-size <ArrowIcon /></a></div></>}</figure>}
                </>}
              </section>}
            </div>
          </>}
        </section>
      </div>
    </main>
  )
}

export default ExplorePage
