import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { currency, defaultVehicleImage } from '../data/vehicleData.js'
import { PageNotice } from '../components/PageNotice.jsx'
import { api, apiErrorMessage, vehicleImageUrl } from '../services/api.js'

export function VehicleDetailsPage() {
  const { vehicleId } = useParams()
  const [vehicle, setVehicle] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const loadVehicle = async () => {
      try {
        const result = await api.get(`/vehicles/${vehicleId}`)
        setVehicle(result.data)
      } catch (requestError) {
        setError(apiErrorMessage(requestError, 'Vehicle could not be loaded.'))
      }
    }

    loadVehicle()
  }, [vehicleId])

  if (error) {
    return <PageNotice title="Vehicle unavailable" message={error} />
  }

  if (!vehicle) {
    return <PageNotice title="Loading vehicle details" message="Please wait while we fetch the listing." />
  }

  return (
    <section className="container detail-section">
      <div className="detail-hero">
        <img src={vehicleImageUrl(vehicle.imagePath, defaultVehicleImage)} alt={vehicle.name} />
      </div>
      <div className="detail-panel">
        <span className="eyebrow">{vehicle.category}</span>
        <h2>{vehicle.name}</h2>
        <p className="detail-price">{currency.format(vehicle.pricePerDay || 0)} / day</p>
        <ul className="spec-list">
          <li><strong>Brand:</strong> {vehicle.brand}</li>
          <li><strong>Model:</strong> {vehicle.model}</li>
          <li><strong>Year:</strong> {vehicle.year}</li>
          <li><strong>Fuel:</strong> {vehicle.fuelType}</li>
          <li><strong>Transmission:</strong> {vehicle.transmission}</li>
          <li><strong>Seats:</strong> {vehicle.seatingCapacity}</li>
          <li><strong>Location:</strong> {vehicle.location}</li>
        </ul>
        <p>{vehicle.description}</p>
        <div className="cta-row detail-actions">
          <button className="btn btn-primary" type="button" onClick={() => navigate(`/booking/${vehicle.id}`)}>Book now</button>
          <Link className="btn btn-secondary" to="/vehicles">Back to fleet</Link>
        </div>
      </div>
    </section>
  )
}
