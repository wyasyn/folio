import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js"

const DEFAULT_COUNTRY: CountryCode = "US"

function parsePhone(value: string, defaultCountry?: CountryCode) {
  const trimmed = value.trim()
  if (!trimmed) return null

  return (
    parsePhoneNumberFromString(trimmed, defaultCountry ?? DEFAULT_COUNTRY) ??
    parsePhoneNumberFromString(trimmed)
  )
}

/** International display format, e.g. "+1 561 301 4406". */
export function formatPhoneDisplay(
  value: string | null | undefined,
  defaultCountry?: CountryCode,
): string | null {
  if (!value?.trim()) return null

  const phone = parsePhone(value, defaultCountry)
  if (phone?.isValid()) {
    return phone.formatInternational()
  }

  return value.trim()
}

/** E.164 for tel: links, e.g. "+15613014406". */
export function formatPhoneTel(
  value: string | null | undefined,
  defaultCountry?: CountryCode,
): string | null {
  if (!value?.trim()) return null

  const phone = parsePhone(value, defaultCountry)
  if (phone?.isValid()) {
    return phone.number
  }

  const digits = value.replace(/[^\d+]/g, "")
  return digits.length > 0 ? digits : null
}

/** Normalize for storage; returns E.164 when valid, otherwise trimmed input. */
export function normalizePhone(
  value: string | null | undefined,
  defaultCountry?: CountryCode,
): string | null {
  if (!value?.trim()) return null

  const phone = parsePhone(value, defaultCountry)
  if (phone?.isValid()) {
    return phone.number
  }

  return value.trim()
}
