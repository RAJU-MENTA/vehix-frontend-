import { Link } from 'react-router-dom'
import { currency, defaultVehicleImage } from '../data/vehicleData.js'
import { vehicleImageUrl } from '../services/api.js'

export function VehicleCard({ vehicle, showActions = false }) {
  return (
    <article className="vehicle-card">
      <img src={vehicleImageUrl(vehicle.imagePath, defaultVehicleImage)} alt={vehicle.name} />
      <div className="vehicle-content">
        <div className="vehicle-head">
          <div>
            <span className="eyebrow small-eyebrow">{vehicle.category}</span>
            <h3>{vehicle.name}</h3>
          </div>
          <strong>{currency.format(vehicle.pricePerDay || 0)}</strong>
        </div>
        <p>{vehicle.location}</p>
        <div className="vehicle-meta">
          <span>{vehicle.brand}</span>
          <span>{vehicle.transmission}</span>
          <span>{vehicle.seatingCapacity} seats</span>
        </div>
        <div className="card-actions">
          {vehicle.available && <Link className="btn btn-secondary" to={`/vehicles/${vehicle.id}`}>View details</Link>}
          {showActions && <button type="button" className="btn btn-primary">Edit</button>}
        </div>
      </div>
    </article>
  )
}
