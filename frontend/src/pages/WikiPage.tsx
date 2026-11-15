import ArrowIcon from '../components/ArrowIcon'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import SourceAttribution from '../components/SourceAttribution'
import './WikiPage.css'

type Variable = {
  id: string
  label: string
  unit: string
  description: string
  source: string
  resolution: string
  interpretation: string
}

const sources = [
  {
    name: 'GPM IMERG Final Run V07',
    url: 'https://gpm.nasa.gov/data/imerg',
    description: 'Merged satellite and rain-gauge precipitation estimates. The monthly series is a mean precipitation rate in mm/hr, rather than a monthly total.',
  },
  {
    name: 'GLDAS Noah 0.25° monthly, version 2.1',
    url: 'https://ldas.gsfc.nasa.gov/gldas',
    description: 'Modelled land-surface and meteorological variables. These include soil water, atmospheric conditions and water or energy fluxes.',
  },
  {
    name: 'MODIS MOD13A3 V061',
    url: 'https://lpdaac.usgs.gov/products/mod13a3v061/',
    description: 'Monthly vegetation indices at 1 km resolution: NDVI and EVI. The included CSV files contain regional mean values exported through AppEEARS.',
  },
]

function WikiPage() {
  const [variables, setVariables] = useState<Variable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const location = useLocation()

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const response = await fetch('/api/variables', { signal: controller.signal })
        if (!response.ok) throw new Error('Unable to load the variable catalogue.')
        const data: Variable[] = await response.json()
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('The variable catalogue is empty or unavailable.')
        }
        if (!controller.signal.aborted) setVariables(data)
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : 'Unable to load the variable catalogue.')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void load()
    return () => controller.abort()
  }, [attempt])

  useEffect(() => {
    if (!location.hash) return
    const element = document.getElementById(location.hash.slice(1))
    element?.scrollIntoView({ block: 'start' })
  }, [location.hash, variables])

  return (
    <main className="wiki-page">
      <nav className="wiki-nav" aria-label="Main navigation">
        <Link className="wiki-brand" to="/">MeteoPark</Link>
        <div>
          <Link to="/explore">Explore regions</Link>
          <Link to="/analysis">Rainfall & vegetation</Link>
        </div>
      </nav>

      <header className="wiki-header">
        <p className="wiki-kicker">Behind the results</p>
        <h1>Variable wiki</h1>
        <p>
          What we measure, where it comes from, and how to read it. These are
          the twelve variables included in the regional data files, with one
          value per month for each study area.
        </p>
        <div className="wiki-header-links">
          <a href="#variables">Browse variables ↓</a>
          <a href="#sources">Data sources ↓</a>
          <a href="#reading-the-data">Reading the data ↓</a>
        </div>
      </header>

      <section id="variables" className="wiki-section" aria-labelledby="wiki-variables-title">
        <h2 id="wiki-variables-title">The variables</h2>
        {loading && <p role="status">Loading the variable catalogue…</p>}
        {error && (
          <div className="wiki-error" role="alert">
            <p>{error} Check that the backend is running, then try again.</p>
            <button type="button" onClick={() => {
              setLoading(true)
              setError('')
              setAttempt((value) => value + 1)
            }}>Try again</button>
          </div>
        )}
        {!loading && !error && (
          <>
            <nav className="wiki-variable-index" aria-label="Variable index">
              {variables.map((variable) => (
                <a key={variable.id} href={`#${variable.id}`}>{variable.label}</a>
              ))}
            </nav>
            <div className="wiki-variable-grid">
              {variables.map((variable) => (
                <article className="wiki-variable" id={variable.id} key={variable.id}>
                  <div className="wiki-variable-heading">
                    <h3>{variable.label}</h3>
                    <span className="wiki-unit">{variable.unit}</span>
                  </div>
                  <p>{variable.description}</p>
                  <dl>
                    <div><dt>Source</dt><dd>{variable.source}</dd></div>
                    <div><dt>Resolution</dt><dd>{variable.resolution}</dd></div>
                  </dl>
                  <p className="wiki-interpretation">{variable.interpretation}</p>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <section id="sources" className="wiki-section" aria-labelledby="wiki-sources-title">
        <h2 id="wiki-sources-title">Data sources & tools</h2>
        <SourceAttribution />
        <div className="wiki-source-grid">
          {sources.map((source) => (
            <article className="wiki-source" key={source.name}>
              <h3><a href={source.url} target="_blank" rel="noreferrer">{source.name} <ArrowIcon /></a></h3>
              <p>{source.description}</p>
            </article>
          ))}
        </div>
        <p className="wiki-tool-note">
          The meteorological and land-surface series were exported as area averages
          from <a href="https://giovanni.gsfc.nasa.gov/giovanni/" target="_blank" rel="noreferrer">NASA Giovanni <ArrowIcon /></a>.
          Vegetation means were prepared using <a href="https://appeears.earthdatacloud.nasa.gov/" target="_blank" rel="noreferrer">AppEEARS <ArrowIcon /></a>.
          Source products have different spatial resolutions; their regional means
          are compared by calendar month.
        </p>
      </section>

      <section id="reading-the-data" className="wiki-section wiki-reading" aria-labelledby="wiki-reading-title">
        <h2 id="wiki-reading-title">Reading the data</h2>
        <ul>
          <li>Each value describes a selected study area, rather than an entire country. The shared analysis period is February 2000 to August 2025.</li>
          <li>NDVI and EVI describe vegetation greenness. They do not directly measure vegetation area or prove that a change is caused by rainfall. NDVI can saturate in dense vegetation; EVI provides a complementary view.</li>
          <li>The precipitation series is a monthly mean rate in mm/hr. Converting it to an estimated monthly amount requires multiplying by the number of hours in that month.</li>
          <li>Variables keep their source units. Air temperature is in kelvin, specific humidity is in kg/kg, and potential evaporation is an energy flux in W/m².</li>
          <li>The analysis compares rainfall with NDVI and EVI in the same month and with vegetation up to three months later. Monthly anomalies subtract each variable’s average for that calendar month to help distinguish the seasonal cycle.</li>
          <li>Clouds, retrieval quality and the difference between product resolutions can affect the comparison. The supplied vegetation CSV files contain means without quality flags or valid-pixel counts, so an additional pixel quality filter cannot be verified here.</li>
        </ul>
        <Link className="wiki-analysis-link" to="/analysis">Read the rainfall & vegetation analysis <span aria-hidden="true"><ArrowIcon /></span></Link>
      </section>
    </main>
  )
}

export default WikiPage
