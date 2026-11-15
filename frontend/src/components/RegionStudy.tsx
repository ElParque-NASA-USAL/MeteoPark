import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import ArrowIcon from './ArrowIcon'
import { formatMonth, getJson, usePlotImage, type StudyResponse } from '../lib/api'

function r(value: number | null | undefined) {
  return value === null || value === undefined ? '—' : value.toFixed(3)
}

export default function RegionStudy({ region, onViewSatellite }: {
  region: string
  onViewSatellite: () => void
}) {
  const [retry, setRetry] = useState(0)
  const [plotRetry, setPlotRetry] = useState(0)
  const request = useMemo(() => ({ region, retry }), [region, retry])
  const [response, setResponse] = useState<{ request: typeof request; data: StudyResponse } | null>(null)
  const [failure, setFailure] = useState<{ request: typeof request; message: string } | null>(null)
  const data = response?.request === request ? response.data : null
  const error = failure?.request === request ? failure.message : null
  const plot = usePlotImage(data ? `/api/study/plot?${new URLSearchParams({ region })}` : null, plotRetry)

  useEffect(() => {
    const controller = new AbortController()
    getJson<StudyResponse>(`/api/study?${new URLSearchParams({ region: request.region })}`, controller.signal)
      .then((result) => { if (!controller.signal.aborted) setResponse({ request, data: result }) })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setFailure({ request, message: reason instanceof Error ? reason.message : 'Unable to load the regional study.' })
      })
    return () => controller.abort()
  }, [request])

  if (error) return <div className="data-message" role="alert"><p>{error}</p><button type="button" onClick={() => setRetry((value) => value + 1)}>Retry regional study</button></div>
  if (!data) return <p className="data-message" role="status">Preparing the regional rainfall and vegetation study…</p>

  return (
    <section className="region-study" aria-labelledby="regional-study-title">
      <div className="explorer-section-heading">
        <div><p className="explorer-eyebrow">A study of this region</p><h2 id="regional-study-title">Does greenness follow the rain?</h2></div>
        <Link to={`/analysis?region=${region}`} className="explorer-detail-link">Full analysis details <ArrowIcon /></Link>
      </div>
      <p className="explorer-section-copy">We compare rainfall with NDVI and EVI across {data.observations} monthly records. The study examines the seasonal cycle, rainfall leading vegetation by up to three months, and departures from the usual seasonal pattern.</p>

      <section className="study-question study-example" aria-labelledby="study-question-title">
        <h3 id="study-question-title">What were we trying to demonstrate?</h3>
        <p>We asked whether rainfall is followed by increased vegetation greenness, how long that association takes to appear, and whether the pattern differs between seasonal savannas and a humid forest. NDVI and EVI describe greenness, not the area of vegetation or a direct measurement of biomass.</p>
        <h3>The comparisons we performed</h3>
        <ol className="study-experiments">
          <li><strong>Seasonal timing.</strong> Average each calendar month over the full record to see when rain and greenness usually peak.</li>
          <li><strong>Delayed association.</strong> Compare rainfall with NDVI/EVI in the same month and one, two or three months later, using Pearson correlation.</li>
          <li><strong>Seasonality check.</strong> Subtract each calendar month's usual value and repeat the comparison. This asks whether unusually wet months are associated with unusually green later months.</li>
          <li><strong>Trend sensitivity.</strong> Remove a fitted linear trend from the paired seasonal anomalies and cross-check with EVI to see whether the interpretation changes.</li>
          <li><strong>Dated satellite comparison.</strong> Select an example using rainfall alone and inspect consecutive monthly NDVI maps and dated true-color photos over the same geographic area.</li>
        </ol>
        <p>These are observational comparisons, rather than controlled experiments: we did not manipulate rainfall or hold other environmental factors constant. A positive correlation supports an association, but does not prove that rainfall caused the vegetation change. The regional findings below report what the comparisons actually show.</p>
      </section>

      <div className="study-metrics" aria-label="NDVI relationship summary">
        <article><span>Same-month NDVI</span><strong>{r(data.metrics.ndvi_same_month_r)}</strong><small>Pearson r · monthly values</small></article>
        <article><span>Rain one month earlier</span><strong>{r(data.metrics.ndvi_lag1_r)}</strong><small>Pearson r · NDVI association</small></article>
        <article><span>After removing seasonality</span><strong>{r(data.metrics.ndvi_lag1_anomaly_r)}</strong><small>Anomaly r · one-month rain lead</small></article>
      </div>

      <div className="study-findings" aria-label="Regional findings">
        {data.findings.map((finding, index) => <article key={finding.title}><span className="study-finding-number">{String(index + 1).padStart(2, '0')}</span><div><h3>{finding.title}</h3><p>{finding.text}</p></div></article>)}
      </div>

      <figure className="scientific-plot study-plot" aria-busy={plot.loading}>
        {plot.loading && <p className="data-message" role="status">Drawing the study charts…</p>}
        {plot.error && <div className="data-message" role="alert"><p>{plot.error}</p><button type="button" onClick={() => setPlotRetry((value) => value + 1)}>Retry study charts</button></div>}
        {plot.src && <><img src={plot.src} alt={`Regional study for ${data.label}: seasonal rainfall and vegetation, lead correlations, rainfall–vegetation anomalies, and a dated example`} /><figcaption>Read the seasonal cycle first, then compare the raw and anomaly correlations. A positive rain lead means rainfall was measured before the vegetation observation. Monthly rainfall amounts are estimated from the supplied mean rate and the calendar month's hours.</figcaption><div className="plot-actions"><a href={plot.src} download={`MeteoPark-${region}-regional-study.png`}>Download study PNG ↓</a><a href={plot.src} target="_blank" rel="noreferrer">View full-size <ArrowIcon /></a></div></>}
      </figure>

      {data.example && <section className="study-example" aria-labelledby="study-example-title">
        <p className="explorer-eyebrow">A dated example from the record</p>
        <h3 id="study-example-title">{formatMonth(data.example.before)} → {formatMonth(data.example.after)}</h3>
        <div className="study-example-values">
          <p><strong>{data.example.rain_mm.toFixed(1)} → {data.example.rain_after_mm.toFixed(1)} mm</strong><span>estimated rainfall, onset → following month</span></p>
          <p><strong>{data.example.ndvi_before.toFixed(3)} → {data.example.ndvi_after.toFixed(3)}</strong><span>NDVI, earlier month → later month</span></p>
          <p><strong>{data.example.evi_before.toFixed(3)} → {data.example.evi_after.toFixed(3)}</strong><span>EVI, earlier month → later month</span></p>
        </div>
        <p>{data.example.selection_note}</p>
        <button className="explorer-primary-action" type="button" onClick={onViewSatellite}>Inspect the satellite evidence <ArrowIcon /></button>
        <small>This two-month example illustrates the record; it does not establish that rainfall caused the change.</small>
      </section>}

      <details className="study-methods">
        <summary>See the numbers, methods and limitations</summary>
        <p>A one-month lead compares rainfall in month t−1 with vegetation in month t. Anomalies subtract each variable's calendar-month mean. A dash means the correlation is undefined.</p>
        <div className="study-table-scroll"><table><caption>Same-month and one-month-lead associations</caption><thead><tr><th scope="col">Index</th><th scope="col">Same-month r</th><th scope="col">Same-month anomaly r</th><th scope="col">One-month lead r</th><th scope="col">One-month anomaly r</th><th scope="col">Lead-1 pairs</th></tr></thead><tbody>{data.results.map((result) => {
          const lag = result.lags.find((item) => item.months === 1)
          return <tr key={result.variable}><th scope="row">{result.label}</th><td>{r(result.pearson_r)}</td><td>{r(result.anomaly_r)}</td><td>{r(lag?.pearson_r)}</td><td>{r(lag?.anomaly_r)}</td><td>{lag?.observations ?? '—'}</td></tr>
        })}</tbody></table></div>
        <h3>Methods</h3><ul>{data.methodology.map((method) => <li key={method}>{method}</li>)}</ul>
        <h3>Limits of the evidence</h3><ul>{data.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
      </details>
    </section>
  )
}
