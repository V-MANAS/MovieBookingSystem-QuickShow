import React from 'react'
import { Film, Search, Ticket, Heart, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const EmptyState = ({
  icon: Icon = Film,
  title = "No Movies Found",
  description = "We couldn't find any items matching your request right now. Please check back later!",
  actionText = "Explore Movies",
  actionLink = "/movies",
  onActionClick
}) => {
  const navigate = useNavigate()

  const handleAction = () => {
    if (onActionClick) {
      onActionClick()
    } else if (actionLink) {
      navigate(actionLink)
      window.scrollTo(0, 0)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 glass-panel rounded-3xl border border-white/10 max-w-lg mx-auto my-12">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5 glow-primary">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">{description}</p>
      {actionText && (
        <button
          onClick={handleAction}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dull text-white text-sm font-semibold rounded-full shadow-lg shadow-primary/25 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 rotate-180" />
          {actionText}
        </button>
      )}
    </div>
  )
}

export default EmptyState
