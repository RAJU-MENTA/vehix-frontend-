import { useState } from 'react'
import { api, apiErrorMessage } from '../services/api.js'

const supportTopics = ['Booking and availability', 'Changing or cancelling', 'Payments and pricing', 'Listing a vehicle', 'Other']

export function SupportPage() {
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState(null)

  const submitRequest = async (event) => {
    event.preventDefault()
    const formElement = event.currentTarget
    const formData = new FormData(formElement)
    setSubmitting(true)
    setNotice(null)

    try {
      const result = await api.post('/support/contact', {
        fullName: formData.get('fullName').toString().trim(),
        email: formData.get('email').toString().trim(),
        topic: formData.get('topic').toString(),
        subject: formData.get('subject').toString().trim(),
        message: formData.get('message').toString().trim(),
      })
      formElement.reset()
      setNotice({ type: 'success', text: `Your support request is saved. Keep ticket #${result.data.id} for reference.` })
    } catch (error) {
      setNotice({ type: 'error', text: apiErrorMessage(error, 'We could not save your request. Please try again.') })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="container section-block support-page">
      <header className="support-heading">
        <span className="eyebrow">Here to help</span>
        <h1>A smoother ride starts with good support.</h1>
        <p>Find quick answers below, or send our team a support request and keep the ticket number for follow-up.</p>
      </header>

      <div className="support-layout">
        <div className="support-faq">
          <span className="eyebrow">Quick answers</span>
          <h2>Frequently asked questions</h2>
          <details>
            <summary>How do I book a vehicle?</summary>
            <p>Choose a vehicle, select pickup and return dates and times, check availability, and confirm your request.</p>
          </details>
          <details>
            <summary>What happens if a vehicle is already booked?</summary>
            <p>The availability check will let you know before you confirm. Try another time slot or choose a different vehicle.</p>
          </details>
          <details>
            <summary>How is the rental price calculated?</summary>
            <p>Prices are shown in Indian rupees. The estimate uses the vehicle’s daily rate and rounds a partial 24-hour period up to a full day.</p>
          </details>
          <details>
            <summary>How can I list my vehicle?</summary>
            <p>Sign in with a seller account and open Seller Dashboard to add your vehicle details and publish its listing.</p>
          </details>
          <div className="support-note">
            <span aria-hidden="true">✳</span>
            <p><strong>Still need a hand?</strong><br />Send us the details using the form. A reference number is provided when your request is saved.</p>
          </div>
        </div>

        <form className="support-form" onSubmit={submitRequest}>
          <span className="eyebrow">Contact support</span>
          <h2>How can we help?</h2>
          <label>Your name<input name="fullName" required maxLength="120" autoComplete="name" placeholder="Full name" /></label>
          <label>Email address<input name="email" required type="email" maxLength="254" autoComplete="email" placeholder="you@example.com" /></label>
          <label>What is this about?<select name="topic" required defaultValue=""><option value="" disabled>Select a topic</option>{supportTopics.map((topic) => <option key={topic}>{topic}</option>)}</select></label>
          <label>Subject<input name="subject" required maxLength="160" placeholder="A short summary" /></label>
          <label>Tell us a little more<textarea name="message" required maxLength="3000" rows="5" placeholder="Include your booking or vehicle details if they’re relevant." /></label>
          {notice && <p className={`support-notice support-notice-${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>{notice.text}</p>}
          <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Send support request'}</button>
          <small>Your message and contact details are saved as a support ticket for the VEHIX team.</small>
        </form>
      </div>
    </section>
  )
}
