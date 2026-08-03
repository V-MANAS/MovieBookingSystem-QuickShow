import React, { useState } from 'react'
import BlurCircle from './BlurCircle'
import { dummyTrailers } from '../assets/assets'
import { PlayCircle, Film, Sparkles } from 'lucide-react'

const TrailerSection = () => {
  const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0])

  // Extract video ID safely
  const videoId = currentTrailer?.videoUrl ? currentTrailer.videoUrl.split('v=')[1] : ''

  return (
    <section className="relative px-6 md:px-16 lg:px-24 xl:px-36 py-16 overflow-hidden max-w-7xl mx-auto">
      <BlurCircle top="-100px" right="-100px" />

      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Official Trailers</h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Watch exclusive previews of upcoming blockbusters</p>
          </div>
        </div>
      </div>

      {/* Main Video Frame */}
      <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden glass-panel border border-white/15 shadow-2xl shadow-black/80">
        <div className="aspect-video w-full bg-black relative">
          {videoId ? (
            <iframe
              className="w-full h-full rounded-2xl"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
              title="YouTube trailer player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Trailer video unavailable
            </div>
          )}
        </div>
      </div>

      {/* Trailer Thumbnails Strip */}
      <div className="mt-8 max-w-3xl mx-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 text-center">Select Trailer</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {dummyTrailers.map((trailer, index) => {
            const isSelected = currentTrailer.image === trailer.image
            return (
              <div
                key={index}
                onClick={() => setCurrentTrailer(trailer)}
                className={`relative group rounded-xl overflow-hidden cursor-pointer transition-all duration-300 aspect-video border ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/40 scale-105 shadow-lg shadow-primary/20'
                    : 'border-white/10 opacity-70 hover:opacity-100 hover:scale-102 hover:border-white/30'
                }`}
              >
                <img
                  src={trailer.image}
                  alt="trailer thumbnail"
                  className="w-full h-full object-cover brightness-75 group-hover:brightness-90 transition"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-center justify-center">
                  <PlayCircle
                    className={`w-8 h-8 transition-transform duration-300 ${
                      isSelected ? 'text-primary scale-110 fill-primary/20' : 'text-white/80 group-hover:scale-110'
                    }`}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default TrailerSection
