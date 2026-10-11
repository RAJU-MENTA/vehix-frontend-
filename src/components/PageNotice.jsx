export function PageNotice({ title, message }) {
  return (
    <section className="container section-block">
      <div className="empty-state">
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
    </section>
  )
}
