import { TeamSection } from '@/components/homepage/TeamSection'
import { getAllProfiles } from '@/lib/data/profiles'

export const metadata = {
  title: 'Team — NexEris',
  description: 'Browse every member of the NexEris team.',
}

export default async function TeamPage() {
  const profiles = await getAllProfiles()

  return (
    <main className="min-h-screen pt-12">
      <TeamSection profiles={profiles} />
    </main>
  )
}