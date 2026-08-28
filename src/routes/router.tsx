import { createBrowserRouter } from "react-router"
import { AppShell } from "@/components/layout/app-shell"
import { DashboardPage } from "@/features/dashboard/dashboard-page"
import { IncidentsListPage } from "@/features/incidents/list/incidents-list-page"
import { IncidentDetailV7Page } from "@/features/incidents/detail/incident-detail-v7-page"
import { SaraPage } from "@/features/sara/sara-page"
import { OmniSensePage } from "@/features/omnisense/omnisense-page"
import { ThreatIntelPage } from "@/features/threat-intel/threat-intel-page"
import { ThreatIntelDetailPage } from "@/features/threat-intel/detail/threat-intel-detail-page"
import { EntitiesPage } from "@/features/entities/entities-page"
import { EntityDetailPage } from "@/features/entities/detail/entity-detail-page"
import { ReportsPage } from "@/features/reports/reports-page"
import { ReportStudioPage } from "@/features/reports/studio/report-studio-page"
import { ReportComposePage } from "@/features/reports/ai/report-compose-page"
import { AutonomyPage } from "@/features/autonomy/autonomy-page"
import { DesignSystemLayout } from "@/features/design-system/design-system-layout"
import { OverviewPage as DesignOverviewPage } from "@/features/design-system/pages/overview"
import { ColorsPage as DesignColorsPage } from "@/features/design-system/pages/colors"
import { TonesPage as DesignTonesPage } from "@/features/design-system/pages/tones"
import { TypographyPage as DesignTypographyPage } from "@/features/design-system/pages/typography"
import { SpacingPage as DesignSpacingPage } from "@/features/design-system/pages/spacing"
import { IconsPage as DesignIconsPage } from "@/features/design-system/pages/icons"
import { ComponentsIndexPage } from "@/features/design-system/pages/components/_index"
import { ButtonPage as DesignButtonPage } from "@/features/design-system/pages/components/button"
import { BadgePage as DesignBadgePage } from "@/features/design-system/pages/components/badge"
import { CardPage as DesignCardPage } from "@/features/design-system/pages/components/card"
import { AvatarPage as DesignAvatarPage } from "@/features/design-system/pages/components/avatar"
import { InputPage as DesignInputPage } from "@/features/design-system/pages/components/input"
import { CheckboxPage as DesignCheckboxPage } from "@/features/design-system/pages/components/checkbox"
import { SwitchPage as DesignSwitchPage } from "@/features/design-system/pages/components/switch"
import { TabsPage as DesignTabsPage } from "@/features/design-system/pages/components/tabs"
import { TooltipPage as DesignTooltipPage } from "@/features/design-system/pages/components/tooltip"
import { PopoverPage as DesignPopoverPage } from "@/features/design-system/pages/components/popover"
import { DropdownMenuPage as DesignDropdownMenuPage } from "@/features/design-system/pages/components/dropdown-menu"
import { SkeletonPage as DesignSkeletonPage } from "@/features/design-system/pages/components/skeleton"
import { BrandPage as DesignBrandPage } from "@/features/design-system/pages/brand"
import { PatternsPage as DesignPatternsPage } from "@/features/design-system/pages/patterns"
import { LayoutsPage as DesignLayoutsPage } from "@/features/design-system/pages/layouts"
import { RulesPage as DesignRulesPage } from "@/features/design-system/pages/rules"
import { AdminLayout } from "@/features/administration-modern/admin-layout"
import { AdminOverviewPage } from "@/features/administration-modern/admin-overview-page"
import { AdminPosturePage } from "@/features/administration-modern/admin-posture-page"
import { AdminUsersPage } from "@/features/administration-modern/admin-users-page"
import { AdminGroupsPage } from "@/features/administration-modern/admin-groups-page"
import { AdminRolesPage } from "@/features/administration-modern/admin-roles-page"
import { AdminOrgPage } from "@/features/administration-modern/admin-org-page"
import { AdminLogsPage } from "@/features/administration-modern/admin-logs-page"
import { AdminSsoPage } from "@/features/administration-modern/admin-sso-page"
import { AdminSessionsPage } from "@/features/administration-modern/admin-sessions-page"
import { AdminEmailPage } from "@/features/administration-modern/admin-email-page"
import { AdminTemplatesPage } from "@/features/administration-modern/admin-templates-page"
import { AdminLicensePage } from "@/features/administration-modern/admin-license-page"
import { AdminHealthPage } from "@/features/administration-modern/admin-health-page"
import { AdminBackupPage } from "@/features/administration-modern/admin-backup-page"
import { AdminDepartmentsPage } from "@/features/administration-modern/admin-departments-page"
import { AdminTenantsPage } from "@/features/administration-modern/admin-tenants-page"
import { AdminMasterDataPage as ModernAdminMasterDataPage } from "@/features/administration-modern/admin-master-data-page"
import { AdminIncidentSetupPage } from "@/features/administration-modern/admin-incident-setup-page"
import { AdminThreatIntelSetupPage } from "@/features/administration-modern/admin-threat-intel-setup-page"
import { AdminEntitiesSetupPage } from "@/features/administration-modern/admin-entities-setup-page"
import { AdminBrandingPage } from "@/features/administration-modern/admin-branding-page"
import { AdminAutomationPage } from "@/features/administration-modern/admin-automation-page"
import { AdminSaraQueuePage } from "@/features/administration-modern/admin-sara-queue-page"
import { AdminPreIngestionRulesPage } from "@/features/administration-modern/admin-preingestion-rules-page"
// New (old-SIRP-aligned) administration module.
import { AdminLayout as NewAdminLayout } from "@/features/administration/admin-layout"
import { AdminOverviewPage as NewAdminOverviewPage } from "@/features/administration/admin-overview-page"
import { AdminMasterDataPage } from "@/features/administration/admin-master-data-page"
import { LoginPage } from "@/features/auth/login-page"
import { NotFoundPage } from "./not-found-page"

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  // Full-bleed — own top bar, no app sidebar/topbar, so it needs to be a
  // sibling of the AppShell layout route rather than nested under it.
  { path: "/reports/studio", element: <ReportStudioPage /> },
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "incidents", element: <IncidentsListPage /> },
      { path: "incidents/:id", element: <IncidentDetailV7Page /> },
      { path: "sara", element: <SaraPage /> },
      { path: "omnisense", element: <OmniSensePage /> },
      { path: "threat-intel", element: <ThreatIntelPage /> },
      { path: "threat-intel/:id", element: <ThreatIntelDetailPage /> },
      { path: "entities", element: <EntitiesPage /> },
      { path: "entities/:id", element: <EntityDetailPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "reports/new", element: <ReportComposePage /> },
      { path: "reports/:tab", element: <ReportsPage /> },
      { path: "autonomy", element: <AutonomyPage /> },
      { path: "autonomy/:tab", element: <AutonomyPage /> },
      {
        path: "design-system",
        element: <DesignSystemLayout />,
        children: [
          { index: true,             element: <DesignOverviewPage /> },
          { path: "colors",          element: <DesignColorsPage /> },
          { path: "tones",           element: <DesignTonesPage /> },
          { path: "typography",      element: <DesignTypographyPage /> },
          { path: "spacing",         element: <DesignSpacingPage /> },
          { path: "icons",           element: <DesignIconsPage /> },
          { path: "components",                  element: <ComponentsIndexPage /> },
          { path: "components/button",           element: <DesignButtonPage /> },
          { path: "components/badge",            element: <DesignBadgePage /> },
          { path: "components/card",             element: <DesignCardPage /> },
          { path: "components/avatar",           element: <DesignAvatarPage /> },
          { path: "components/input",            element: <DesignInputPage /> },
          { path: "components/checkbox",         element: <DesignCheckboxPage /> },
          { path: "components/switch",           element: <DesignSwitchPage /> },
          { path: "components/tabs",             element: <DesignTabsPage /> },
          { path: "components/tooltip",          element: <DesignTooltipPage /> },
          { path: "components/popover",          element: <DesignPopoverPage /> },
          { path: "components/dropdown-menu",    element: <DesignDropdownMenuPage /> },
          { path: "components/skeleton",         element: <DesignSkeletonPage /> },
          { path: "brand",           element: <DesignBrandPage /> },
          { path: "patterns",        element: <DesignPatternsPage /> },
          { path: "layouts",         element: <DesignLayoutsPage /> },
          { path: "rules",           element: <DesignRulesPage /> },
        ],
      },
      // Primary /admin — old-SIRP-aligned 7-tab structure with v3 chemistry.
      // Sub-pages with detailed UI reuse the existing v3 components from
      // administration-modern; the rest render a placeholder so the IA is
      // fully navigable.
      {
        path: "admin",
        element: <NewAdminLayout />,
        children: [
          { index: true, element: <NewAdminOverviewPage /> },

          // ── Organization tab — 4 sub-pages matching old SIRP ──
          { path: "organization/information", element: <AdminOrgPage /> },
          { path: "organization/tenants",     element: <AdminTenantsPage /> },
          { path: "organization/:page",       element: <AdminMasterDataPage /> },

          // ── Entities tab ──
          { path: "entities/departments", element: <AdminDepartmentsPage /> },
          { path: "entities/:page", element: <AdminMasterDataPage /> },

          // ── Incident Management tab ──
          { path: "incident-management/categories", element: <AdminIncidentSetupPage /> },
          { path: "incident-management/:page", element: <AdminMasterDataPage /> },

          // ── Threat Intelligence tab ──
          { path: "threat-intelligence/categories", element: <AdminThreatIntelSetupPage /> },
          { path: "threat-intelligence/:page", element: <AdminMasterDataPage /> },

          // ── Access Control tab ──
          { path: "access-control/users", element: <AdminUsersPage /> },
          { path: "access-control/groups", element: <AdminGroupsPage /> },
          { path: "access-control/roles", element: <AdminRolesPage /> },
          { path: "access-control/sso", element: <AdminSsoPage /> },
          { path: "access-control/session-policy", element: <AdminSessionsPage /> },
          { path: "access-control/:page", element: <AdminMasterDataPage /> },

          // ── Product Settings tab ──
          { path: "product-settings/license", element: <AdminLicensePage /> },
          { path: "product-settings/backup", element: <AdminBackupPage /> },
          { path: "product-settings/email", element: <AdminEmailPage /> },
          { path: "product-settings/templates", element: <AdminTemplatesPage /> },
          { path: "product-settings/server-health", element: <AdminHealthPage /> },
          { path: "product-settings/:page", element: <AdminMasterDataPage /> },

          // ── Logs tab ──
          { path: "logs/activity", element: <AdminLogsPage /> },
          { path: "logs/:page", element: <AdminMasterDataPage /> },
        ],
      },

      // Preserved v3 "modern" admin redesign (4-group sidebar IA).
      // Lives at /admin-modern. The primary /admin route above uses a
      // structure closer to old SIRP's 7-tab layout.
      {
        path: "admin-modern",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminOverviewPage /> },
          // Workspace
          { path: "org", element: <AdminOrgPage /> },
          { path: "branding", element: <AdminBrandingPage /> },
          { path: "departments", element: <AdminDepartmentsPage /> },
          { path: "tenants", element: <AdminTenantsPage /> },
          { path: "license", element: <AdminLicensePage /> },
          // Identity & Access
          { path: "users", element: <AdminUsersPage /> },
          { path: "groups", element: <AdminGroupsPage /> },
          { path: "roles", element: <AdminRolesPage /> },
          { path: "sso", element: <AdminSsoPage /> },
          { path: "sessions", element: <AdminSessionsPage /> },
          { path: "posture", element: <AdminPosturePage /> },
          // Product configuration
          { path: "products/incidents",    element: <AdminIncidentSetupPage /> },
          { path: "products/threat-intel", element: <AdminThreatIntelSetupPage /> },
          { path: "products/entities",     element: <AdminEntitiesSetupPage /> },
          // Automation
          { path: "automation", element: <AdminAutomationPage /> },
          { path: "pre-ingestion-rules", element: <AdminPreIngestionRulesPage /> },
          // Sara operator
          { path: "sara-queue", element: <AdminSaraQueuePage /> },
          // Platform
          { path: "health", element: <AdminHealthPage /> },
          { path: "backup", element: <AdminBackupPage /> },
          { path: "email", element: <AdminEmailPage /> },
          { path: "templates", element: <AdminTemplatesPage /> },
          { path: "logs", element: <AdminLogsPage /> },
          // Legacy aliases (kept so any old bookmarks still work)
          { path: "master-data", element: <ModernAdminMasterDataPage /> },
          { path: "incident-setup", element: <AdminIncidentSetupPage /> },
          { path: "threat-intel-setup", element: <AdminThreatIntelSetupPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
])
