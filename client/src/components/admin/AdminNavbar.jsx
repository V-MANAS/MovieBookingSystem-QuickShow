import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { ShieldCheck, User } from 'lucide-react'

const AdminNavbar = () => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 md:px-10 h-16 bg-[#0c0c10]/90 backdrop-blur-xl border-b border-white/10 shadow-lg">
      <Link to="/" className="flex items-center gap-2 group">
        <img src={assets.logo} alt="QuickShow Admin" className="w-36 h-auto object-contain transition group-hover:scale-105" />
      </Link>

      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
        <ShieldCheck className="w-4 h-4" />
        Admin Control Panel
      </div>
    </header>
  )
}

export default AdminNavbar