import { useEffect, useState } from 'react'
import { API_BASE } from '../../config'

function ContactCard({ contact, delay = 0 }) {
  return (
    <div className={`lo-card p-5 hover:border-lo-teal/30 transition-all lo-animate-in lo-animate-delay-${Math.min(delay, 5)}`}>
      <div className="flex items-start gap-3 mb-4">
        <div className="h-10 w-10 rounded-lg bg-lo-navy flex items-center justify-center shrink-0">
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-bold text-lo-navy">{contact.officeName}</div>
          <div className="text-[10px] text-lo-textMuted uppercase tracking-wider mt-0.5">{contact.department}</div>
        </div>
      </div>
      <div className="space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <svg className="h-4 w-4 text-lo-textMuted shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
          <span className="text-lo-textSecondary break-words">{contact.address}</span>
        </div>
        {contact.phone && (
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-lo-textMuted shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
            <a href={`tel:${contact.phone}`} className="text-lo-teal hover:underline">{contact.phone}</a>
          </div>
        )}
        {contact.email && (
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-lo-textMuted shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
            <a href={`mailto:${contact.email}`} className="text-lo-teal hover:underline break-all">{contact.email}</a>
          </div>
        )}
        {contact.officeHours && (
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-lo-textMuted shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-lo-textSecondary">{contact.officeHours}</span>
          </div>
        )}
      </div>
      <div className="mt-4 p-2 rounded-lg bg-gray-50 text-[10px] text-lo-textMuted">
        Case Reference: {contact.caseReference}
      </div>
      {contact.isSynthetic && (
        <div className="mt-2 text-[9px] text-lo-textMuted italic">Synthetic demo data — not real contact information</div>
      )}
    </div>
  )
}

export default function LandownerContactsPage() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/landowner/contacts`)
      .then((res) => res.json())
      .then((data) => setContacts(data.contacts || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="h-8 w-8 border-2 border-lo-teal border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <header className="lo-animate-in">
        <div className="text-xs font-semibold uppercase tracking-wider text-lo-teal mb-2">Support</div>
        <h1 className="text-2xl font-bold text-lo-navy md:text-3xl">Contact Departments</h1>
        <p className="text-sm text-lo-textSecondary mt-1">Relevant offices and authorities for your land acquisition case.</p>
      </header>

      <div className="lo-card p-5 border-lo-amber/30 bg-lo-amberLight/20 lo-animate-in lo-animate-delay-1">
        <div className="flex items-start gap-3">
          <svg className="h-5 w-5 text-lo-amber shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
          <div className="text-xs text-lo-navy leading-relaxed">
            <span className="font-semibold">Who do I contact?</span> The offices below are associated with your land acquisition case. For questions about compensation, contact the District Collector office. For project-specific queries, contact the implementing authority.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contacts.map((contact, i) => (
          <ContactCard key={contact.contactId} contact={contact} delay={i + 1} />
        ))}
      </div>

      <div className="lo-card p-5 lo-animate-in lo-animate-delay-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-lo-textMuted mb-3">Need Help?</div>
        <div className="text-sm text-lo-textSecondary leading-relaxed">
          For general queries about the land acquisition process, contact the District Land Acquisition Office. For legal assistance, approach the District Legal Services Authority (DLSA). All contact information shown is synthetic demonstration data.
        </div>
      </div>
    </div>
  )
}
