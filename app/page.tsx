import { LandingReadingProgress } from './components/landing/LandingReadingProgress'
import { LandingHeader } from './components/landing/LandingHeader'
import { LandingHero } from './components/landing/LandingHero'
import { LandingTrustBar } from './components/landing/LandingTrustBar'
import { LandingAbout } from './components/landing/LandingAbout'
import { LandingStats } from './components/landing/LandingStats'
import { LandingModules } from './components/landing/LandingModules'
import { LandingHowItWorks } from './components/landing/LandingHowItWorks'
import { LandingTestimonials } from './components/landing/LandingTestimonials'
import { LandingFAQ } from './components/landing/LandingFAQ'
import { LandingCTA } from './components/landing/LandingCTA'
import { LandingFooter } from './components/landing/LandingFooter'
import { LandingScrollReveal } from './components/landing/LandingScrollReveal'

export default function HomePage() {
  return (
    <>
      <LandingReadingProgress />
      <LandingHeader />
      <main style={{ paddingTop: 56, background: 'var(--bg)', color: 'var(--text)' }}>
        <LandingHero />
        <LandingTrustBar />
        <LandingAbout />
        <LandingStats />
        <LandingModules />
        <LandingHowItWorks />
        <LandingTestimonials />
        <LandingFAQ />
        <LandingCTA />
      </main>
      <LandingFooter />
      <LandingScrollReveal />
    </>
  )
}
