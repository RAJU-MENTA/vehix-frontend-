import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { categories } from '../data/vehicleData.js'
import { VehicleCard } from '../components/VehicleCard.jsx'
import { useVehicleData } from '../hooks/useVehicleData.js'

export function HomePage() {
  const navigate = useNavigate()
  const { vehicles, loading, error, refresh } = useVehicleData()
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')

  const searchFleet = (event) => {
    event.preventDefault()
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    if (location.trim()) params.set('location', location.trim())
    if (category) params.set('category', category)
    navigate(`/vehicles${params.size ? `?${params}` : ''}`)
  }

  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot" /> A better way to get there</span>
            <h1>Find your drive.<br /><span>Feel the difference.</span></h1>
            <p>
              Exceptional cars, a seamless booking experience, and the freedom to make every journey yours.
            </p>
            <div className="cta-row">
              <Link className="btn btn-primary" to="/vehicles">Explore the fleet <span aria-hidden="true">→</span></Link>
              <a className="hero-text-link" href="#how-it-works">How it works <span aria-hidden="true">↓</span></a>
            </div>
            <div className="hero-proof">
              <div className="avatar-stack" aria-hidden="true"><span>J</span><span>M</span><span>A</span><span>+</span></div>
              <p><strong>Loved by thoughtful travelers</strong><span>Premium rides. People-first service.</span></p>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-frame">
              <img
                src="https://images.unsplash.com/photo-1494905998402-395d579af36f?auto=format&fit=crop&w=1200&q=80"
                alt="Premium sports car on a mountain road"
              />
              <div className="hero-image-caption">
                <span className="caption-mark">V</span>
                <div><span>THE OPEN ROAD, YOURS</span><strong>Make room for a little more.</strong></div>
                <span className="caption-arrow" aria-hidden="true">↗</span>
              </div>
            </div>
            <div className="floating-note"><span className="floating-note-icon">01</span><span><strong>Curated for you</strong><small>Only the good ones make it in.</small></span></div>
          </div>
        </div>
        <div className="container search-panel-wrap">
          <form className="home-search-panel" onSubmit={searchFleet}>
            <label className="search-field">
              <span className="search-field-icon" aria-hidden="true">⌕</span>
              <span><small>WHAT ARE YOU LOOKING FOR?</small>
                <input aria-label="Vehicle, brand or keyword" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Any vehicle or brand" />
              </span>
            </label>
            <label className="search-field">
              <span className="search-field-icon" aria-hidden="true">⌖</span>
              <span><small>PICKUP LOCATION</small>
                <input aria-label="Pickup location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="City or neighborhood" />
              </span>
            </label>
            <label className="search-field search-category">
              <span className="search-field-icon" aria-hidden="true">◇</span>
              <span><small>YOUR KIND OF RIDE</small>
                <select aria-label="Vehicle category" value={category} onChange={(event) => setCategory(event.target.value)}>
                  <option value="">All categories</option>
                  {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </span>
            </label>
            <button className="btn btn-primary search-submit" type="submit">Find a car <span aria-hidden="true">→</span></button>
          </form>
        </div>
      </section>

      <section className="container section-block home-category-section">
        <div className="section-header">
          <div>
            <span className="eyebrow">A ride for every reason</span>
            <h2>Where will the day take you?</h2>
          </div>
          <Link className="section-link" to="/vehicles">See all vehicles <span aria-hidden="true">→</span></Link>
        </div>
        <div className="category-grid">
          {categories.map((item, index) => (
            <Link key={item} className="category-card home-category-card" to={`/vehicles?category=${encodeURIComponent(item)}`}>
              <span className={`category-symbol category-symbol-${index}`} aria-hidden="true">{['↗', '▰', '✳', '⌂', '⚡'][index]}</span>
              <span>{item}</span>
              <span className="category-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section-block home-featured-section">
        <div className="section-header">
          <div>
            <span className="eyebrow">The shortlist</span>
            <h2>Good taste comes standard.</h2>
          </div>
          <Link className="section-link" to="/vehicles">Explore the fleet <span aria-hidden="true">→</span></Link>
        </div>
        <div className="vehicle-grid">
          {vehicles.slice(0, 3).map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
        </div>
        {loading && <p className="data-status" role="status">Loading vehicles from the live fleet…</p>}
        {error && <div className="data-error" role="alert">{error} <button type="button" onClick={refresh}>Try again</button></div>}
        {!loading && !error && vehicles.length === 0 && <p className="data-status">No vehicles have been listed yet. Check back soon.</p>}
      </section>

      <section className="home-experience" id="how-it-works">
        <div className="container experience-grid">
          <div className="experience-intro">
            <span className="eyebrow">The VEHIX difference</span>
            <h2>More than a car.<br /><span>It’s your time.</span></h2>
            <p>Less time sorting out the details. More time making the most of wherever you’re headed.</p>
            <Link className="btn btn-primary" to="/vehicles">Find your next ride <span aria-hidden="true">→</span></Link>
          </div>
          <div className="experience-points">
            <article className="experience-point"><span>01</span><div><h3>Good cars, no guesswork</h3><p>Every ride is selected for quality, comfort, and the kind of details you notice.</p></div></article>
            <article className="experience-point"><span>02</span><div><h3>Booking made refreshingly easy</h3><p>Find your car, choose your dates, and get on with the part you’re looking forward to.</p></div></article>
            <article className="experience-point"><span>03</span><div><h3>Here when you need us</h3><p>Real support, thoughtful service, and a smoother journey from start to finish.</p></div></article>
          </div>
        </div>
      </section>
    </>
  )
}
