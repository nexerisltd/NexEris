'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function LikeButton({
  profileId,
  initialCount,
  initialLiked,
  isSignedIn,
}: {
  profileId: string
  initialCount: number
  initialLiked: boolean
  isSignedIn: boolean
}) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleClick() {
    if (!isSignedIn) {
      router.push('/login')
      return
    }

    const nextLiked = !liked
    setLiked(nextLiked)
    setCount((c) => (nextLiked ? c + 1 : c - 1))

    startTransition(async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      if (nextLiked) {
        const { error } = await supabase
          .from('profile_likes')
          .insert({ profile_id: profileId, liker_auth_user_id: user.id })
        if (error) {
          // revert on failure (e.g. race condition)
          setLiked(false)
          setCount((c) => c - 1)
        }
      } else {
        const { error } = await supabase
          .from('profile_likes')
          .delete()
          .eq('profile_id', profileId)
          .eq('liker_auth_user_id', user.id)
        if (error) {
          setLiked(true)
          setCount((c) => c + 1)
        }
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="glass flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-accent)]/40 disabled:opacity-70"
    >
      <motion.span
        animate={liked ? { scale: [1, 1.4, 1] } : { scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <Heart
          className={`h-4 w-4 ${liked ? 'fill-rose-500 text-rose-500' : ''}`}
        />
      </motion.span>
      {count}
    </button>
  )
}