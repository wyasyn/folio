import { PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient
}

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  })
  return new PrismaClient({ adapter })
}

/** Dev hot-reload can keep an old PrismaClient missing new models after `prisma generate`. */
function isPrismaClientStale(client: PrismaClient) {
  return !(
    "openRouterModel" in client &&
    "siteAiSettings" in client &&
    "pageView" in client
  )
}

const cached = globalForPrisma.prisma
const db =
  cached && !isPrismaClientStale(cached) ? cached : createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db
}

export default db
