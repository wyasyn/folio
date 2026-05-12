export type UploadPreset = {
  folder: "projects" | "avatars"
  maxSizeMB: number
  dropTitle: string
  dropHint: string
  selectLabel: string
}

export const uploadPresets = {
  avatar: {
    folder: "avatars",
    maxSizeMB: 5,
    dropTitle: "Drop your avatar here",
    dropHint: "SVG, PNG, JPG or GIF (max. 5MB)",
    selectLabel: "Select avatar",
  },
  projectCover: {
    folder: "projects",
    maxSizeMB: 5,
    dropTitle: "Drop your cover image here",
    dropHint: "SVG, PNG, JPG or GIF (max. 5MB)",
    selectLabel: "Select image",
  },
  projectScreenshots: {
    folder: "projects",
    maxSizeMB: 5,
    dropTitle: "Drop project screenshots here",
    dropHint: "Add multiple images — PNG, JPG, WebP or GIF (max. 5MB each)",
    selectLabel: "Select images",
  },
} satisfies Record<string, UploadPreset>
