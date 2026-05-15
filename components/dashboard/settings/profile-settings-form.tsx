"use client"

import { useMemo, useState } from "react"
import { AiAssistButton } from "@/components/dashboard/ai/ai-assist-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { IconCheck, IconLoader2 } from "@tabler/icons-react"
import { ImageUploadDropzone } from "@/components/ui/image-upload-dropzone"
import { uploadImageToCloudinary } from "@/lib/cloudinary-upload"
import { uploadPresets } from "@/lib/upload-presets"
import { formatPhoneDisplay } from "@/lib/phone"
import { cn } from "@/lib/utils"

type ProfileSettingsFormProps = {
  initialProfile: {
    name: string
    email: string
    jobTitle: string
    tagline: string
    bio: string
    location: string
    image: string
    website: string
    github: string
    linkedin: string
    twitter: string
    publicEmail: string
    publicPhone: string
    contactHours: string
    mapEmbedUrl: string
    resumeUrl: string
    openToWork: boolean
  }
}

export function ProfileSettingsForm({ initialProfile }: ProfileSettingsFormProps) {
  const steps = [
    { id: 1, label: "Personal Data" },
    { id: 2, label: "Image" },
    { id: 3, label: "Bio" },
    { id: 4, label: "Social Links" },
  ] as const

  const [name, setName] = useState(initialProfile.name)
  const [jobTitle, setJobTitle] = useState(initialProfile.jobTitle)
  const [tagline, setTagline] = useState(initialProfile.tagline)
  const [bio, setBio] = useState(initialProfile.bio)
  const [location, setLocation] = useState(initialProfile.location)
  const [image, setImage] = useState(initialProfile.image)
  const [website, setWebsite] = useState(initialProfile.website)
  const [github, setGithub] = useState(initialProfile.github)
  const [linkedin, setLinkedin] = useState(initialProfile.linkedin)
  const [twitter, setTwitter] = useState(initialProfile.twitter)
  const [publicEmail, setPublicEmail] = useState(initialProfile.publicEmail)
  const [publicPhone, setPublicPhone] = useState(
    () => formatPhoneDisplay(initialProfile.publicPhone) ?? initialProfile.publicPhone,
  )
  const [contactHours, setContactHours] = useState(initialProfile.contactHours)
  const [mapEmbedUrl, setMapEmbedUrl] = useState(initialProfile.mapEmbedUrl)
  const [resumeUrl, setResumeUrl] = useState(initialProfile.resumeUrl)
  const [openToWork, setOpenToWork] = useState(initialProfile.openToWork)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isStepLoading, setIsStepLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<(typeof steps)[number]["id"]>(1)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [hasExistingProfile, setHasExistingProfile] = useState(false)

  const hasProfileData = useMemo(
    () =>
      Boolean(
        initialProfile.name ||
          initialProfile.jobTitle ||
          initialProfile.tagline ||
          initialProfile.bio ||
          initialProfile.location ||
          initialProfile.image ||
          initialProfile.website ||
          initialProfile.github ||
          initialProfile.linkedin ||
          initialProfile.twitter ||
          initialProfile.publicEmail ||
          initialProfile.publicPhone ||
          initialProfile.contactHours ||
          initialProfile.mapEmbedUrl ||
          initialProfile.resumeUrl ||
          initialProfile.openToWork,
      ),
    [initialProfile],
  )

  const isEditMode = hasExistingProfile || hasProfileData
  const isLastStep = currentStep === steps.length

  const initials = useMemo(() => {
    const source = name.trim() || initialProfile.email
    const tokens = source.split(" ").filter(Boolean)
    if (tokens.length === 0) return "U"
    if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase()
    return `${tokens[0][0] ?? ""}${tokens[1][0] ?? ""}`.toUpperCase()
  }, [name, initialProfile.email])

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setMessage("")
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          jobTitle,
          tagline,
          bio,
          location,
          image,
          website,
          github,
          linkedin,
          twitter,
          publicEmail,
          publicPhone,
          contactHours,
          mapEmbedUrl,
          resumeUrl,
          openToWork,
        }),
      })

      const result = (await response.json()) as { error?: string }
      if (!response.ok) {
        setError(result.error ?? "Unable to save profile details.")
        return
      }

      setMessage(isEditMode ? "Profile updated." : "Profile created.")
      if (!hasExistingProfile) {
        setHasExistingProfile(true)
      }
    } catch {
      setError("Something went wrong while saving your profile.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNextStep = () => {
    if (isLastStep) return
    setIsStepLoading(true)
    setTimeout(() => {
      setCurrentStep((current) =>
        current < steps.length ? ((current + 1) as 1 | 2 | 3 | 4) : current,
      )
      setIsStepLoading(false)
    }, 300)
  }

  return (
    <div className="w-full max-w-5xl rounded-xl border bg-card">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b px-6 py-5">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Edit your profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete your profile the first time, then update it any time from
            settings.
          </p>
        </div>
        <AiAssistButton
          context="profile"
          mode={isEditMode ? "edit" : "create"}
          getDraft={() => ({
            title: name,
            jobTitle,
            tagline,
            bio,
            description: bio,
          })}
        />
      </div>

      <div className="grid gap-0 border-b md:grid-cols-[2fr_1fr]">
        <form onSubmit={onSubmit} className="space-y-4 px-6 py-5 md:border-r">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-1 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(step.id)}
                    className="inline-flex flex-col items-center gap-1 text-center"
                  >
                    <span
                      className={cn(
                        "flex size-8 items-center justify-center rounded-full border text-xs font-semibold",
                        step.id < currentStep
                          ? "border-primary bg-primary text-primary-foreground"
                          : step.id === currentStep
                            ? "border-primary text-primary"
                            : "border-muted-foreground/30 text-muted-foreground",
                      )}
                    >
                      {step.id < currentStep ? <IconCheck className="size-4" /> : step.id}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{step.label}</span>
                  </button>
                  {index < steps.length - 1 ? (
                    <span className="h-px flex-1 bg-border" />
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {currentStep === 1 ? (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                  maxLength={100}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <Input value={initialProfile.email} disabled />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={jobTitle}
                  onChange={(event) => setJobTitle(event.target.value)}
                  placeholder="e.g. Full-stack Developer"
                  maxLength={100}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="City, Country"
                  maxLength={120}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tagline</label>
                <Input
                  value={tagline}
                  onChange={(event) => setTagline(event.target.value)}
                  placeholder="A short one-liner for your profile"
                  maxLength={120}
                />
              </div>
            </>
          ) : null}

          {currentStep === 2 ? (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Avatar</label>
              <ImageUploadDropzone
                value={image}
                onChange={setImage}
                onUpload={(file) =>
                  uploadImageToCloudinary(file, { folder: uploadPresets.avatar.folder })
                }
                maxSizeMB={uploadPresets.avatar.maxSizeMB}
                dropTitle={uploadPresets.avatar.dropTitle}
                dropHint={uploadPresets.avatar.dropHint}
                selectLabel={uploadPresets.avatar.selectLabel}
              />
            </div>
          ) : null}

          {currentStep === 3 ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Bio</label>
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="A short bio for your profile..."
                  maxLength={280}
                  className="min-h-28 w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
            </div>
          ) : null}

          {currentStep === 4 ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Public Email</label>
                <Input
                  type="email"
                  value={publicEmail}
                  onChange={(event) => setPublicEmail(event.target.value)}
                  placeholder="you@example.com"
                  maxLength={320}
                />
              </div>

              <div className="rounded-lg border border-border p-4 space-y-4">
                <div>
                  <p className="text-sm font-medium">Contact page</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Shown on your public contact page. Location is set under Personal Data.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Public phone</label>
                  <Input
                    type="tel"
                    value={publicPhone}
                    onChange={(event) => setPublicPhone(event.target.value)}
                    placeholder="+1 555 123 4567"
                    maxLength={40}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Business hours</label>
                  <Input
                    value={contactHours}
                    onChange={(event) => setContactHours(event.target.value)}
                    placeholder="Monday – Friday, 9:00 AM – 6:00 PM"
                    maxLength={200}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Map embed URL</label>
                  <Input
                    type="url"
                    value={mapEmbedUrl}
                    onChange={(event) => setMapEmbedUrl(event.target.value)}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    maxLength={800}
                  />
                  <p className="text-xs text-muted-foreground">
                    Google Maps → Share → Embed a map → copy the iframe{" "}
                    <code className="text-foreground/80">src</code> URL.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Website</label>
                <Input
                  type="url"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  placeholder="https://your-site.com"
                  maxLength={500}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">GitHub</label>
                <Input
                  type="url"
                  value={github}
                  onChange={(event) => setGithub(event.target.value)}
                  placeholder="https://github.com/username"
                  maxLength={500}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">LinkedIn</label>
                <Input
                  type="url"
                  value={linkedin}
                  onChange={(event) => setLinkedin(event.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  maxLength={500}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Twitter / X</label>
                <Input
                  type="url"
                  value={twitter}
                  onChange={(event) => setTwitter(event.target.value)}
                  placeholder="https://x.com/username"
                  maxLength={500}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Resume URL</label>
                <Input
                  type="url"
                  value={resumeUrl}
                  onChange={(event) => setResumeUrl(event.target.value)}
                  placeholder="https://drive.google.com/..."
                  maxLength={500}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Open to Work</p>
                  <p className="text-xs text-muted-foreground">
                    Show that you are currently available for opportunities.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={openToWork}
                  onClick={() => setOpenToWork((current) => !current)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    openToWork ? "bg-primary" : "bg-muted-foreground/40",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block size-5 translate-x-0.5 rounded-full bg-background shadow transition-transform",
                      openToWork && "translate-x-5",
                    )}
                  />
                </button>
              </div>
            </div>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

          <div className="flex justify-between pt-1">
            <Button
              type="button"
              variant="outline"
              disabled={currentStep === 1 || isSubmitting || isStepLoading}
              onClick={() =>
                setCurrentStep((current) =>
                  current > 1 ? ((current - 1) as 1 | 2 | 3 | 4) : current,
                )
              }
            >
              Back
            </Button>
            {isLastStep ? (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : isEditMode ? (
                  "Save Changes"
                ) : (
                  "Create Profile"
                )}
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                disabled={isStepLoading}
                onClick={handleNextStep}
              >
                {isStepLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </span>
                ) : (
                  "Continue"
                )}
              </Button>
            )}
          </div>
        </form>

        <div className="flex flex-col items-center gap-3 px-6 py-6 text-center">
          <div className="text-left w-full">
            <p className="text-sm font-semibold text-foreground">Profile Preview</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This is how your basic profile data appears.
            </p>
          </div>

          <div className="mt-1 flex h-24 w-24 items-center justify-center rounded-full bg-muted text-xl font-semibold text-foreground">
            {initials}
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">
              {name.trim() || "Your Name"}
            </p>
            <p className="text-sm text-muted-foreground">
              {jobTitle.trim() || "Your role"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
