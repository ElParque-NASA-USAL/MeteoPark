import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import './HomePage.css'

const researchTopics = [
  {
    number: '01',
    title: 'Data sources',
    description:
      'The Earth science missions or models behind each dataset, along with their coverage and time period, will be documented here.',
  },
  {
    number: '02',
    title: 'Methods',
    description:
      'The team will explain how trend direction, magnitude, and significance were assessed.',
  },
  {
    number: '03',
    title: 'Variables',
    description:
      'The selected variables, their units and time resolution, and why they matter will appear here after the analysis is complete.',
  },
]

function HomePage() {
  const pageRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const page = pageRef.current
    if (
      !page ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const sections = page.querySelectorAll<HTMLElement>('.home-reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -36px 0px' },
    )

    page.classList.add('has-reveal')
    sections.forEach((section) => observer.observe(section))

    return () => {
      observer.disconnect()
      page.classList.remove('has-reveal')
    }
  }, [])

  return (
    <main className="home-page" ref={pageRef}>
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-inner">
          <div className="home-hero-topline">
            <span className="home-wordmark">MeteoPark</span>
            <span className="home-topline-note">NASA Space Apps Challenge 2026</span>
          </div>

          <div className="home-hero-grid">
            <div className="home-hero-copy">
              <p className="home-kicker">Earth system trend detective</p>
              <h1 id="home-title">
                Find the trend.<br />
                <span>See the evidence.</span>
              </h1>
              <p className="home-hero-description">
                We are building a tool to explore Earth science variables across
                selected regions. Our goal is to show what changes over time,
                where it changes, by how much, and whether the trend is significant.
              </p>
              <Link className="home-cta" to="/explore">
                Explore regions <span aria-hidden="true">↗</span>
              </Link>
            </div>

            <div className="home-hero-art" aria-label="Illustrative preview of the results">
              <div className="home-orbit home-orbit-one" aria-hidden="true" />
              <div className="home-orbit home-orbit-two" aria-hidden="true" />
              <div className="home-hero-preview">
                <img
                  src="/test-results/before.png"
                  alt="Illustrative forest image used in the demo"
                />
                <div className="home-preview-caption">
                  <span>Selected region</span>
                  <strong>From place to perspective</strong>
                </div>
              </div>
              <div className="home-preview-badge">Demo preview / not scientific results</div>
            </div>
          </div>

          <a className="home-scroll-cue" href="#overview">
            Scroll to discover <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section className="home-section home-overview" id="overview" aria-labelledby="overview-title">
        <div className="home-section-inner home-reveal">
          <p className="home-section-label">01 / The idea</p>
          <div className="home-section-heading">
            <h2 id="overview-title">From observations<br />to trends.</h2>
            <p>
              The globe is the starting point. Choose a region, then examine
              time series and supporting imagery. The final analysis will show
              the selected variables, the size and direction of their trends,
              and whether those trends are significant.
            </p>
          </div>
          <ol className="home-steps">
            <li>
              <span className="home-step-number">01</span>
              <h3>Choose a region</h3>
              <p>Find a highlighted area on the globe or select it from the list.</p>
            </li>
            <li>
              <span className="home-step-number">02</span>
              <h3>Follow the variable</h3>
              <p>The finished explorer will pair its time series with contextual imagery.</p>
            </li>
            <li>
              <span className="home-step-number">03</span>
              <h3>Assess the trend</h3>
              <p>The completed analysis will explain its direction, magnitude, and significance.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="home-section home-results" aria-labelledby="results-title">
        <div className="home-section-inner home-reveal">
          <p className="home-section-label">02 / Results preview</p>
          <div className="home-section-heading">
            <h2 id="results-title">See the evidence<br />from more than one angle.</h2>
            <p>
              Graphs and time series will carry the trend analysis. Images and
              animation add visual context. These previews use illustrative
              content while the final data is being prepared.
            </p>
          </div>

          <div className="home-showcase">
            <div className="home-showcase-topline">
              <span>Inside the explorer</span>
              <span>Illustrative content · Not scientific results</span>
            </div>
            <div className="home-showcase-grid">
              <div className="home-showcase-comparison">
                <div className="home-showcase-caption">
                  <span>01 / Compare</span>
                  <h3>Before & after</h3>
                </div>
                <div className="home-image-pair">
                  <figure>
                    <img src="/test-results/before.png" alt="Illustrative before image" loading="lazy" />
                    <figcaption>Before</figcaption>
                  </figure>
                  <figure>
                    <img src="/test-results/after.png" alt="Illustrative after image" loading="lazy" />
                    <figcaption>After</figcaption>
                  </figure>
                </div>
              </div>
              <div className="home-showcase-stack">
                <figure className="home-showcase-tile">
                  <div className="home-showcase-caption">
                    <span>02 / Understand</span>
                    <h3>Graphs</h3>
                  </div>
                  <img src="/test-results/graph1.webp" alt="Illustrative graph with simulated data" loading="lazy" />
                </figure>
                <figure className="home-showcase-tile">
                  <div className="home-showcase-caption">
                    <span>03 / Follow</span>
                    <h3>Animation</h3>
                  </div>
                  <img src="/test-results/animation.gif" alt="Illustrative forest animation" loading="lazy" />
                </figure>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section home-research" aria-labelledby="research-title">
        <div className="home-section-inner home-reveal">
          <p className="home-section-label">03 / Behind the results</p>
          <div className="home-section-heading">
            <h2 id="research-title">The methods<br />behind every trend.</h2>
            <p>
              The analysis team will document the data sources, selected
              variables, and methods used to estimate and assess each trend.
            </p>
          </div>
          <div className="home-research-grid">
            {researchTopics.map((topic) => (
              <article className="home-research-card" key={topic.number}>
                <span className="home-research-number">{topic.number}</span>
                <div>
                  <h3>{topic.title}</h3>
                  <p>{topic.description}</p>
                </div>
                <span className="home-placeholder-tag">Content pending</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section home-team" aria-labelledby="team-title">
        <div className="home-section-inner home-team-grid home-reveal">
          <img
            className="home-team-photo"
            src="/images/team.jpeg"
            alt="Three members of El Parque standing together"
            loading="lazy"
          />
          <div className="home-team-copy">
            <p className="home-section-label">04 / The people</p>
            <h2 id="team-title">Made by<br />El Parque.</h2>
            <p>
              A team bringing development and data analysis together to make
              Earth observation easier to explore.
            </p>
          </div>
        </div>
      </section>

      <section className="home-final" aria-labelledby="final-title">
        <div className="home-section-inner home-reveal">
          <p className="home-section-label">05 / Your turn</p>
          <h2 id="final-title">Pick a place.<br /><span>Start exploring.</span></h2>
          <Link className="home-cta" to="/explore">
            Explore regions <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <footer className="home-footer">
        <span>MeteoPark · by El Parque</span>
        <span>NASA Space Apps Challenge 2026</span>
      </footer>
    </main>
  )
}

export default HomePage
