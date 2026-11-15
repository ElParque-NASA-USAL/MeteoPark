import ArrowIcon from './ArrowIcon'
import './SourceAttribution.css'

export default function SourceAttribution() {
  return (
    <aside className="source-attribution" aria-label="NASA Giovanni data source">
      <a
        className="source-attribution-image"
        href="https://giovanni.gsfc.nasa.gov/giovanni/"
        target="_blank"
        rel="noreferrer"
        aria-label="Open the NASA Giovanni data portal in a new tab"
      >
        <img
          src="/images/giovanni-portal.png"
          alt="NASA Giovanni portal used to access Earth science data"
          loading="lazy"
          width="1280"
          height="820"
        />
        <span>NASA Giovanni · Data portal <ArrowIcon /></span>
      </a>
      <div className="source-attribution-copy">
        <p className="source-attribution-eyebrow">From NASA observations to regional insight</p>
        <h3>Our data starts with Giovanni.</h3>
        <p>
          The meteorological and land-surface data used in MeteoPark were
          extracted from NASA Giovanni servers as regional monthly averages.
          Giovanni is NASA GES DISC’s platform for exploring, visualizing,
          and downloading Earth science data.
        </p>
        <a href="https://giovanni.gsfc.nasa.gov/giovanni/" target="_blank" rel="noreferrer">
          Explore NASA Giovanni <span aria-hidden="true"><ArrowIcon /></span>
        </a>
        <small>Portal image: NASA GES DISC / Giovanni.</small>
      </div>
    </aside>
  )
}
