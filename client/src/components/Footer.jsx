import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'
import { Film, Heart, Shield, Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="relative mt-20 pt-16 pb-8 border-t border-white/10 bg-[#060608] text-gray-400">
      <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 xl:px-36">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="md:col-span-5 flex flex-col items-start gap-4">
            <Link to="/" onClick={() => window.scrollTo(0, 0)}>
              <img alt="QuickShow Logo" className="h-9 w-auto" src={assets.logo} />
            </Link>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-sm">
              QuickShow is your ultimate destination for instant movie ticket bookings, trailer premieres, and cinema experiences. Seamlessly reserve seats in top theaters near you.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <img src={assets.googlePlay} alt="Google Play Store" className="h-9 w-auto hover:opacity-80 transition cursor-pointer" />
              <img src={assets.appStore} alt="Apple App Store" className="h-9 w-auto hover:opacity-80 transition cursor-pointer" />
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-3">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/" onClick={() => window.scrollTo(0, 0)} className="hover:text-primary transition">Home</Link>
              </li>
              <li>
                <Link to="/movies" onClick={() => window.scrollTo(0, 0)} className="hover:text-primary transition">Movies</Link>
              </li>
              <li>
                <Link to="/releases" onClick={() => window.scrollTo(0, 0)} className="hover:text-primary transition">Releases</Link>
              </li>
              <li>
                <Link to="/favorite" onClick={() => window.scrollTo(0, 0)} className="hover:text-primary transition">Favorites</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-4">
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Get In Touch</h4>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span>+1 (800) 234-5678</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span>support@quickshow.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>Los Angeles, CA & Mumbai, MH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} QuickShow Inc. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-gray-300 transition">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition">Terms of Service</a>
            <a href="#" className="hover:text-gray-300 transition">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer