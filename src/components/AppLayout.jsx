import { Link, NavLink } from 'react-router-dom'

export function AppLayout({ user, onLogout, children }) {
  return (
    <>
      <header className="topbar">
        <div className="container nav-wrap">
          <Link className="brand" to="/">
            <span className="brand-mark">V</span>
            VEHIX
          </Link>
          <nav className="main-nav" aria-label="Main navigation">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/vehicles">Vehicles</NavLink>
            <NavLink to="/support">Support</NavLink>
            {user ? (
              <>
                <NavLink to="/my-bookings">My Bookings</NavLink>
                <NavLink to="/profile">Profile</NavLink>
                {['SELLER', 'ADMIN'].includes(user.role) && (
                  <NavLink to="/seller-dashboard">Seller Dashboard</NavLink>
                )}
                {user.role === 'ADMIN' && <NavLink to="/admin-dashboard">Admin</NavLink>}
              </>
            ) : null}
          </nav>

          <div className="nav-actions">
            {user ? (
              <>
                <span className="user-pill">{user.fullName}</span>
                <button className="btn btn-secondary" type="button" onClick={onLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link className="btn btn-secondary" to="/login">Login</Link>
                <Link className="btn btn-primary" to="/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div className="container footer-row">
          <div>
            <h3>VEHIX</h3>
            <p>Premium rentals for business, leisure, and executive travel.</p>
          </div>
          <div>
            <ul>
              <li><Link to="/vehicles">Fleet</Link></li>
              <li><Link to="/seller-dashboard">Seller hub</Link></li>
              <li><Link to="/support">Customer support</Link></li>
              <li><Link to="/admin-dashboard">Admin</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  )
}
