import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { currency } from '../data/vehicleData.js'
import { PageNotice } from '../components/PageNotice.jsx'
import { api, apiErrorMessage } from '../services/api.js'

const localDateValue = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function BookingPage() {
  const { vehicleId } = useParams()
  const navigate = useNavigate()
  const [today] = useState(() => localDateValue(new Date()))
  const [vehicle, setVehicle] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('10:00')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('11:00')
  const [saving, setSaving] = useState(false)
  const [checking, setChecking] = useState(false)
  const [availability, setAvailability] = useState(null)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const loadVehicle = async () => {
      setLoadError('')
      try {
        const result = await api.get(`/vehicles/${vehicleId}`)
        setVehicle(result.data)
      } catch (error) {
        setLoadError(apiErrorMessage(error, 'The requested vehicle could not be loaded.'))
      }
    }
    loadVehicle()
  }, [vehicleId])

  const rentalDays = useMemo(() => {
    if (!startDate || !startTime || !endDate || !endTime) return 0
    const duration = new Date(`${endDate}T${endTime}`) - new Date(`${startDate}T${startTime}`)
    return duration > 0 ? Math.ceil(duration / (1000 * 60 * 60 * 24)) : 0
  }, [startDate, startTime, endDate, endTime])

  const total = rentalDays && vehicle ? rentalDays * vehicle.pricePerDay : 0
  const selectedPeriodValid = Boolean(
    startDate && startTime && endDate && endTime &&
    new Date(`${endDate}T${endTime}`) > new Date(`${startDate}T${startTime}`),
  )

  const updatePeriod = (setter) => (event) => {
    setter(event.target.value)
    setAvailability(null)
    setNotice('')
  }

  const checkAvailability = async () => {
    if (!selectedPeriodValid) {
      setNotice('Choose a valid pickup and return date and time first.')
      return false
    }
    setChecking(true)
    setNotice('')
    try {
      const result = await api.get(`/vehicles/${vehicleId}/availability`, {
        params: { startDate, startTime, endDate, endTime },
      })
      setAvailability(result.data)
      setNotice(result.data.message)
      return result.data.available
    } catch (error) {
      setAvailability(null)
      setNotice(apiErrorMessage(error, 'Could not check availability. Please try again.'))
      return false
    } finally {
      setChecking(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!selectedPeriodValid) {
      setNotice('Return date and time must be after pickup date and time.')
      return
    }

    setSaving(true)
    setNotice('')
    try {
      await api.post('/bookings', {
        vehicleId: Number(vehicleId),
        startDate,
        startTime,
        endDate,
        endTime,
      })
      navigate('/my-bookings', {
        state: { bookingSuccess: `Your booking request for ${vehicle.name} has been saved and is awaiting seller confirmation.` },
      })
    } catch (error) {
      if (error.response?.status === 409) setAvailability({ available: false })
      setNotice(apiErrorMessage(error, 'Unable to create the booking. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  if (loadError) {
    return <PageNotice title="Vehicle not found" message={loadError} />
  }
  if (!vehicle) {
    return <PageNotice title="Loading vehicle" message="Please wait while we fetch the vehicle details." />
  }

  return (
    <section className="container small-panel">
      <div className="panel-header">
        <span className="eyebrow">Reservation</span>
        <h2>Book {vehicle.name}</h2>
        <p className="booking-intro">Select pickup and return times in India Standard Time (IST). Availability is checked before you book.</p>
      </div>

      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="field-row">
          <label>
            Pickup date
            <input type="date" min={today} value={startDate} onChange={updatePeriod(setStartDate)} required />
          </label>
          <label>
            Pickup time (IST)
            <input type="time" value={startTime} onChange={updatePeriod(setStartTime)} required />
          </label>
          <label>
            Return date
            <input type="date" min={startDate || today} value={endDate} onChange={updatePeriod(setEndDate)} required />
          </label>
          <label>
            Return time (IST)
            <input type="time" value={endTime} onChange={updatePeriod(setEndTime)} required />
          </label>
        </div>

        <button className="btn btn-secondary availability-button" type="button" onClick={checkAvailability} disabled={checking || !selectedPeriodValid}>
          {checking ? 'Checking…' : 'Check availability'}
        </button>

        <div className="booking-summary">
          <div><span>Rate per day</span><strong>{currency.format(vehicle.pricePerDay)}</strong></div>
          <div><span>Billable days</span><strong>{rentalDays || 0}</strong></div>
          <div><span>Estimated total</span><strong>{currency.format(total)}</strong></div>
        </div>

        {notice && <p className={`booking-notice${availability?.available === false ? ' booking-notice-error' : ''}`} role={availability?.available === false ? 'alert' : 'status'}>{notice}</p>}

        <button className="btn btn-primary booking-confirm" type="submit" disabled={saving || availability?.available === false}>
          {saving ? 'Processing…' : 'Confirm booking'}
        </button>
        <p className="booking-support-link">Need help with your booking? <Link to="/support">Contact customer support</Link></p>
      </form>
    </section>
  )
}
