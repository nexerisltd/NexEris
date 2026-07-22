import { createClient } from '@/lib/supabase/server'
import { AllowedEmailsTable } from '@/components/admin/AllowedEmailsTable'
import { BulkImportEmails } from '@/components/admin/BulkImportEmails'

export default async function AdminAllowedEmailsPage() {
  const supabase = await createClient()
  const { data: emails } = await supabase
    .from('allowed_members')
    .select('*')
    .order('email', { ascending: true })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-text)]">
          Allowed Emails
        </h1>
        <BulkImportEmails />
      </div>
      <AllowedEmailsTable emails={emails ?? []} />
    </div>
  )
}