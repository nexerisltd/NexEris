import { Hero } from '@/components/homepage/Hero'
import { About } from '@/components/homepage/About'
import { TeamTeaser } from '@/components/homepage/TeamTeaser'
import { Services } from '@/components/company/Services'
import { Products } from '@/components/company/Products'
import { Contact } from '@/components/company/Contact'
import { Footer } from '@/components/homepage/Footer'
import { getAllProfiles } from '@/lib/data/profiles'
import { getProducts } from '@/lib/data/products'
import { getCurrentUser } from '@/lib/auth'
import { isSignedInMember } from '@/lib/roles'
import { products as starterProducts } from '@/lib/company'

export default async function HomePage() {
  // Independent queries run at the same time instead of one after another.
  const [profiles, currentUser, products] = await Promise.all([
    getAllProfiles(),
    getCurrentUser(),
    getProducts(),
  ])

  return (
    <main>
      <Hero
        isSignedIn={isSignedInMember(currentUser.role)}
        username={currentUser.profile?.username}
        productCount={products.length || starterProducts.length}
        memberCount={profiles.length}
      />
      <Services />
      <Products products={products} />
      <About />
      <TeamTeaser profiles={profiles} />
      <Contact />
      <Footer />
    </main>
  )
}
