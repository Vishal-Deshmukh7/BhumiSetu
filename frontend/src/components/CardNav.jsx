import { useLayoutEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import './CardNav.css'

const navGroups = [
  {
    label: 'My Land',
    bgColor: '#0D9488',
    textColor: '#fff',
    links: [
      { label: 'Dashboard', href: '/landowner/dashboard', ariaLabel: 'Go to dashboard' },
      { label: 'My Parcels', href: '/landowner/parcels', ariaLabel: 'View land parcels' },
    ],
  },
  {
    label: 'Track',
    bgColor: '#0F172A',
    textColor: '#fff',
    links: [
      { label: 'Proposals', href: '/landowner/proposals', ariaLabel: 'Compare proposals' },
      { label: 'Disputes', href: '/landowner/disputes', ariaLabel: 'Track disputes' },
    ],
  },
  {
    label: 'Resources',
    bgColor: '#1E293B',
    textColor: '#fff',
    links: [
      { label: 'Documents', href: '/landowner/documents', ariaLabel: 'Document vault' },
      { label: 'Contacts', href: '/landowner/contacts', ariaLabel: 'Contact departments' },
    ],
  },
]

function CardNav({ className = '' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const navRef = useRef(null)
  const cardsRef = useRef([])
  const tlRef = useRef(null)

  const calculateHeight = () => {
    const navEl = navRef.current
    if (!navEl) return 260

    const isMobile = window.matchMedia('(max-width: 768px)').matches
    if (isMobile) {
      const contentEl = navEl.querySelector('.card-nav-content')
      if (contentEl) {
        const wasVisible = contentEl.style.visibility
        const wasPointerEvents = contentEl.style.pointerEvents
        const wasPosition = contentEl.style.position
        const wasHeight = contentEl.style.height

        contentEl.style.visibility = 'visible'
        contentEl.style.pointerEvents = 'auto'
        contentEl.style.position = 'static'
        contentEl.style.height = 'auto'
        contentEl.offsetHeight

        const topBar = 60
        const padding = 16
        const contentHeight = contentEl.scrollHeight

        contentEl.style.visibility = wasVisible
        contentEl.style.pointerEvents = wasPointerEvents
        contentEl.style.position = wasPosition
        contentEl.style.height = wasHeight

        return topBar + contentHeight + padding
      }
    }
    return 260
  }

  const createTimeline = () => {
    const navEl = navRef.current
    if (!navEl) return null

    gsap.set(navEl, { height: 60, overflow: 'hidden' })
    gsap.set(cardsRef.current, { y: 50, opacity: 0 })

    const tl = gsap.timeline({ paused: true })
    tl.to(navEl, { height: calculateHeight, duration: 0.4, ease: 'power3.out' })
    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out', stagger: 0.08 }, '-=0.1')
    return tl
  }

  useLayoutEffect(() => {
    const tl = createTimeline()
    tlRef.current = tl
    return () => { tl?.kill(); tlRef.current = null }
  }, [])

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return
      if (isExpanded) {
        const newHeight = calculateHeight()
        gsap.set(navRef.current, { height: newHeight })
        tlRef.current.kill()
        const newTl = createTimeline()
        if (newTl) { newTl.progress(1); tlRef.current = newTl }
      } else {
        tlRef.current.kill()
        const newTl = createTimeline()
        if (newTl) { tlRef.current = newTl }
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isExpanded])

  const toggleMenu = () => {
    const tl = tlRef.current
    if (!tl) return
    if (!isExpanded) {
      setIsHamburgerOpen(true)
      setIsExpanded(true)
      tl.play(0)
    } else {
      setIsHamburgerOpen(false)
      tl.eventCallback('onReverseComplete', () => setIsExpanded(false))
      tl.reverse()
    }
  }

  const handleNav = (href) => {
    navigate(href)
    setIsHamburgerOpen(false)
    tlRef.current?.reverse()
  }

  const setCardRef = (i) => (el) => { if (el) cardsRef.current[i] = el }

  return (
    <div className={`card-nav-container ${className}`}>
      <nav ref={navRef} className={`card-nav ${isExpanded ? 'open' : ''}`} style={{ backgroundColor: '#FFFFFF' }}>
        <div className="card-nav-top">
          <div
            className={`hamburger-menu ${isHamburgerOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMenu() } }}
            role="button"
            aria-label={isExpanded ? 'Close menu' : 'Open menu'}
            aria-expanded={isExpanded}
            tabIndex={0}
            style={{ color: '#0F172A' }}
          >
            <div className="hamburger-line" />
            <div className="hamburger-line" />
          </div>

          <div className="logo-container">
            <div className="card-nav-logo-mark">BS</div>
            <span className="card-nav-logo-text">BHUMISETU</span>
          </div>

          <div className="card-nav-desktop-links">
            {navGroups.map((group) => (
              group.links.map((link) => (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => navigate(link.href)}
                  className={`card-nav-desktop-link ${location.pathname === link.href ? 'active' : ''}`}
                >
                  {link.label}
                </button>
              ))
            ))}
          </div>
        </div>

        <div className="card-nav-content" aria-hidden={!isExpanded}>
          {navGroups.map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card"
              ref={setCardRef(idx)}
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
            >
              <div className="nav-card-label">{item.label}</div>
              <div className="nav-card-links">
                {item.links?.map((lnk, i) => (
                  <button
                    key={`${lnk.label}-${i}`}
                    type="button"
                    className="nav-card-link"
                    onClick={() => handleNav(lnk.href)}
                    aria-label={lnk.ariaLabel}
                  >
                    <span className="nav-card-link-arrow" aria-hidden="true">&#8599;</span>
                    {lnk.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default CardNav
