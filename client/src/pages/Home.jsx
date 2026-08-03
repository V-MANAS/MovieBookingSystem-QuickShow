import React from 'react'
import HeroSection from '../components/HeroSection'
import FeaturesSection from '../components/FeaturesSection'
import TrailerSection from '../components/TrailerSection'

const Home = () => {
  return (
    <main className="min-h-screen bg-[#09090B] overflow-hidden">
      <HeroSection />
      <FeaturesSection />
      <TrailerSection />
    </main>
  )
}

export default Home