import { Link } from 'react-router'

function HomePage() {
  return (
    <main>
      <section className="home-hero">
        <p className="eyebrow">A project by El Parque</p>
        <h1>Explore how Earth changes over time</h1>
        <p className="home-intro">
          We are building an interactive way to explore selected regions
          through Earth imagery and data. Rotate the globe, choose a region,
          and discover how it changes over time.
        </p>
        <Link className="primary-link" to="/explore">
          Open the explorer
        </Link>
      </section>

      <section className="home-about" aria-labelledby="about-title">
        <h2 id="about-title">About the project</h2>
        <p>
          Our team is researching which regions, datasets, and analyses
          best reveal meaningful changes. The explorer will bring those
          findings together in one place.
        </p>
      </section>
    </main>
  )
}

export default HomePage