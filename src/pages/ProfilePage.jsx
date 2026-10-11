export function ProfilePage({ user }) {
  return (
    <section className="container small-panel">
      <div className="panel-header">
        <span className="eyebrow">Account</span>
        <h2>Profile</h2>
      </div>
      <div className="profile-card">
        <dl>
          <div><dt>Name</dt><dd>{user?.fullName}</dd></div>
          <div><dt>Email</dt><dd>{user?.email}</dd></div>
          <div><dt>Role</dt><dd>{user?.role}</dd></div>
        </dl>
      </div>
    </section>
  )
}
