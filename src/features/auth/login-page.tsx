import { useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  return (
    <div className="grid min-h-screen place-items-center bg-background p-6">
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            <img src="/brand/sirp-cube.svg" alt="SIRP" className="size-7" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Sign in to SIRP</h1>
            <p className="text-xs text-muted-foreground">
              Use your tenant credentials
            </p>
          </div>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            setSubmitting(true)
            setTimeout(() => navigate("/"), 400)
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="ahmed@sirp.io" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Trouble signing in? Contact your administrator.
        </p>
      </div>
    </div>
  )
}
