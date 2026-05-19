import { Link } from "react-router"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
      <div className="max-w-md space-y-3">
        <div className="font-mono text-6xl font-bold text-muted-foreground">
          404
        </div>
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has moved.
        </p>
        <Button asChild>
          <Link to="/">Back to OmniBoard</Link>
        </Button>
      </div>
    </div>
  )
}
