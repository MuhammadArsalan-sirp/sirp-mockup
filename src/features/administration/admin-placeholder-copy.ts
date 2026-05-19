/** Static copy for mock “coming next” admin screens (matches production IA). */
export const adminPlaceholderCopy: Record<
  string,
  { title: string; description: string }
> = {
  departments: {
    title: "Departments",
    description:
      "Organise users and reporting lines. This mock screen will mirror hierarchy, cost centres, and default assignment groups.",
  },
  tenants: {
    title: "Tenants",
    description:
      "Switch and govern child organisations. Planned: tenant list, suspension, branding overrides, and cross-tenant admin roles.",
  },
  "incident-setup": {
    title: "Incident setup",
    description:
      "Categories, sub-categories, states, SLAs, and custom fields — today under Incident Management in production. Will land here as a focused wizard.",
  },
  "threat-intel-setup": {
    title: "Threat intel setup",
    description:
      "Advisory taxonomy and workflows. Aligns with production Threat Intelligence admin; mock data will follow the same permission model.",
  },
  "master-data": {
    title: "Master data",
    description:
      "Asset types, classifications, owners, and reference lists shared across modules. Extracted from the Entities admin area in production.",
  },
  sso: {
    title: "SSO & SAML",
    description:
      "IdP metadata, certificate rotation, JIT provisioning, and domain allowlists. Connects to the SSO slice in Access Control today.",
  },
  sessions: {
    title: "Session policy",
    description:
      "Idle timeout, password rules, and lockout thresholds. Mirrors Session / password settings in production Access Control.",
  },
  email: {
    title: "Email",
    description:
      "SMTP, sender identity, TLS, and test delivery — same scope as Product Settings → Email in production.",
  },
  templates: {
    title: "Notification templates",
    description:
      "HTML and plain-text templates for invites, digests, and SLA alerts. Planned editor with preview and version history.",
  },
  license: {
    title: "Licences",
    description:
      "Seat counts, plan tier, renewal dates, and invoices. Pulls the same signals as the overview KPI strip once wired.",
  },
  health: {
    title: "Server health",
    description:
      "CPU, memory, queues, and dependency checks. Production parity with Product Settings → Server health.",
  },
  backup: {
    title: "Backup & restore",
    description:
      "Snapshots, retention, restore drills. Aligns with Product Settings → Backup & restore in the legacy app.",
  },
}

export function getAdminPlaceholderCopy(segment: string): {
  title: string
  description: string
} {
  return (
    adminPlaceholderCopy[segment] ?? {
      title: "Administration",
      description:
        "This area is not implemented in the mock yet. Use the overview or a built screen from the left navigation.",
    }
  )
}
