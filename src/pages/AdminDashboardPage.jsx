import { useEffect, useMemo, useState } from 'react'
import { currency } from '../data/vehicleData.js'
import { api } from '../services/api.js'

export function AdminDashboardPage() {
  const [bookings, setBookings] = useState([])
  const [tickets, setTickets] = useState([])
  const [pageError, setPageError] = useState('')
  const [ticketError, setTicketError] = useState('')

  useEffect(() => {
    const loadBookings = async () => {
      const results = await Promise.allSettled([api.get('/bookings'), api.get('/support/tickets')])
      if (results[0].status === 'fulfilled') {
        setBookings(Array.isArray(results[0].value.data) ? results[0].value.data : [])
      } else {
        setPageError(results[0].reason.response?.data?.message || 'Could not load booking activity.')
      }
      if (results[1].status === 'fulfilled') {
        setTickets(Array.isArray(results[1].value.data) ? results[1].value.data : [])
      } else {
        setTicketError(results[1].reason.response?.data?.message || 'Could not load support tickets.')
      }
    }

    loadBookings()
  }, [])

  const handleTicketStatusUpdate = async (ticketId, status) => {
    setTicketError('')
    try {
      const result = await api.put(`/support/tickets/${ticketId}/status`, null, { params: { status } })
      setTickets((current) => current.map((ticket) => ticket.id === ticketId ? result.data : ticket))
    } catch (error) {
      setTicketError(error.response?.data?.message || 'Could not update the support ticket.')
    }
  }

  const stats = useMemo(() => {
    const summary = { total: bookings.length, pending: 0, confirmed: 0, cancelled: 0 }

    bookings.forEach((booking) => {
      if (booking.status === 'PENDING') summary.pending += 1
      if (booking.status === 'CONFIRMED') summary.confirmed += 1
      if (booking.status === 'CANCELLED') summary.cancelled += 1
    })

    return summary
  }, [bookings])

  return (
    <section className="container section-block">
      <div className="section-header">
        <div>
          <span className="eyebrow">Admin</span>
          <h2>Operations dashboard</h2>
        </div>
      </div>
      <div className="admin-grid">
        <div className="admin-card">
          <strong>Total bookings</strong>
          <p>{stats.total}</p>
        </div>
        <div className="admin-card">
          <strong>Pending</strong>
          <p>{stats.pending}</p>
        </div>
        <div className="admin-card">
          <strong>Confirmed</strong>
          <p>{stats.confirmed}</p>
        </div>
        <div className="admin-card">
          <strong>Cancelled</strong>
          <p>{stats.cancelled}</p>
        </div>
      </div>

      <div className="section-header" style={{ marginTop: '2rem' }}>
        <div>
          <span className="eyebrow">Recent activity</span>
          <h2>Latest rental requests</h2>
        </div>
      </div>

      {pageError && <div className="empty-state" role="alert">{pageError}</div>}
      <div className="booking-list">
        {bookings.length ? (
          bookings.slice(0, 5).map((booking) => (
            <div key={booking.id} className="booking-card">
              <div>
                <strong>{booking.vehicle?.name || 'Vehicle booking'}</strong>
                <p>{booking.customer?.fullName || 'Customer'} • {booking.startDate} {booking.startTime || ''} – {booking.endDate} {booking.endTime || ''}</p>
              </div>
              <div className="badge-row">
                <span className="status-badge">{booking.status}</span>
                <strong>{currency.format(booking.totalPrice || 0)}</strong>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">No bookings have been created yet.</div>
        )}
      </div>

      <div className="section-header" style={{ marginTop: '2rem' }}>
        <div>
          <span className="eyebrow">Customer care</span>
          <h2>Support requests</h2>
        </div>
      </div>
      {ticketError && <div className="empty-state" role="alert">{ticketError}</div>}
      <div className="support-ticket-list">
        {tickets.length ? tickets.map((ticket) => (
          <article className="support-ticket-card" key={ticket.id}>
            <div className="support-ticket-topline">
              <span className="status-badge">#{ticket.id} · {ticket.topic}</span>
              <select value={ticket.status} onChange={(event) => handleTicketStatusUpdate(ticket.id, event.target.value)} aria-label={`Update support ticket ${ticket.id} status`}>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
            <h3>{ticket.subject}</h3>
            <p>{ticket.message}</p>
            <small>{ticket.fullName} · {ticket.email} · {ticket.createdAt?.slice(0, 10)}</small>
          </article>
        )) : (
          !ticketError && <div className="empty-state">There are no support requests yet.</div>
        )}
      </div>
    </section>
  )
}
