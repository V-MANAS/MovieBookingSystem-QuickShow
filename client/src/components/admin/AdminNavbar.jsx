import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { ShieldCheck, ArrowLeft } from 'lucide-react'

const AdminNavbar = () => {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-10 h-16 bg-[#0c0c10]/90 backdrop-blur-xl border-b border-white/10 shadow-lg">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2 group cursor-pointer">
        <img src={assets.logo} alt="QuickShow Admin" className="w-32 sm:w-36 h-auto object-contain transition group-hover:scale-105" />
      </Link>

      {/* Right Controls: Badge & Back to App Button */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span className="hidden sm:inline">Admin Control Panel</span>
          <span className="sm:hidden">Admin</span>
        </div>

        <button
          onClick={() => {
            navigate('/')
            window.scrollTo(0, 0)
          }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-gray-200 hover:text-white text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-4 h-4 text-primary" />
          <span>Back to App</span>
        </button>
      </div>
    </header>
  )
}

export default AdminNavbar