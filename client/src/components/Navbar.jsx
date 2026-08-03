import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { assets } from '../assets/assets'
import { Menu, Search, TicketPlus, X, Heart, Film, Clapperboard, Sparkles, Shield } from 'lucide-react'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { useAppContext } from '../context/AppContext'
import SearchModal from './SearchModal'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const { user } = useUser()
  const { openSignIn } = useClerk()
  const navigate = useNavigate()
  const location = useLocation()
  const { favoriteMovies, isAdmin } = useAppContext()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Movies', path: '/movies' },
    { name: 'Releases', path: '/releases' },
    ...(favoriteMovies && favoriteMovies.length > 0
      ? [{ name: 'Favorites', path: '/favorite', badge: favoriteMovies.length }]
      : []),
  ]

  const isActiveRoute = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'py-3.5 bg-[#09090B]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl'
            : 'py-5 bg-gradient-to-b from-black/80 via-black/40 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => window.scrollTo(0, 0)}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <img
              src={assets.logo}
              alt="QuickShow"
              className="h-9 sm:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation Pill */}
          <nav className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md shadow-inner">
            {navLinks.map((link) => {
              const active = isActiveRoute(link.path)
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => window.scrollTo(0, 0)}
                  className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'text-white bg-primary shadow-md shadow-primary/30 font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.name}
                  {link.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      active ? 'bg-white text-primary' : 'bg-primary text-white'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right Section: Search & Auth */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Icon Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search movies"
              className="p-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-gray-300 hover:text-white transition-all duration-200 cursor-pointer group"
            >
              <Search className="w-4.5 h-4.5 group-hover:scale-110 transition-transform" />
            </button>

            {/* Auth Button or Clerk User Dropdown */}
            {!user ? (
              <button
                onClick={openSignIn}
                className="relative inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dull rounded-full shadow-lg shadow-primary/30 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Sign In
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'w-9 h-9 border-2 border-primary/50 hover:border-primary transition',
                    }
                  }}
                >
                  <UserButton.MenuItems>
                    <UserButton.Action
                      label="My Bookings"
                      labelIcon={<TicketPlus width={16} className="text-primary" />}
                      onClick={() => navigate('/my-bookings')}
                    />
                    {isAdmin && (
                      <UserButton.Action
                        label="Admin Panel"
                        labelIcon={<Shield width={16} className="text-primary" />}
                        onClick={() => navigate('/admin')}
                      />
                    )}
                  </UserButton.MenuItems>
                </UserButton>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl bg-white/[0.06] border border-white/10 text-gray-200 hover:text-white transition cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="md:hidden fixed inset-x-0 top-[60px] bg-[#09090B]/95 backdrop-blur-2xl border-b border-white/10 py-6 px-6 shadow-2xl flex flex-col gap-3 animate-in slide-in-from-top duration-300">
            {navLinks.map((link) => {
              const active = isActiveRoute(link.path)
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => {
                    window.scrollTo(0, 0)
                    setIsOpen(false)
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition ${
                    active
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="bg-primary-dull text-white text-xs px-2 py-0.5 rounded-full">
                      {link.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </header>

      {/* Global Live Search Overlay */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}

export default Navbar