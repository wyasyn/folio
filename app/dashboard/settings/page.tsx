
import { auth } from "@/lib/auth"
import db from "@/lib/db"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { ProfileSettingsForm } from "@/components/dashboard/settings/profile-settings-form"

export default async function SettingsPage() {
 
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    redirect("/login")
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      name: true,
      email: true,
      jobTitle: true,
      tagline: true,
      bio: true,
      location: true,
      image: true,
      website: true,
      github: true,
      linkedin: true,
      twitter: true,
      publicEmail: true,
      resumeUrl: true,
      openToWork: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <section className="">
     
      <ProfileSettingsForm
        initialProfile={{
          name: user.name ?? "",
          email: user.email,
          jobTitle: user.jobTitle ?? "",
          tagline: user.tagline ?? "",
          bio: user.bio ?? "",
          location: user.location ?? "",
          image: user.image ?? "",
          website: user.website ?? "",
          github: user.github ?? "",
          linkedin: user.linkedin ?? "",
          twitter: user.twitter ?? "",
          publicEmail: user.publicEmail ?? "",
          resumeUrl: user.resumeUrl ?? "",
          openToWork: user.openToWork,
        }}
      />
    </section>
  )
}
