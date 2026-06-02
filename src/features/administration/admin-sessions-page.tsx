import { Globe, KeyRound, Lock, ShieldCheck, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { sessionPolicy } from "@/data/admin"
import {
  DataCard,
  FormRow,
  ReadValue,
  ToneChip,
  ToggleRow,
} from "./admin-ui"

export function AdminSessionsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Sessions & policy"
        description="Idle timeout, lockout thresholds, password rules, and admin IP allowlisting."
        actions={<Button size="sm" className="h-9">Save changes</Button>}
      />

      <DataCard icon={Timer} title="Session lifetime">
        <FormRow label="Idle timeout" hint="Auto sign-out after this period of inactivity.">
          <ReadValue>{sessionPolicy.idleTimeoutMinutes} minutes</ReadValue>
        </FormRow>
        <FormRow label="Absolute timeout" hint="Hard upper bound regardless of activity.">
          <ReadValue>{sessionPolicy.absoluteTimeoutHours} hours</ReadValue>
        </FormRow>
        <FormRow label="Remember-me cookie">
          <ReadValue>{sessionPolicy.rememberMeDays} days</ReadValue>
        </FormRow>
        <FormRow label="Concurrent sessions per user">
          <ReadValue>{sessionPolicy.concurrentSessions}</ReadValue>
        </FormRow>
      </DataCard>

      <DataCard icon={Lock} title="Lockout">
        <FormRow label="Failed attempts">
          <ReadValue>{sessionPolicy.lockoutAttempts} attempts</ReadValue>
        </FormRow>
        <FormRow label="Failure window">
          <ReadValue>{sessionPolicy.lockoutWindowMinutes} minutes</ReadValue>
        </FormRow>
        <FormRow label="Lockout duration">
          <ReadValue>{sessionPolicy.lockoutDurationMinutes} minutes</ReadValue>
        </FormRow>
      </DataCard>

      <DataCard icon={KeyRound} title="Password policy">
        <FormRow label="Minimum length">
          <ReadValue>{sessionPolicy.passwordMinLength} characters</ReadValue>
        </FormRow>
        <FormRow label="Require complexity" hint="Mix of upper, lower, digit, symbol.">
          <ToneChip tone={sessionPolicy.passwordRequireComplexity ? "ok" : "warn"}>
            {sessionPolicy.passwordRequireComplexity ? "Required" : "Optional"}
          </ToneChip>
        </FormRow>
        <FormRow label="Password history" hint="Block reuse of previous passwords.">
          <ReadValue>{sessionPolicy.passwordHistory} previous</ReadValue>
        </FormRow>
        <FormRow label="Rotation">
          <ReadValue>{sessionPolicy.passwordExpiryDays} days</ReadValue>
        </FormRow>
      </DataCard>

      <DataCard
        icon={ShieldCheck}
        title="MFA enforcement"
      >
        <div className="space-y-1">
          <ToggleRow
            label="Require MFA for all admins"
            description="Super Admins and SOC Managers must enrol within 24 hours."
            enabled={sessionPolicy.enforceMfaForAdmins}
            badge={<ToneChip tone="ok">Recommended</ToneChip>}
          />
          <ToggleRow
            label="Require MFA for all users"
            description="Extend MFA requirement to analysts and read-only roles."
            enabled
          />
          <ToggleRow
            label="Allow recovery codes"
            description="Users can generate 10 single-use codes from their profile."
            enabled
          />
        </div>
      </DataCard>

      <DataCard
        icon={Globe}
        title="Admin IP allowlist"
        action={
          <ToneChip tone={sessionPolicy.ipAllowlistEnabled ? "ok" : "warn"}>
            {sessionPolicy.ipAllowlistEnabled ? "Enabled" : "Disabled"}
          </ToneChip>
        }
      >
        <FormRow label="Restrict admin actions" hint="Analyst sign-in is unaffected.">
          <ToneChip tone={sessionPolicy.ipAllowlistEnabled ? "ok" : "warn"}>
            {sessionPolicy.ipAllowlistEnabled ? "Restricted" : "Off"}
          </ToneChip>
        </FormRow>
        <FormRow label="CIDR ranges">
          <div className="flex flex-wrap gap-1.5 py-1.5">
            {sessionPolicy.ipAllowlist.map((cidr) => (
              <code
                key={cidr}
                className="rounded bg-muted px-2 py-0.5 font-mono text-[12px]"
              >
                {cidr}
              </code>
            ))}
          </div>
        </FormRow>
      </DataCard>
    </div>
  )
}
