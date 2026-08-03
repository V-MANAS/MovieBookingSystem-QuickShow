import React from 'react'

export const MovieCardSkeleton = () => {
  return (
    <div className="flex flex-col justify-between p-3.5 bg-white/[0.03] border border-white/10 rounded-2xl w-full max-w-[260px] animate-pulse">
      <div className="rounded-xl h-56 w-full bg-white/10 skeleton-shimmer" />
      <div className="h-5 bg-white/10 rounded w-3/4 mt-3 skeleton-shimmer" />
      <div className="h-3 bg-white/10 rounded w-1/2 mt-2 skeleton-shimmer" />
      <div className="flex items-center justify-between mt-5 pb-1">
        <div className="h-8 w-24 bg-white/10 rounded-full skeleton-shimmer" />
        <div className="h-4 w-10 bg-white/10 rounded skeleton-shimmer" />
      </div>
    </div>
  )
}

export const MovieGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 justify-items-center">
      {Array.from({ length: count }).map((_, index) => (
        <MovieCardSkeleton key={index} />
      ))}
    </div>
  )
}

export const MovieDetailsSkeleton = () => {
  return (
    <div className="px-6 md:px-16 lg:px-40 pt-28 md:pt-36 animate-pulse max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <div className="rounded-2xl h-96 w-full md:w-72 bg-white/10 skeleton-shimmer shrink-0" />
        <div className="flex-1 flex flex-col gap-4">
          <div className="h-4 w-20 bg-white/10 rounded skeleton-shimmer" />
          <div className="h-10 w-3/4 bg-white/10 rounded-lg skeleton-shimmer" />
          <div className="h-5 w-32 bg-white/10 rounded skeleton-shimmer" />
          <div className="h-20 w-full bg-white/10 rounded-lg skeleton-shimmer mt-2" />
          <div className="flex gap-4 mt-4">
            <div className="h-11 w-32 bg-white/10 rounded-xl skeleton-shimmer" />
            <div className="h-11 w-36 bg-white/10 rounded-xl skeleton-shimmer" />
          </div>
        </div>
      </div>
    </div>
  )
}

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="w-full space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 bg-white/[0.04] border border-white/5 rounded-xl skeleton-shimmer w-full" />
      ))}
    </div>
  )
}

export default MovieCardSkeleton
