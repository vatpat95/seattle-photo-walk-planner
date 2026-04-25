import { useState } from 'react';

const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY;

export default function FeedbackButton() {
  const [open, setOpen]     = useState(false);
  const [status, setStatus] = useState('idle');
  const [form, setForm]     = useState({ name: '', email: '', message: '' });

  if (!WEB3FORMS_KEY) return null;

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: 'Seattle Photo Walk Planner — Feedback',
          ...form,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setForm({ name: '', email: '', message: '' });
        setTimeout(() => { setOpen(false); setStatus('idle'); }, 3000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      {/* Floating trigger — clears BottomNav on mobile */}
      <button
        onClick={() => { setOpen(true); setStatus('idle'); }}
        className="fixed bottom-24 sm:bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full
                   bg-gold-dim border border-gold/30 text-gold text-sm font-medium
                   hover:bg-gold/20 transition-all shadow-lg backdrop-blur-sm"
      >
        <span>💬</span> Feedback
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full max-w-md rounded-2xl bg-bg-card border border-border p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-text-primary font-semibold text-base">Share your feedback</h2>
              <button onClick={() => setOpen(false)}
                className="text-text-muted hover:text-text-primary text-xl leading-none transition-colors">×</button>
            </div>

            {status === 'success' ? (
              <div className="text-center py-8 space-y-2">
                <p className="text-3xl">✅</p>
                <p className="text-text-primary font-medium">Thanks for your feedback!</p>
                <p className="text-text-muted text-sm">This will close automatically.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-text-secondary mb-1.5">Name</label>
                  <input
                    type="text" name="name" value={form.name} onChange={handleChange}
                    required placeholder="Your name"
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-faint focus:outline-none focus:border-gold/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1.5">Email</label>
                  <input
                    type="email" name="email" value={form.email} onChange={handleChange}
                    required placeholder="your@email.com"
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-faint focus:outline-none focus:border-gold/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-1.5">Message</label>
                  <textarea
                    name="message" value={form.message} onChange={handleChange}
                    required rows={4} placeholder="What would you like to improve or share?"
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-faint focus:outline-none focus:border-gold/40 transition-colors resize-none"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-red-500 text-xs">Something went wrong — please try again.</p>
                )}

                <button
                  type="submit" disabled={status === 'submitting'}
                  className="w-full py-2.5 rounded-xl bg-gold-dim border border-gold/30 text-gold text-sm font-medium hover:bg-gold/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? 'Sending…' : 'Send Feedback'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
