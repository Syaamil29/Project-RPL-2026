const ADMIN_EMAILS = ["farrelalfachrezi@apps.ipb.ac.id", "fairuzhibatullah54@gmail.com", "rezonaldorezonaldo@apps.ipb.ac.id"]

export function isAdmin(email: string) {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

