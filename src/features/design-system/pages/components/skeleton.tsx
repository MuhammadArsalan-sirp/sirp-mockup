import { Skeleton } from "@/components/ui/skeleton"
import { Code, Preview, SubSection } from "../../showcase"

export function SkeletonPage() {
  return (
    <div className="space-y-10">

      <SubSection title="Default" description="Animated placeholder bars. Used during data fetch.">
        <Preview>
          <div className="w-full space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Card skeleton" description="Mirror the structure of the eventual card so layout doesn't jump.">
        <Preview>
          <div className="w-full rounded-lg border bg-card px-5 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="mt-4 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="List skeleton" description="For lists, render 3-5 rows. Avoid rendering more than the visible viewport would show.">
        <Preview>
          <div className="w-full divide-y rounded-lg border bg-card">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex items-center gap-3 px-4 py-2.5">
                <Skeleton className="size-7 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-3/5" />
                  <Skeleton className="h-2.5 w-2/5" />
                </div>
                <Skeleton className="size-4 rounded-full" />
              </div>
            ))}
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Rules">
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>• <strong className="text-foreground">Match the eventual layout.</strong> Skeletons should hint at the data structure so the page doesn't jump on load.</li>
          <li>• Use <Code>h-3</Code> / <Code>h-3.5</Code> / <Code>h-4</Code> for text bars, <Code>size-N rounded-lg</Code> for icon boxes, <Code>size-N rounded-full</Code> for avatars / dots.</li>
          <li>• Don't over-render — 3-5 list rows is enough to communicate "loading."</li>
        </ul>
      </SubSection>

      <SubSection title="Import">
        <div className="rounded-lg border bg-muted/15 px-3 py-2">
          <Code>{`import { Skeleton } from "@/components/ui/skeleton"`}</Code>
        </div>
      </SubSection>
    </div>
  )
}
