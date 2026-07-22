import { Hero } from '@/components/homepage/Hero'
import { About } from '@/components/homepage/About'
import { TeamTeaser } from '@/components/homepage/TeamTeaser'
import { Footer } from '@/components/homepage/Footer'
import { getAllProfiles } from '@/lib/data/profiles'
import { getCurrentUser } from '@/lib/auth'

export default async function HomePage() {
  const profiles = await getAllProfiles()
  const currentUser = await getCurrentUser()

  return (
    <main>
      <Hero
        isSignedIn={currentUser.role === 'member' || currentUser.role === 'admin'}
        username={currentUser.profile?.username}
      />
      <About />
      <TeamTeaser profiles={profiles} />
      <Footer />
    </main>
  )
}