import ArrowIcon from '../components/ArrowIcon'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { formatMonth, getJson, usePlotImage, type AnalysisResponse, type RegionSummary } from '../lib/api'
import './AnalysisPage.css'

function correlation(value: number | null | undefined) {
  return value === null || value === undefined ? '—' : value.toFixed(3)
}

function AnalysisPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedId = searchParams.get('region') || 'Niger'
  const [regions, setRegions] = useState<RegionSummary[]>([])
  const [regionsError, setRegionsError] = useState<string | null>(null)
  const [regionsRetry, setRegionsRetry] = useState(0)
  const [retry, setRetry] = useState(0)
  const analysisRequest = useMemo(() => ({ region: selectedId, retry }), [selectedId, retry])
  const [response, setResponse] = useState<{ request: typeof analysisRequest; data: AnalysisResponse } | null>(null)
  const [failure, setFailure] = useState<{ request: typeof analysisRequest; message: string } | null>(null)
  const [plotRetry, setPlotRetry] = useState(0)
  const data = response?.request === analysisRequest ? response.data : null
  const error = failure?.request === analysisRequest ? failure.message : null
  const currentRegion = regions.find((region) => region.id === selectedId)
  const plot = usePlotImage(data ? `/api/analysis/plot?${new URLSearchParams({ region: selectedId })}` : null, plotRetry)
  const ndvi = data?.results.find((item) => item.variable === 'ndvi')
  const previousMonth = ndvi?.lags.find((lag) => lag.months === 1)

  useEffect(() => {
    const controller = new AbortController()
    getJson<RegionSummary[]>('/api/regions', controller.signal)
      .then(setRegions)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setRegionsError(reason instanceof Error ? reason.message : 'Unable to load the regions.')
      })
    return () => controller.abort()
  }, [regionsRetry])

  useEffect(() => {
    const controller = new AbortController()
    getJson<AnalysisResponse>(`/api/analysis?${new URLSearchParams({ region: analysisRequest.region })}`, controller.signal)
      .then((result) => setResponse({ request: analysisRequest, data: result }))
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setFailure({ request: analysisRequest, message: reason instanceof Error ? reason.message : 'Unable to load the analysis.' })
      })
    return () => controller.abort()
  }, [analysisRequest])

  return (
    <main className="analysis-page">
      <nav className="analysis-nav" aria-label="Main navigation"><Link to="/" className="analysis-brand">MeteoPark</Link><div><Link to={`/explore?region=${selectedId}`}>Explore regions</Link><Link to="/wiki">Variable wiki</Link></div></nav>
      <header className="analysis-heading">
        <p className="analysis-kicker">Rain & vegetation / regional analysis</p>
        <h1>When it rains,<br /><span>what grows?</span></h1>
        <p>Compare precipitation with NDVI and EVI in the supplied monthly observations. The same calculation is available for each of the five study regions.</p>
        <div className="analysis-region-control"><label htmlFor="analysis-region">Study region</label><select id="analysis-region" value={selectedId} onChange={(event) => setSearchParams({ region: event.target.value })} disabled={regions.length === 0}>
          {regions.length === 0 && <option value={selectedId}>Loading regions…</option>}
          {regions.length > 0 && !currentRegion && <option value={selectedId}>Unknown region</option>}
          {regions.map((region) => <option value={region.id} key={region.id}>{region.label}</option>)}
        </select></div>
        {regionsError && <div className="analysis-message" role="alert"><p>{regionsError}</p><button type="button" onClick={() => { setRegionsError(null); setRegionsRetry((value) => value + 1) }}>Retry regions</button></div>}
      </header>

      {error ? <div className="analysis-message" role="alert"><p>{error}</p><button type="button" onClick={() => setRetry((value) => value + 1)}>Retry analysis</button></div> : !data ? <p className="analysis-message" role="status">Calculating rain and vegetation correlations…</p> : <>
        <section className="analysis-section" aria-labelledby="relationship-title">
          <div className="analysis-section-heading"><div><p className="analysis-kicker">01 / Same month</p><h2 id="relationship-title">{currentRegion?.label ?? selectedId}</h2></div><p>{formatMonth(data.start)} – {formatMonth(data.end)}<br />{data.observations} monthly records</p></div>
          <p className="analysis-copy">Pearson's r measures a linear association, from −1 to +1. Positive values mean the two variables tend to rise together; negative values mean they tend to move in opposite directions. A value near zero indicates little linear association.</p>
          <div className="analysis-table-wrapper"><table><caption>Precipitation and vegetation in the same calendar month</caption><thead><tr><th scope="col">Vegetation index</th><th scope="col">Raw r</th><th scope="col">Anomaly r</th><th scope="col">Paired months</th></tr></thead><tbody>{data.results.map((result) => <tr key={result.variable}><th scope="row">{result.label}</th><td>{correlation(result.pearson_r)}</td><td>{correlation(result.anomaly_r)}</td><td>{result.lags.find((lag) => lag.months === 0)?.observations ?? data.observations}</td></tr>)}</tbody></table></div>
          <div className="analysis-explanation"><h3>Read both correlations together</h3><p>Raw correlations include the shared wet and dry seasons. Anomaly correlations subtract each variable's mean for that calendar month across the available period, then compare departures from the usual seasonal pattern. This reduces the influence of seasonality; it does not remove every shared influence.</p>
            {ndvi && previousMonth && <p>For this region, NDVI's anomaly correlation is <strong>{correlation(ndvi.anomaly_r)}</strong> in the same month and <strong>{correlation(previousMonth.anomaly_r)}</strong> when precipitation comes one month earlier. These are exploratory associations, not evidence that rainfall alone caused the vegetation response.</p>}
          </div>
        </section>
        <section className="analysis-section" aria-labelledby="scatter-title">
          <p className="analysis-kicker">02 / The observations</p><h2 id="scatter-title">See the relationship</h2><p className="analysis-copy">Read the seasonal cycle, compare NDVI and EVI at different lags, and inspect an example selected from rainfall onset. The anomaly panel checks the delayed relationship after subtracting the usual seasonal pattern.</p>
          <figure className="analysis-plot" aria-busy={plot.loading}>
            {plot.loading && <p className="analysis-message" role="status">Generating the analysis graph…</p>}
            {plot.error && <div className="analysis-message" role="alert"><p>{plot.error}</p><button type="button" onClick={() => setPlotRetry((value) => value + 1)}>Retry graph</button></div>}
            {plot.src && <><img src={plot.src} alt={`Seasonal cycle, lag correlations, anomaly association and dated rainfall example for ${currentRegion?.label ?? selectedId}`} /><figcaption>Four complementary views from the supplied monthly observations. Correlations use the original rain rate; seasonal and dated examples show estimated rainfall totals. These are descriptive associations.</figcaption><div className="analysis-plot-actions"><a href={plot.src} download={`MeteoPark-${selectedId}-rain-vegetation.png`}>Download PNG ↓</a><a href={plot.src} target="_blank" rel="noreferrer">View full-size <ArrowIcon /></a></div></>}
          </figure>
        </section>
        <section className="analysis-section" aria-labelledby="lag-title">
          <p className="analysis-kicker">03 / A possible delay</p><h2 id="lag-title">Rain now, vegetation later</h2><p className="analysis-copy" id="lag-description">A lead of 1 month compares precipitation in month t−1 with vegetation in month t. A lead of 0 compares the same month. These four comparisons explore possible delays; choosing the largest r does not establish a confirmed response time.</p>
          <div className="analysis-lag-grid">{data.results.map((result) => <div className="analysis-table-wrapper" key={result.variable}><table aria-describedby="lag-description"><caption>{result.label} and earlier rainfall</caption><thead><tr><th scope="col">Rain lead<br />(months)</th><th scope="col">Raw r</th><th scope="col">Anomaly r</th><th scope="col">Pairs</th></tr></thead><tbody>{result.lags.map((lag) => <tr key={lag.months}><th scope="row">{lag.months}</th><td>{correlation(lag.pearson_r)}</td><td>{correlation(lag.anomaly_r)}</td><td>{lag.observations}</td></tr>)}</tbody></table></div>)}</div>
        </section>
        <section className="analysis-section analysis-methods" id="methods" aria-labelledby="methods-title"><p className="analysis-kicker">04 / Behind the calculation</p><h2 id="methods-title">Methods & limits</h2><div><article><h3>How this was calculated</h3><ul>{data.methodology.map((method) => <li key={method}>{method}</li>)}</ul></article><article><h3>What to keep in mind</h3><ul>{data.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul></article></div><p className="analysis-copy">A dash (—) indicates that a correlation cannot be calculated from enough valid, nonconstant pairs.</p><Link to="/wiki">Read the definitions, units and sources in the variable wiki <ArrowIcon /></Link></section>
      </>}
      <footer className="analysis-footer"><Link to={`/explore?region=${selectedId}`}>← Explore this region</Link><span>MeteoPark · El Parque</span></footer>
    </main>
  )
}

export default AnalysisPage
