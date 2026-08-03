import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const Loading = () => {
  const { nextUrl } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (nextUrl) {
      const search = window.location.search || ''
      const targetPath = '/' + nextUrl + search
      const timer = setTimeout(() => {
        navigate(targetPath, { replace: true })
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [nextUrl, navigate])

  return (
    <div className="flex flex-col justify-center items-center h-[80vh] gap-4">
      <div className="animate-spin rounded-full h-14 w-14 border-4 border-white/10 border-t-primary shadow-xl shadow-primary/30" />
      <p className="text-sm font-semibold text-gray-400">Processing transaction & preparing pass...</p>
    </div>
  )
}

export default Loading