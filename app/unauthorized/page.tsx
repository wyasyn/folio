import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold">Unauthorized</h1>
      <p className="text-muted-foreground max-w-md text-center">
        Your account does not have access to the dashboard. Contact an admin to
        update your role.
      </p>
      <Button asChild>
        <Link href="/">Go back home</Link>
      </Button>
    </main>
  )
}
