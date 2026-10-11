import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { currency } from '../data/vehicleData.js'
import { api, apiErrorMessage } from '../services/api.js'

export function MyBookingsPage({ user }) {
  const location = useLocation()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadBookings = useCallback(async () => {
    try {
      const result = await api.get('/bookings/my')
      setBookings(Array.isArray(result.data) ? result.data : [])
      setError('')
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Could not load your bookings.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBookings()
    const intervalId = window.setInterval(loadBookings, 15000)
    window.addEventListener('focus', loadBookings)
    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', loadBookings)
    }
  }, [loadBookings])

  return (
    <section className="container section-block">
      <div className="section-header">
        <div>
          <span className="eyebrow">Your activity</span>
          <h2>{user?.fullName}'s bookings</h2>
        </div>
      </div>

      {location.state?.bookingSuccess && (
        <div className="booking-success-panel" role="status">
          <span className="booking-success-icon" aria-hidden="true">✓</span>
          <div>
            <h3>Congratulations!</h3>
            <p>{location.state.bookingSuccess}</p>
            <p>You can follow the request status in your bookings below.</p>
          </div>
        </div>
      )}
      {loading ? (
        <div className="empty-state">Loading your bookings from the server…</div>
      ) : error ? (
        <div className="data-error" role="alert">{error} <button type="button" onClick={loadBookings}>Try again</button></div>
      ) : bookings.length ? (
        <div className="booking-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div>
                <strong>{booking.vehicle?.name || 'Vehicle booking'}</strong>
                <p>{booking.startDate} {booking.startTime || ''} – {booking.endDate} {booking.endTime || ''}</p>
              </div>
              <div className="badge-row">
                <span className="status-badge">{booking.status}</span>
                <strong>{currency.format(booking.totalPrice || 0)}</strong>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">No bookings in your account yet. Once a booking is saved, it will appear here.</div>
      )}
    </section>
  )
}
