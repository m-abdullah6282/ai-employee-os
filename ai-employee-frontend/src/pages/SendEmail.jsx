import { useState } from 'react'
import { CheckCircle2, Loader2, Mail, Send, XCircle } from 'lucide-react'
import api from '../api/axios'

const emptyForm = { to_email: '', to_name: '', subject: '', body: '' }

export default function SendEmail() {
  const [form, setForm] = useState(emptyForm)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setResult(null)
    try {
      const { data } = await api.post('/api/v1/integrations/send-email', form)
      setResult({ success: data.success, message: data.message || data.error || 'Email sent successfully.' })
      if (data.success) setForm(emptyForm)
    } catch (err) {
      setResult({
        success: false,
        message: err.response?.data?.detail || 'Failed to send email. Please try again.',
      })
    } finally {
      setSending(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-gray-600 bg-gray-700 px-3.5 py-2.5 text-sm text-white placeholder-gray-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30'

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Send Email</h1>
        <p className="mt-1 text-sm text-gray-400">Send an email directly from your workspace</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-xl bg-gray-800 p-6 shadow-lg ring-1 ring-gray-700 sm:p-8">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Recipient Email *</label>
              <input
                type="email"
                name="to_email"
                required
                value={form.to_email}
                onChange={handleChange}
                placeholder="client@company.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Recipient Name</label>
              <input
                name="to_name"
                value={form.to_name}
                onChange={handleChange}
                placeholder="Jane Doe"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Subject *</label>
            <input
              name="subject"
              required
              value={form.subject}
              onChange={handleChange}
              placeholder="Subject line"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Body *</label>
            <textarea
              name="body"
              required
              rows="6"
              value={form.body}
              onChange={handleChange}
              placeholder="Write your email message here..."
              className={inputClass}
            />
          </div>

          {result && (
            <div
              className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
                result.success
                  ? 'border-emerald-800 bg-emerald-900/40 text-emerald-300'
                  : 'border-red-800 bg-red-900/40 text-red-300'
              }`}
            >
              {result.success ? (
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              ) : (
                <XCircle size={18} className="mt-0.5 shrink-0" />
              )}
              <span>{result.message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {sending ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </form>

      <div className="flex items-center gap-3 rounded-xl bg-gray-800/60 px-5 py-4 ring-1 ring-gray-700">
        <Mail size={18} className="shrink-0 text-gray-500" />
        <p className="text-xs leading-relaxed text-gray-400">
          Emails are sent through your connected email integration. Make sure your SMTP/Gmail integration
          is configured in the backend before sending.
        </p>
      </div>
    </div>
  )
}
