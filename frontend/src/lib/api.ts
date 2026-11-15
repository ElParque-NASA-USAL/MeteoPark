import { useEffect, useMemo, useState } from 'react'

export type VariableSummary = {
  id: string
  label: string
  unit: string
  description: string
  source: string
  resolution: string
  interpretation: string
}

export type RegionSummary = {
  id: string
  label: string
  climate: string
  start: string
  end: string
  observations: number
}

export type LagResult = {
  months: number
  pearson_r: number | null
  anomaly_r: number | null
  observations: number
}

export type AnalysisResponse = {
  region: string
  start: string
  end: string
  observations: number
  results: {
    variable: string
    label: string
    pearson_r: number | null
    anomaly_r: number | null
    lags: LagResult[]
  }[]
  methodology: string[]
  limitations: string[]
}

export type StudyResponse = AnalysisResponse & {
  label: string
  findings: { title: string; text: string }[]
  seasonal: {
    months: number[]
    precipitation_mm: number[]
    ndvi: number[]
    evi: number[]
    counts: number[]
  }
  metrics: {
    ndvi_same_month_r: number | null
    ndvi_lag1_r: number | null
    ndvi_lag1_anomaly_r: number | null
    evi_lag1_anomaly_r: number | null
    ndvi_lag1_detrended_anomaly_r: number | null
    evi_lag1_detrended_anomaly_r: number | null
    rain_peak_month: number
    ndvi_peak_month: number
  }
  example: null | {
    before: string
    after: string
    rain_mm: number
    rain_after_mm: number
    ndvi_before: number
    ndvi_after: number
    evi_before: number
    evi_after: number
    selection_note: string
  }
}

export async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`The data service returned an error (${response.status}). Please try again.`)
  }
  return response.json() as Promise<T>
}

export function plotUrl(region: string, variables: string[]) {
  const query = new URLSearchParams({ region })
  variables.forEach((variable) => query.append('variables', variable))
  return `/api/plot?${query}`
}

/** Fetch image bytes so obsolete requests can be cancelled when a selection changes. */
export function usePlotImage(url: string | null, reloadKey = 0) {
  const request = useMemo(() => url === null ? null : { url, reloadKey }, [url, reloadKey])
  const [image, setImage] = useState<{ request: typeof request; src: string } | null>(null)
  const [error, setError] = useState<{ request: typeof request; message: string } | null>(null)

  useEffect(() => {
    if (!request) return
    const controller = new AbortController()
    let objectUrl: string | null = null
    let active = true
    fetch(request.url, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('The graph could not be generated. Please try again.')
        if (!response.headers.get('content-type')?.startsWith('image/')) {
          throw new Error('The graph service is unavailable. Check that the backend is running.')
        }
        return response.blob()
      })
      .then((blob) => {
        if (!active) return
        objectUrl = URL.createObjectURL(blob)
        setImage({ request, src: objectUrl })
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted && active) {
          setError({ request, message: reason instanceof Error ? reason.message : 'Unable to load the graph.' })
        }
      })
    return () => {
      active = false
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [request])

  return {
    src: image?.request === request ? image.src : null,
    error: error?.request === request ? error.message : null,
    loading: request !== null && image?.request !== request && error?.request !== request,
  }
}

export function formatMonth(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`)
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}
