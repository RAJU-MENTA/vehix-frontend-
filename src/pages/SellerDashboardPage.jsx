import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { currency, categories } from '../data/vehicleData.js'
import { VehicleCard } from '../components/VehicleCard.jsx'
import { api, apiErrorMessage } from '../services/api.js'

const initialVehicle = {
  name: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  category: categories[0],
  fuelType: 'Petrol',
  transmission: 'Manual',
  seatingCapacity: 5,
  location: '',
  pricePerDay: '',
  description: '',
  available: true,
}
const currentYear = new Date().getFullYear()

export function SellerDashboardPage({ user }) {
  const [vehicles, setVehicles] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const [formMessage, setFormMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [updatingVehicleId, setUpdatingVehicleId] = useState(null)

  useEffect(() => {
    if (!imagePreview) return undefined
    return () => URL.revokeObjectURL(imagePreview)
  }, [imagePreview])

  const loadData = useCallback(async () => {
    const [vehiclesResult, bookingsResult] = await Promise.allSettled([
      api.get('/seller/vehicles'),
      api.get('/bookings'),
    ])

    if (vehiclesResult.status === 'fulfilled') {
      setVehicles(Array.isArray(vehiclesResult.value.data) ? vehiclesResult.value.data : [])
      setLoadError('')
    } else {
      setLoadError(apiErrorMessage(vehiclesResult.reason, 'Could not load your vehicle listings.'))
    }

    if (bookingsResult.status === 'fulfilled') {
      setBookings(Array.isArray(bookingsResult.value.data) ? bookingsResult.value.data : [])
      setStatusMessage('')
    } else {
      setStatusMessage(apiErrorMessage(bookingsResult.reason, 'Could not load rental requests.'))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
    const intervalId = window.setInterval(loadData, 15000)
    window.addEventListener('focus', loadData)
    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', loadData)
    }
  }, [loadData])

  const handleAddVehicle = async (event) => {
    event.preventDefault()
    const formElement = event.currentTarget
    setSaving(true)
    setFormMessage('')

    const formData = new FormData(formElement)
    const image = formData.get('image')
    if (!(image instanceof File) || image.size === 0) {
      setFormMessage('Choose a vehicle photo from your device before publishing.')
      setSaving(false)
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(image.type) || image.size > 5 * 1024 * 1024) {
      setFormMessage('Choose a JPG, PNG, or WEBP photo smaller than 5 MB.')
      setSaving(false)
      return
    }
    const vehicle = {
      name: formData.get('name').toString().trim(),
      brand: formData.get('brand').toString().trim(),
      model: formData.get('model').toString().trim(),
      year: Number(formData.get('year')),
      category: formData.get('category').toString(),
      fuelType: formData.get('fuelType').toString(),
      transmission: formData.get('transmission').toString(),
      seatingCapacity: Number(formData.get('seatingCapacity')),
      location: formData.get('location').toString().trim(),
      pricePerDay: Number(formData.get('pricePerDay')),
      description: formData.get('description').toString().trim(),
      available: true,
    }
    const payload = new FormData()
    payload.append('vehicle', new Blob([JSON.stringify(vehicle)], { type: 'application/json' }))
    if (image instanceof File && image.size > 0) payload.append('image', image)

    try {
      const result = await api.post('/vehicles', payload)
      setVehicles((current) => [result.data, ...current])
      formElement.reset()
      setImagePreview('')
      setFormOpen(false)
      setFormMessage('Your vehicle listing is live.')
      await loadData()
    } catch (error) {
      setFormMessage(apiErrorMessage(error, 'Could not add the vehicle. Check the details and try again.'))
    } finally {
      setSaving(false)
    }
  }

  const handleStatusUpdate = async (bookingId, nextStatus) => {
    setStatusMessage('')
    try {
      const result = await api.put(`/bookings/${bookingId}/status?status=${encodeURIComponent(nextStatus)}`)
      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingId ? { ...booking, status: result.data.status } : booking,
        ),
      )
    } catch (error) {
      setStatusMessage(apiErrorMessage(error, 'Unable to update this booking status.'))
    }
  }

  const handleVehicleAvailability = async (vehicle) => {
    const available = !vehicle.available
    const action = available ? 'put this vehicle back on' : 'remove this vehicle from'
    if (!window.confirm(`Are you sure you want to ${action} the portal? Existing bookings will remain in your account.`)) {
      return
    }

    setFormMessage('')
    setUpdatingVehicleId(vehicle.id)
    try {
      const result = await api.patch(`/vehicles/${vehicle.id}/availability`, null, { params: { available } })
      setVehicles((current) => current.map((item) => item.id === vehicle.id ? result.data : item))
      setFormMessage(available
        ? `${vehicle.name} is listed on the portal again.`
        : `${vehicle.name} was removed from the customer portal. Existing bookings are unchanged.`)
    } catch (error) {
      setFormMessage(apiErrorMessage(error, 'Could not update this vehicle listing. Please try again.'))
    } finally {
      setUpdatingVehicleId(null)
    }
  }

  return (
    <section className="container section-block seller-dashboard">
      <div className="section-header">
        <div>
          <span className="eyebrow">Seller portal</span>
          <h2>{user?.role === 'ADMIN' ? 'Fleet management' : 'My listings'}</h2>
          <p className="seller-subtitle">Add a car, manage your fleet, and keep track of rental requests.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={() => setFormOpen((open) => !open)}>
          {formOpen ? 'Close form' : '+ Add a vehicle'}
        </button>
      </div>

      {formMessage && <p className="seller-form-message" role="status">{formMessage}</p>}
      {formOpen && (
        <form className="vehicle-entry-form" onSubmit={handleAddVehicle}>
          <div className="vehicle-entry-heading">
            <div><span className="eyebrow">New listing</span><h3>Tell us about your vehicle</h3></div>
            <span>Fields marked * are required</span>
          </div>
          <div className="vehicle-entry-grid">
            <label>Listing name *<input name="name" required maxLength="120" placeholder="e.g. Hyundai Creta SX" /></label>
            <label>Brand *<input name="brand" required maxLength="80" placeholder="e.g. Hyundai" /></label>
            <label>Model *<input name="model" required maxLength="80" placeholder="e.g. Creta SX" /></label>
            <label>Year *<input name="year" type="number" required min="2000" max={currentYear + 1} defaultValue={initialVehicle.year} /></label>
            <label>Category *<select name="category" defaultValue={initialVehicle.category}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
            <label>Fuel type *<select name="fuelType" defaultValue="Petrol">{['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'].map((fuel) => <option key={fuel}>{fuel}</option>)}</select></label>
            <label>Transmission *<select name="transmission" defaultValue="Manual">{['Manual', 'Automatic'].map((transmission) => <option key={transmission}>{transmission}</option>)}</select></label>
            <label>Seats *<input name="seatingCapacity" type="number" required min="1" max="20" defaultValue={initialVehicle.seatingCapacity} /></label>
            <label>Pickup city / location *<input name="location" required maxLength="120" placeholder="e.g. Bengaluru, Karnataka" /></label>
            <label>Price per day (₹) *<input name="pricePerDay" type="number" required min="1" step="1" placeholder="e.g. 3500" /></label>
            <label className="vehicle-entry-wide">Vehicle photo *<input name="image" type="file" accept="image/jpeg,image/png,image/webp" required onChange={(event) => {
              const file = event.target.files?.[0]
              setImagePreview(file ? URL.createObjectURL(file) : '')
              setFormMessage('')
            }} /></label>
            {imagePreview && <img className="vehicle-image-preview" src={imagePreview} alt="Selected vehicle preview" />}
            <label className="vehicle-entry-wide">Description<textarea name="description" maxLength="2000" rows="4" placeholder="Describe the condition, comfort, and standout features of your vehicle." /></label>
          </div>
          <p className="vehicle-entry-hint">Choose a photo from your device. Accepted formats: JPG, PNG, or WEBP, up to 5 MB.</p>
          <div className="vehicle-entry-actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Publishing…' : 'Publish vehicle'}</button>
            <button className="fleet-clear-button" type="button" onClick={() => setFormOpen(false)}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="empty-state">Loading your fleet…</div>
      ) : loadError ? (
        <div className="data-error" role="alert">{loadError} <button type="button" onClick={loadData}>Try again</button></div>
      ) : vehicles.length ? (
        <div className="vehicle-grid compact-grid">
          {vehicles.map((vehicle) => (
            <div className="seller-listing-item" key={vehicle.id}>
              <VehicleCard vehicle={vehicle} />
              <div className="seller-listing-actions">
                <span className={`status-badge${vehicle.available ? '' : ' listing-unavailable'}`}>
                  {vehicle.available ? 'Listed on portal' : 'Removed from portal'}
                </span>
                <button
                  className={vehicle.available ? 'fleet-clear-button' : 'btn btn-primary'}
                  type="button"
                  disabled={updatingVehicleId === vehicle.id}
                  onClick={() => handleVehicleAvailability(vehicle)}
                >
                  {updatingVehicleId === vehicle.id
                    ? 'Updating…'
                    : vehicle.available ? 'Remove from portal' : 'Relist vehicle'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">No vehicles listed yet. Add your first vehicle to make it available to customers.</div>
      )}

      <div className="section-header" style={{ marginTop: '2rem' }}>
        <div>
          <span className="eyebrow">Bookings</span>
          <h2>Rental requests</h2>
        </div>
      </div>

      {statusMessage && <p className="seller-form-message" role="alert">{statusMessage}</p>}
      {loading ? (
        <div className="empty-state">Loading bookings…</div>
      ) : bookings.length ? (
        <div className="booking-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div>
                <strong>{booking.vehicle?.name || 'Vehicle booking'}</strong>
                <p>{booking.customer?.fullName || 'Customer'} · {booking.startDate} {booking.startTime || '00:00'} – {booking.endDate} {booking.endTime || '23:59'}</p>
              </div>
              <div className="badge-row">
                <select
                  value={booking.status}
                  onChange={(event) => handleStatusUpdate(booking.id, event.target.value)}
                  aria-label={`Update booking ${booking.id} status`}
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <strong>{currency.format(booking.totalPrice || 0)}</strong>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">No active bookings yet. <Link to="/vehicles">Explore the fleet</Link></div>
      )}
    </section>
  )
}
