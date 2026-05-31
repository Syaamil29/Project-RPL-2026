import { createClient } from "@supabase/supabase-js"

const ADMIN_EMAILS = [
  "farrelalfachrezi@apps.ipb.ac.id",
  "fairuzhibatullah54@gmail.com",
  "syamilswg@gmail.com"
]

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

/**
 * Checks if email has admin privileges.
 * First validates developer fallbacks, then queries DB profiles.
 */
export async function isAdmin(email: string): Promise<boolean> {
  const cleanEmail = email.toLowerCase()

  if (ADMIN_EMAILS.includes(cleanEmail)) {
    return true
  }

  try {
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("email", cleanEmail)
      .single()

    return data?.role === "admin"
  } catch (error) {
    console.error("Error verifying admin status:", error)
    return false
  }
}

