import { useEffect, useRef, useState } from 'react'
import { Bot, Loader2, Send, User, Sparkles } from 'lucide-react'
import api from '../api/axios'

const agentColors = {
  email: 'bg-blue-500/15 text-blue-400',
  crm: 'bg-purple-500/15 text-purple-400',
  finance: 'bg-emerald-500/15 text-emerald-400',
  executive: 'bg-orange-500/15 text-orange-400',
  support: 'bg-cyan-500/15 text-cyan-400',
  unknown: 'bg-gray-600/20 text-gray-400',
}

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hello! I am your AI Employee. I can help you manage contacts, leads, invoices, tasks, and send emails. How can I help you today?',
      agent: 'executive',
    },
  ])
  const [input, setInput] = useState('')
  const [conversationId, setConversationId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')
    setError('')
    setLoading(true)

    try {
      const { data } = await api.post('/api/v1/conversations/chat', {
        message: text,
        conversation_id: conversationId,
      })
      setConversationId(data.conversation_id)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response, agent: data.agent_used },
      ])
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get a response. Please try again.')
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I ran into an error processing your request. Please try again.',
          agent: 'support',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Assistant</h1>
          <p className="mt-1 text-sm text-gray-400">
            Chat with your AI employees across email, CRM, finance, and more
          </p>
        </div>
        {conversationId && (
          <span className="hidden rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-400 ring-1 ring-gray-700 sm:block">
            Conversation: {conversationId.slice(0, 8)}...
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-hidden rounded-xl bg-gray-800 shadow-lg ring-1 ring-gray-700">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
            >
              {msg.role === 'assistant' && (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600">
                  <Bot size={16} className="text-white" />
                </div>
              )}
              <div className={`max-w-[85%] sm:max-w-[70%]`}>
                {msg.role === 'assistant' && msg.agent && (
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        agentColors[msg.agent] || agentColors.unknown
                      }`}
                    >
                      <Sparkles size={11} />
                      {msg.agent} agent
                    </span>
                  </div>
                )}
                <div
                  className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-relaxed shadow ${
                    msg.role === 'user'
                      ? 'rounded-br-md bg-blue-600 text-white'
                      : 'rounded-bl-md bg-gray-700 text-gray-100'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-600">
                  <User size={16} className="text-white" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600">
                <Bot size={16} className="text-white" />
              </div>
              <div className="rounded-2xl rounded-bl-md bg-gray-700 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Loader2 size={15} className="animate-spin text-blue-400" />
                  AI is thinking...
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && (
          <div className="border-t border-gray-700 bg-red-900/30 px-4 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-3 border-t border-gray-700 p-3 sm:p-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your AI employee anything..."
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-600 bg-gray-700 px-4 py-2.5 text-sm text-white placeholder-gray-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  )
}
