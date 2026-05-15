import type { Prisma } from "@/generated/prisma/client"
import { resolveCatalogSelections } from "@/lib/catalog-names"
import db from "@/lib/db"

export async function resolveTagNamesForWrite(
  selections: readonly string[]
): Promise<string[]> {
  const catalog = await db.tag.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  })
  return resolveCatalogSelections(
    selections,
    catalog.map((tag) => tag.name)
  )
}

export async function resolveTechStackNamesForWrite(
  selections: readonly string[]
): Promise<string[]> {
  const catalog = await db.techStack.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  })
  return resolveCatalogSelections(
    selections,
    catalog.map((stack) => stack.name)
  )
}

type Tx = Prisma.TransactionClient

export async function syncTagNamesInTransaction(
  tx: Tx,
  selections: readonly string[]
): Promise<{ id: number }[]> {
  const names = await resolveTagNamesForWrite(selections)
  if (names.length === 0) return []

  const existing = await tx.tag.findMany({
    where: { name: { in: names } },
    select: { id: true, name: true },
  })
  const existingByName = new Map(existing.map((tag) => [tag.name, tag.id]))

  for (const name of names.filter((n) => !existingByName.has(n))) {
    await tx.tag.create({ data: { name, updatedAt: new Date() } })
  }

  const all = await tx.tag.findMany({
    where: { name: { in: names } },
    select: { id: true, name: true },
  })
  const idByName = new Map(all.map((tag) => [tag.name, tag.id]))

  return names.map((name) => ({ id: idByName.get(name)! }))
}

export async function tagRelationInputForCreate(
  selections: readonly string[]
) {
  const names = await resolveTagNamesForWrite(selections)
  const existing = await db.tag.findMany({
    where: { name: { in: names } },
    select: { id: true, name: true },
  })
  const existingByName = new Map(existing.map((tag) => [tag.name, tag.id]))

  return {
    connect: names
      .filter((name) => existingByName.has(name))
      .map((name) => ({ id: existingByName.get(name)! })),
    create: names
      .filter((name) => !existingByName.has(name))
      .map((name) => ({ name, updatedAt: new Date() })),
  }
}

export async function techStackRelationInputForCreate(
  selections: readonly string[]
) {
  const names = await resolveTechStackNamesForWrite(selections)
  const existing = await db.techStack.findMany({
    where: { name: { in: names } },
    select: { id: true, name: true },
  })
  const existingByName = new Map(
    existing.map((stack) => [stack.name, stack.id])
  )

  return {
    connect: names
      .filter((name) => existingByName.has(name))
      .map((name) => ({ id: existingByName.get(name)! })),
    create: names
      .filter((name) => !existingByName.has(name))
      .map((name) => ({ name, updatedAt: new Date() })),
  }
}

export async function syncTechStackNamesInTransaction(
  tx: Tx,
  selections: readonly string[]
): Promise<number[]> {
  const names = await resolveTechStackNamesForWrite(selections)
  if (names.length === 0) return []

  const existing = await tx.techStack.findMany({
    where: { name: { in: names } },
    select: { id: true, name: true },
  })
  const existingByName = new Map(
    existing.map((stack) => [stack.name, stack.id])
  )

  for (const name of names.filter((n) => !existingByName.has(n))) {
    await tx.techStack.create({ data: { name, updatedAt: new Date() } })
  }

  const all = await tx.techStack.findMany({
    where: { name: { in: names } },
    select: { id: true, name: true },
  })
  const idByName = new Map(all.map((stack) => [stack.name, stack.id]))

  return names.map((name) => idByName.get(name)!)
}
