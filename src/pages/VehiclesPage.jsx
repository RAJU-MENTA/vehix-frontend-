import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categories } from '../data/vehicleData.js'
import { EmptyState } from '../components/EmptyState.jsx'
import { VehicleCard } from '../components/VehicleCard.jsx'
import { useVehicleData } from '../hooks/useVehicleData.js'

export function VehiclesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [priceError, setPriceError] = useState('')
  const sort = searchParams.get('sort') || ''

  const { vehicles, loading, error, refresh } = useVehicleData({
    search: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || '',
  })

  const sortedVehicles = useMemo(() => {
    if (sort === 'price-low') return [...vehicles].sort((a, b) => a.pricePerDay - b.pricePerDay)
    if (sort === 'price-high') return [...vehicles].sort((a, b) => b.pricePerDay - a.pricePerDay)
    if (sort === 'year-newest') return [...vehicles].sort((a, b) => b.year - a.year)
    return vehicles
  }, [sort, vehicles])

  const applyFilters = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const query = formData.get('q').toString().trim()
    const location = formData.get('location').toString().trim()
    const selectedCategory = formData.get('category').toString()
    const minPrice = formData.get('minPrice').toString()
    const maxPrice = formData.get('maxPrice').toString()
    const selectedSort = formData.get('sort').toString()

    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      setPriceError('Maximum price must be greater than or equal to the minimum price.')
      return
    }
    setPriceError('')
    const nextParams = new URLSearchParams()
    if (query.trim()) nextParams.set('q', query.trim())
    if (location.trim()) nextParams.set('location', location.trim())
    if (selectedCategory) nextParams.set('category', selectedCategory)
    if (minPrice) nextParams.set('minPrice', minPrice)
    if (maxPrice) nextParams.set('maxPrice', maxPrice)
    if (selectedSort) nextParams.set('sort', selectedSort)
    setSearchParams(nextParams)
  }

  const clearFilters = () => {
    setPriceError('')
    setSearchParams({})
  }

  return (
    <section className="container section-block fleet-page">
      <div className="fleet-heading">
        <div>
          <span className="eyebrow">The VEHIX collection</span>
          <h1>Find the one for your next.</h1>
          <p>Search a handpicked fleet of cars, ready when you are.</p>
        </div>
        <span className="fleet-result-count">{loading ? 'Refreshing fleet…' : `${vehicles.length} ${vehicles.length === 1 ? 'vehicle' : 'vehicles'} to explore`}</span>
      </div>

      <form key={searchParams.toString()} className="fleet-filter-panel" onSubmit={applyFilters}>
        <div className="fleet-filter-grid">
          <label className="fleet-filter-field fleet-filter-wide">
            <span>Search</span>
            <input type="search" name="q" defaultValue={searchParams.get('q') || ''} placeholder="Vehicle, brand or model" />
          </label>
          <label className="fleet-filter-field">
            <span>Pickup location</span>
            <input name="location" defaultValue={searchParams.get('location') || ''} placeholder="City or neighborhood" />
          </label>
          <label className="fleet-filter-field">
            <span>Category</span>
            <select name="category" defaultValue={searchParams.get('category') || ''}>
              <option value="">All categories</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className="fleet-filter-field">
            <span>Min. daily price</span>
            <input type="number" name="minPrice" min="0" step="1" defaultValue={searchParams.get('minPrice') || ''} placeholder="₹ 0" />
          </label>
          <label className="fleet-filter-field">
            <span>Max. daily price</span>
            <input type="number" name="maxPrice" min="0" step="1" defaultValue={searchParams.get('maxPrice') || ''} placeholder="No limit" />
          </label>
          <label className="fleet-filter-field">
            <span>Sort by</span>
            <select name="sort" defaultValue={sort}>
              <option value="">Recommended</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="year-newest">Newest model year</option>
            </select>
          </label>
        </div>
        {priceError && <p className="fleet-filter-error" role="alert">{priceError}</p>}
        <div className="fleet-filter-actions">
          <button className="btn btn-primary" type="submit">Apply filters <span aria-hidden="true">→</span></button>
          <button className="fleet-clear-button" type="button" onClick={clearFilters}>Clear all</button>
        </div>
      </form>

      <div className="vehicle-grid fleet-results">
        {sortedVehicles.length
          ? sortedVehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)
          : loading
            ? <EmptyState message="Loading available vehicles…" />
            : error
              ? <div className="data-error" role="alert">{error} <button type="button" onClick={refresh}>Try again</button></div>
              : <EmptyState message="No vehicles match these filters. Try different filters or check back after a seller adds a vehicle." />}
      </div>
    </section>
  )
}
