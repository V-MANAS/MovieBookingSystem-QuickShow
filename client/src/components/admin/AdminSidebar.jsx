import React from 'react'
import { LayoutDashboard, ListCollapse, List, PlusSquare, Shield } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { assets } from '../../assets/assets'

const AdminSidebar = () => {
  const user = {
    firstName: 'Admin',
    lastName: 'User',
    imageUrl: assets.profile,
  }

  const adminNavLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Add Shows', path: '/admin/add-shows', icon: PlusSquare },
    { name: 'List Shows', path: '/admin/list-shows', icon: List },
    { name: 'List Bookings', path: '/admin/list-bookings', icon: ListCollapse },
  ]

  return (
    <aside className="h-[calc(100vh-64px)] flex flex-col items-center pt-8 max-w-16 md:max-w-64 w-full bg-[#09090C] border-r border-white/10 text-sm shrink-0 select-none">
      {/* Admin Profile */}
      <div className="flex flex-col items-center mb-6 px-4 text-center">
        <div className="relative">
          <img
            className="h-10 md:h-14 w-10 md:w-14 rounded-full border-2 border-primary/40 object-cover shadow-lg"
            src={user.imageUrl}
            alt="Admin Profile"
          />
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#09090C]" />
        </div>
        <p className="mt-2.5 font-bold text-sm text-white max-md:hidden tracking-tight">
          {user.firstName} {user.lastName}
        </p>
        <span className="text-[10px] text-primary font-semibold uppercase tracking-wider max-md:hidden">Super Admin</span>
      </div>

      {/* Nav Links */}
      <nav className="w-full space-y-1.5 px-2 md:px-4">
        {adminNavLinks.map((link, index) => (
          <NavLink
            key={index}
            to={link.path}
            end
            className={({ isActive }) =>
              `relative flex items-center max-md:justify-center gap-3 w-full py-3 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white font-semibold shadow-lg shadow-primary/25'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
              }`
            }
          >
            <link.icon className="w-5 h-5 shrink-0" />
            <p className="max-md:hidden text-xs sm:text-sm">{link.name}</p>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default AdminSidebar