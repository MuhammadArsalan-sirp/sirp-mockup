import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { users } from "@/data/users"
import { Code, Preview, SubSection } from "../../showcase"

export function AvatarPage() {
  return (
    <div className="space-y-10">

      <SubSection title="The three forms" description="Photo (when available) → gradient initials → muted fallback.">
        <Preview code={`<Avatar className="size-8">\n  <AvatarImage src={user.photo} alt={user.name} />\n  <AvatarFallback className={cn("bg-linear-to-br text-[9px] font-bold text-white", user.gradient)}>\n    {user.initials}\n  </AvatarFallback>\n</Avatar>`}>
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              <AvatarImage src={users.ahmed.photo} alt={users.ahmed.name} />
              <AvatarFallback className={cn("bg-linear-to-br text-[9px] font-bold text-white", users.ahmed.gradient)}>
                {users.ahmed.initials}
              </AvatarFallback>
            </Avatar>
            <Avatar className="size-9">
              <AvatarFallback className={cn("bg-linear-to-br text-[10px] font-bold text-white", users.sara.gradient)}>
                {users.sara.initials}
              </AvatarFallback>
            </Avatar>
            <Avatar className="size-9">
              <AvatarFallback className="bg-muted text-[10px] font-bold text-muted-foreground">??</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">photo · gradient · unknown</span>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Sizes" description="size-4 (mini, in chips) · size-5 (header) · size-7 (comments / list rows) · size-9 (header member stack).">
        <Preview>
          <div className="flex items-end gap-3">
            <Avatar className="size-4">
              <AvatarFallback className={cn("bg-linear-to-br text-[7px] font-bold text-white", users.ahmed.gradient)}>
                {users.ahmed.initials}
              </AvatarFallback>
            </Avatar>
            <Avatar className="size-5">
              <AvatarFallback className={cn("bg-linear-to-br text-[8px] font-bold text-white", users.ahmed.gradient)}>
                {users.ahmed.initials}
              </AvatarFallback>
            </Avatar>
            <Avatar className="size-7">
              <AvatarFallback className={cn("bg-linear-to-br text-[9px] font-bold text-white", users.ahmed.gradient)}>
                {users.ahmed.initials}
              </AvatarFallback>
            </Avatar>
            <Avatar className="size-9">
              <AvatarFallback className={cn("bg-linear-to-br text-[10px] font-bold text-white", users.ahmed.gradient)}>
                {users.ahmed.initials}
              </AvatarFallback>
            </Avatar>
            <Avatar className="size-12">
              <AvatarFallback className={cn("bg-linear-to-br text-base font-bold text-white", users.ahmed.gradient)}>
                {users.ahmed.initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Member stack" description="Overlapping avatars with negative margin + ring to mask the background.">
        <Preview>
          <div className="flex items-center">
            {[users.ahmed, users.sara, users.mariam, users.yusuf, users.rashid].map((u, i) => (
              <Avatar key={u.id} className={cn("size-7 ring-2 ring-background", i > 0 && "-ml-2")}>
                <AvatarImage src={u.photo} alt={u.name} />
                <AvatarFallback className={cn("bg-linear-to-br text-[9px] font-bold text-white", u.gradient)}>
                  {u.initials}
                </AvatarFallback>
              </Avatar>
            ))}
            <span className="ml-2 text-xs text-muted-foreground">5 members</span>
          </div>
        </Preview>
      </SubSection>

      <SubSection title="Rules">
        <ul className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>• Always use the triplet — <Code>Avatar</Code> + <Code>AvatarImage</Code> + <Code>AvatarFallback</Code>.</li>
          <li>• Photos are Unsplash headshots via <Code>users.ts</Code>; the fallback gradient comes from <Code>user.gradient</Code>.</li>
          <li>• For OmniSense / system actors, use a tinted Sparkles icon-box (not an avatar).</li>
          <li>• No pravatar / dicebear / randomuser — we landed on Unsplash because the user wanted professional portraits.</li>
        </ul>
      </SubSection>

      <SubSection title="Import">
        <div className="rounded-lg border bg-muted/15 px-3 py-2">
          <Code>{`import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"`}</Code>
        </div>
      </SubSection>
    </div>
  )
}
