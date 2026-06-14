import {
  CheckCircle2,
  Download,
  Lock,
  PlayCircle,
  RefreshCw,
  UploadCloud,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { backupConfig, backupJobs, type BackupJob } from "@/data/admin"
import {
  DataCard,
  FormRow,
  ReadValue,
  ToneChip,
  type Tone,
} from "./admin-ui"

const statusTone: Record<BackupJob["status"], Tone> = {
  success: "ok", running: "info", failed: "alert",
}

const statusLabel: Record<BackupJob["status"], string> = {
  success: "Success", running: "Running", failed: "Failed",
}

const scopeTone: Record<BackupJob["scope"], Tone> = {
  full: "info", incremental: "muted",
}

export function AdminBackupPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Backup & restore"
        description="Scheduled snapshots, cross-region replication, retention, and restore drills."
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9">
              <UploadCloud className="size-4 text-muted-foreground" />
              Restore drill
            </Button>
            <Button size="sm" className="h-9">
              <PlayCircle className="size-4" />
              Run now
            </Button>
          </>
        }
      />

      <DataCard icon={RefreshCw} title="Configuration">
        <FormRow label="Schedule"><ReadValue>{backupConfig.schedule}</ReadValue></FormRow>
        <FormRow label="Next run"><ReadValue>{backupConfig.nextRunIn}</ReadValue></FormRow>
        <FormRow label="Retention"><ReadValue>{backupConfig.retentionDays} days</ReadValue></FormRow>
        <FormRow label="Destination"><ReadValue mono>{backupConfig.destination}</ReadValue></FormRow>
        <FormRow label="Cross-region replication">
          <ToneChip tone={backupConfig.crossRegionReplication ? "ok" : "warn"}>
            {backupConfig.crossRegionReplication ? "Enabled" : "Disabled"}
          </ToneChip>
        </FormRow>
        <FormRow label="Encryption">
          <div className="inline-flex items-center gap-2 text-sm">
            <Lock className="size-3.5 text-emerald-500" />
            {backupConfig.encryption}
          </div>
        </FormRow>
        <FormRow label="Last restore drill"><ReadValue>{backupConfig.lastRestoreTest}</ReadValue></FormRow>
      </DataCard>

      <Card>
        <CardContent className="px-0 py-0">
          <div className="border-b px-5 py-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Recent jobs
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-2 font-medium">Started</th>
                  <th className="px-5 py-2 font-medium">Scope</th>
                  <th className="px-5 py-2 font-medium">Size</th>
                  <th className="px-5 py-2 font-medium">Duration</th>
                  <th className="px-5 py-2 font-medium">Artefacts</th>
                  <th className="px-5 py-2 font-medium">Status</th>
                  <th className="w-10 px-5 py-2 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {backupJobs.map((j) => (
                  <tr key={j.id}>
                    <td className="px-5 py-2.5 font-mono text-[12px] text-muted-foreground">{j.startedAt}</td>
                    <td className="px-5 py-2.5">
                      <ToneChip tone={scopeTone[j.scope]}>{j.scope}</ToneChip>
                    </td>
                    <td className="px-5 py-2.5 font-mono tabular-nums">{j.size}</td>
                    <td className="px-5 py-2.5 font-mono text-[12px] text-muted-foreground">
                      {j.durationSec ? `${j.durationSec}s` : "—"}
                    </td>
                    <td className="px-5 py-2.5 font-mono tabular-nums">{j.artifactsCount.toLocaleString()}</td>
                    <td className="px-5 py-2.5">
                      <ToneChip tone={statusTone[j.status]}>
                        {j.status === "success" && <CheckCircle2 className="size-3" />}
                        {statusLabel[j.status]}
                      </ToneChip>
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <Button variant="ghost" size="icon-sm">
                        <Download className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
