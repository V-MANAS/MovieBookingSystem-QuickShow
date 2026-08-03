import React from 'react'

const Title = ({ text1, text2 }) => {
  return (
    <h1 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
      {text1} <span className="text-primary underline decoration-primary/40 underline-offset-4">{text2}</span>
    </h1>
  )
}

export default Title