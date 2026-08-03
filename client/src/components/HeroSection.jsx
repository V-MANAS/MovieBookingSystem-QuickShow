import React from 'react'
import { assets } from '../assets/assets'
import { Calendar, Clock, ArrowRight, Sparkles, Film, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const HeroSection = () => {
  const navigate = useNavigate()

  return (
    <div className="relative w-full min-h-screen flex items-center justify-start bg-[url('/backgroundImage.png')] bg-cover bg-center overflow-hidden pt-24 pb-16 px-6 sm:px-12 md:px-20 lg:px-32">
      {/* Dark Ambient Vignette Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/60 to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#09090B] via-[#09090B]/70 to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 max-w-3xl flex flex-col items-start gap-5">
        {/* Featured Tag & Marvel Badge */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            Featured Show
          </span>
          <img 
            src={assets.marvelLogo} 
            alt="Marvel Studios" 
            className="h-7 sm:h-8 w-auto object-contain opacity-90" 
          />
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] text-balance drop-shadow-lg">
          Guardians <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400">
            of the Galaxy
          </span>
        </h1>

        {/* Metadata Strip */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300 font-medium">
          <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/10 backdrop-blur-md">
            Action • Adventure • Sci-Fi
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 border border-white/10 backdrop-blur-md">
            <Calendar className="w-4 h-4 text-primary" />
            2018
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 border border-white/10 backdrop-blur-md">
            <Clock className="w-4 h-4 text-primary" />
            2h 18m
          </span>
        </div>

        {/* Description Paragraph */}
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-xl line-clamp-3">
          In a post-apocalyptic universe where cities ride on wheels and consume each other to survive, 
          a band of unlikely heroes team up to stop an interstellar conspiracy and save the cosmos.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-2 flex-wrap">
          <button
            onClick={() => {
              navigate('/movies')
              window.scrollTo(0, 0)
            }}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-primary hover:bg-primary-dull text-white text-sm font-bold rounded-full shadow-xl shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group"
          >
            <span>Explore Movies</span>
            <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default HeroSection