import { useState } from 'react'
import evidenceRaw from '../data/satellite_evidence.json?raw'
import ArrowIcon from './ArrowIcon'
import { formatMonth } from '../lib/api'
import './SatelliteEvidence.css'

type ImageRecord = {
  src: string
  date: string
  source_url: string
  worldview_url: string
  selection_note?: string
}
type Observation = { month: string; ndvi: ImageRecord; truecolor: ImageRecord }
type Example = {
  before: string; after: string; rain_mm: number; rain_after_mm: number
  ndvi_before: number; ndvi_after: number; evi_before: number; evi_after: number
  selection_note: string
}
type RegionEvidence = {
  label: string; bbox: number[]; before: Observation; after: Observation; example: Example; visual_note?: string
}
const evidence = JSON.parse(evidenceRaw) as {
  source: string; method: string
  legend: { src: string; source_url: string }
  regions: Record<string, RegionEvidence>
}

export default function SatelliteEvidence({ region }: { region: string }) {
  const [mode, setMode] = useState<'ndvi' | 'truecolor'>('ndvi')
  const [failed, setFailed] = useState<Record<string, boolean>>({})
  const record = evidence.regions[region]
  if (!record) return <p className="satellite-note" role="status">Satellite observations for this region are being prepared.</p>
  const example = record.example
  const ndviChange = example.ndvi_after - example.ndvi_before
  const eviChange = example.evi_after - example.evi_before
  const change = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(3)}`

  return (
    <section className="satellite-evidence" aria-labelledby="satellite-title">
      <header className="satellite-header">
        <p className="satellite-eyebrow">See the same place, one month apart</p>
        <h2 id="satellite-title">Satellite observations</h2>
        <p>NASA MODIS imagery for the study area in {formatMonth(example.before)} and {formatMonth(example.after)}. The months were selected from rainfall onset, before inspecting the vegetation response.</p>
      </header>
      <aside className="satellite-reading" aria-label="Satellite image sources">
        <h3>Where these images come from</h3>
        <p>All images are authentic Terra/MODIS observations supplied by <a href="https://www.earthdata.nasa.gov/data/tools/gibs" target="_blank" rel="noreferrer">NASA Global Imagery Browse Services (GIBS)</a>. The vegetation maps use the monthly NDVI layer; the photographs use the corrected-reflectance true-color layer.</p>
        <p>Each image below links to its original NASA image request and to NASA Worldview, with the exact date and the same study-area boundaries. A common NASA legend is used for both NDVI maps. Giovanni is the source of the supplied meteorological time series; GIBS supplies these satellite views.</p>
      </aside>
      <div className="satellite-mode" role="group" aria-label="Satellite image type">
        <button type="button" aria-pressed={mode === 'ndvi'} onClick={() => setMode('ndvi')}>Monthly vegetation maps</button>
        <button type="button" aria-pressed={mode === 'truecolor'} onClick={() => setMode('truecolor')}>Satellite photos</button>
      </div>
      <p className="satellite-mode-note">
        {mode === 'ndvi'
          ? 'Monthly NDVI composites show vegetation greenness using the same NASA color scale in both maps. They are satellite-derived index maps.'
          : 'True-color Terra scenes show the landscape on the dates printed below. Clouds, haze and viewing conditions differ; these daily photos provide context for the monthly measurements.'}
      </p>
      {mode === 'truecolor' && record.visual_note && <p className="satellite-note">{record.visual_note}</p>}
      <div className="satellite-pair">
        {(['before', 'after'] as const).map((phase) => {
          const observation = record[phase]
          const asset = observation[mode]
          const index = phase === 'before' ? example.ndvi_before : example.ndvi_after
          return (
            <figure key={`${region}-${phase}-${mode}`}>
              <div className="satellite-image-heading"><span>{phase === 'before' ? 'Rainfall-onset month' : 'Following month'}</span><strong>{formatMonth(observation.month)}</strong></div>
              {failed[asset.src]
                ? <div className="satellite-image-error">The image could not be loaded. Use the NASA source links below to view it.</div>
                : <a className="satellite-image-link" href={asset.src} target="_blank" rel="noreferrer" aria-label={`Open full-size ${mode === 'ndvi' ? 'NDVI map' : 'satellite photo'} of ${record.label}, ${asset.date}`}><img src={asset.src} width="640" height="640" loading="lazy" alt={`${mode === 'ndvi' ? 'Monthly MODIS NDVI composite' : 'MODIS true-color satellite scene'} of ${record.label}, ${asset.date}`} onError={() => setFailed((current) => ({ ...current, [asset.src]: true }))} /></a>}
              <figcaption>
                <p>{mode === 'ndvi' ? `Composite month: ${formatMonth(asset.date)}` : `Daily scene: ${asset.date.slice(0, 10)}`} · Terra / MODIS</p>
                <p>CSV regional monthly NDVI <strong>{index.toFixed(3)}</strong></p>
                <div><a href={asset.worldview_url} target="_blank" rel="noreferrer">Open NASA Worldview <ArrowIcon /></a><a href={asset.source_url} target="_blank" rel="noreferrer">Original NASA image <ArrowIcon /></a></div>
              </figcaption>
            </figure>
          )
        })}
      </div>
      {mode === 'ndvi' && <figure className="satellite-legend"><img src={evidence.legend.src} alt="NASA NDVI color legend, from low vegetation greenness to high vegetation greenness" loading="lazy" /><figcaption>Shared NASA NDVI scale · Colors are not re-stretched between months.</figcaption></figure>}
      <div className="satellite-reading">
        <h3>What the paired months show</h3>
        <p>Estimated rainfall was <strong>{example.rain_mm.toFixed(1)} mm</strong> in the onset month and <strong>{example.rain_after_mm.toFixed(1)} mm</strong> in the following month. Between those months, the supplied regional NDVI changed by <strong>{change(ndviChange)}</strong> and EVI by <strong>{change(eviChange)}</strong>.</p>
        {region === 'Peru'
          ? <p>NDVI changes only slightly while EVI declines in this example. The forest region does not support a simple, uniform “more rain, more greenness next month” explanation.</p>
          : <p>Both indices increase in this selected example. The full-period study above checks whether the delayed association also appears across many years.</p>}
        <p className="satellite-note">The numeric summaries come from the supplied CSV files, not from reading colors off the browse images. These observations illustrate an association; they do not isolate rainfall as its cause.</p>
      </div>
      <details className="satellite-method"><summary>Dates, image selection and sources</summary><p>{example.selection_note}</p><p>The true-color photos were selected from fixed candidate days within each selected month, excluding missing scenes and favoring a clearer view. Each photo retains its exact acquisition date. The monthly vegetation maps retain the original NASA rendering.</p><p>Extent: {record.bbox.join(', ')} (west, south, east, north). Imagery: <a href="https://www.earthdata.nasa.gov/data/tools/gibs" target="_blank" rel="noreferrer">NASA GIBS</a>. <a href="https://science.nasa.gov/earth/earth-observatory/measuring-vegetation-ndvi-evi/" target="_blank" rel="noreferrer">How NASA measures vegetation</a>.</p></details>
    </section>
  )
}
