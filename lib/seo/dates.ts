/** Prisma dates become strings after `unstable_cache` JSON serialization. */
export type DateLike = Date | string

export function toIsoDateString(value: DateLike): string {
  if (value instanceof Date) {
    return value.toISOString()
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: ${String(value)}`)
  }

  return parsed.toISOString()
}

export function toDate(value: DateLike): Date {
  if (value instanceof Date) {
    return value
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: ${String(value)}`)
  }

  return parsed
}
