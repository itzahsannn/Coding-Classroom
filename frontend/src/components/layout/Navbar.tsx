import { useState } from 'react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { label: 'Courses', href: '#courses' },
    { label: 'Features', href: '#features' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-gray-950/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-brand-500/30 group-hover:shadow-brand-500/50 transition-shadow">
              C
            </div>
            <span className="font-bold text-lg gradient-text">Code Classroom</span>
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="btn-ghost text-sm">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button className="btn-secondary text-sm">Sign In</button>
            <button className="btn-primary text-sm">Get Started</button>
          </div>

          <button
            className="md:hidden btn-ghost p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <div className="space-y-1.5 w-5">
              <span className={`block h-0.5 bg-current transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/10 animate-fade-in">
            <div className="flex flex-col gap-1 mb-4">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} className="btn-ghost text-sm justify-start">
                  {link.label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <button className="btn-secondary text-sm">Sign In</button>
              <button className="btn-primary text-sm">Get Started</button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
