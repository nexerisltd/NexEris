import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { Logo } from '@/components/ui/Logo'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string }>
}) {
  const params = await searchParams
  const redirectTo = params.redirectTo ?? '/'
  const error = params.error

  const errorMessages: Record<string, string> = {
    missing_code: 'Something went wrong starting sign-in. Please try again.',
    auth_failed: 'Google sign-in failed. Please try again.',
    no_email: 'Your Google account has no email attached. Please use a different account.',
    profile_creation_failed: 'We could not set up your profile. Please contact an admin.',
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="animate-float absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-accent)]/20 blur-[120px]" />
      </div>

      <div className="glass animate-fade-in-up w-full max-w-sm rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3">
          <Logo size={40} priority />
          <span className="font-[family-name:var(--font-data)] text-xs uppercase tracking-[0.25em] text-[var(--color-accent-bright)]">
            NexEris LTD
          </span>
        </div>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-text)]">
          Sign in to your account
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Team members sign in with Google. Everyone else can still browse public profiles as a guest.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300">
            {errorMessages[error] ?? 'An error occurred. Please try again.'}
          </div>
        )}

        <div className="mt-6">
          <GoogleSignInButton redirectTo={redirectTo} />
        </div>

        <p className="mt-6 text-center text-xs text-[var(--color-text-muted)]">
          Not a team member?{' '}
          <a href="/" className="underline hover:text-[var(--color-text)]">
            Browse the team directory
          </a>
        </p>
      </div>
    </main>
  )
}