import ArrowIcon from '../components/ArrowIcon'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import SourceAttribution from '../components/SourceAttribution'
import './HomePage.css'

const researchTopics = [
  {
    number: '01',
    title: 'Data sources',
    description:
      'Read about GPM IMERG, GLDAS and MODIS, and how their regional monthly series are brought together.',
    href: '/wiki#sources',
  },
  {
    number: '02',
    title: 'Methods',
    description:
      'Compare rainfall with NDVI and EVI, inspect seasonal anomalies, and explore responses up to three months later.',
    href: '/analysis',
  },
  {
    number: '03',
    title: 'Variables',
    description:
      'Explore the twelve variables in our data: definitions, source units, time resolution and interpretation.',
    href: '/wiki',
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
          <nav className="home-documentation-nav" aria-label="Research navigation">
            <Link to="/wiki">Variable wiki</Link>
            <Link to="/analysis">Rainfall & vegetation <ArrowIcon /></Link>
          </nav>

          <div className="home-hero-grid">
            <div className="home-hero-copy">
              <p className="home-kicker">Earth system trend detective</p>
              <h1 id="home-title">
                Find the trend.<br />
                <span>See the evidence.</span>
              </h1>
              <p className="home-hero-description">
                Explore monthly Earth science data across five selected regions.
                Follow up to five variables at once, then compare rainfall with
                vegetation greenness through NDVI and EVI.
              </p>
              <Link className="home-cta" to="/explore">
                Explore regions <span aria-hidden="true"><ArrowIcon /></span>
              </Link>
            </div>

            <div className="home-hero-art" aria-label="NASA satellite view of the Sahel study area">
              <div className="home-orbit home-orbit-one" aria-hidden="true" />
              <div className="home-orbit home-orbit-two" aria-hidden="true" />
              <div className="home-hero-preview">
                <img
                  src="/satellite/Niger/2015-08-truecolor.png"
                  alt="NASA MODIS true-color view of the Sahel study area in Niger on 20 August 2015"
                />
                <div className="home-preview-caption">
                  <span>Sahel, Niger · Terra / MODIS</span>
                  <strong>A closer look at the rainy season</strong>
                </div>
              </div>
              <div className="home-preview-badge">NASA satellite image / 20 Aug 2015</div>
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
              time series and the rainfall–vegetation analysis. Compare the
              monthly observations and seasonal anomalies to understand how
              their relationships vary across different climates.
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
              <p>Choose up to five variables and compare their monthly series in their original units.</p>
            </li>
            <li>
              <span className="home-step-number">03</span>
              <h3>Explore the relationship</h3>
              <p>Compare rainfall and vegetation in the same month and at delays of one to three months.</p>
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
              Explore findings, variable definitions and dated satellite views
              together. These NASA observations show the same Sahel study area
              in consecutive months; the full regional study puts the example in context.
            </p>
          </div>

          <div className="home-showcase">
            <div className="home-showcase-topline">
              <span>Inside the explorer</span>
              <span>NASA MODIS · Sahel, Niger · 2015</span>
            </div>
            <div className="home-showcase-grid">
              <div className="home-showcase-comparison">
                <div className="home-showcase-caption">
                  <span>01 / Compare</span>
                  <h3>Vegetation, one month apart</h3>
                </div>
                <div className="home-image-pair">
                  <figure>
                    <img src="/satellite/Niger/2015-07-ndvi.png" alt="NASA monthly NDVI map of the Niger study area in July 2015" loading="lazy" />
                    <figcaption>July 2015 · Monthly NDVI</figcaption>
                  </figure>
                  <figure>
                    <img src="/satellite/Niger/2015-08-ndvi.png" alt="NASA monthly NDVI map of the same Niger study area in August 2015" loading="lazy" />
                    <figcaption>August 2015 · Same NDVI scale</figcaption>
                  </figure>
                </div>
              </div>
              <div className="home-showcase-stack">
                <figure className="home-showcase-tile">
                  <div className="home-showcase-caption">
                    <span>02 / Understand</span>
                    <h3>Graphs</h3>
                  </div>
                  <img src="/images/niger-study.png" alt="Four-panel regional study of Niger: seasonal cycle, lag correlations, anomalies and the 2015 example" loading="lazy" />
                  <Link className="home-result-link" to="/explore?region=Niger">Read the regional study <ArrowIcon /></Link>
                </figure>
                <figure className="home-showcase-tile">
                  <div className="home-showcase-caption">
                    <span>03 / Follow</span>
                    <h3>Satellite observations</h3>
                  </div>
                  <img src="/satellite/Niger/2015-08-truecolor.png" alt="NASA Terra MODIS satellite photo of the Niger study area on 20 August 2015" loading="lazy" />
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
              Read the variable wiki and data sources, then inspect how the
              rainfall–vegetation relationships were calculated and how to
              interpret their limits.
            </p>
          </div>
          <SourceAttribution />
          <div className="home-research-grid">
            {researchTopics.map((topic) => (
              <article className="home-research-card" key={topic.number}>
                <span className="home-research-number">{topic.number}</span>
                <div>
                  <h3>{topic.title}</h3>
                  <p>{topic.description}</p>
                </div>
                <Link className="home-placeholder-tag home-research-link" to={topic.href}>
                  Read {topic.title.toLowerCase()} <ArrowIcon />
                </Link>
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
            Explore regions <span aria-hidden="true"><ArrowIcon /></span>
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
