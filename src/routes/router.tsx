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
import { AutonomyPage } from "@/features/autonomy/autonomy-page"
import { DesignSystemPage } from "@/features/design-system/design-system-page"
import { AdminLayout } from "@/features/administration/admin-layout"
import { AdminOverviewPage } from "@/features/administration/admin-overview-page"
import { AdminPosturePage } from "@/features/administration/admin-posture-page"
import { AdminUsersPage } from "@/features/administration/admin-users-page"
import { AdminGroupsPage } from "@/features/administration/admin-groups-page"
import { AdminRolesPage } from "@/features/administration/admin-roles-page"
import { AdminOrgPage } from "@/features/administration/admin-org-page"
import { AdminLogsPage } from "@/features/administration/admin-logs-page"
import { AdminSsoPage } from "@/features/administration/admin-sso-page"
import { AdminSessionsPage } from "@/features/administration/admin-sessions-page"
import { AdminEmailPage } from "@/features/administration/admin-email-page"
import { AdminTemplatesPage } from "@/features/administration/admin-templates-page"
import { AdminLicensePage } from "@/features/administration/admin-license-page"
import { AdminHealthPage } from "@/features/administration/admin-health-page"
import { AdminBackupPage } from "@/features/administration/admin-backup-page"
import { AdminDepartmentsPage } from "@/features/administration/admin-departments-page"
import { AdminTenantsPage } from "@/features/administration/admin-tenants-page"
import { AdminMasterDataPage } from "@/features/administration/admin-master-data-page"
import { AdminIncidentSetupPage } from "@/features/administration/admin-incident-setup-page"
import { AdminThreatIntelSetupPage } from "@/features/administration/admin-threat-intel-setup-page"
import { LoginPage } from "@/features/auth/login-page"
import { NotFoundPage } from "./not-found-page"

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
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
      { path: "autonomy", element: <AutonomyPage /> },
      { path: "autonomy/:tab", element: <AutonomyPage /> },
      { path: "design-system", element: <DesignSystemPage /> },
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminOverviewPage /> },
          { path: "posture", element: <AdminPosturePage /> },
          { path: "users", element: <AdminUsersPage /> },
          { path: "groups", element: <AdminGroupsPage /> },
          { path: "roles", element: <AdminRolesPage /> },
          { path: "org", element: <AdminOrgPage /> },
          { path: "logs", element: <AdminLogsPage /> },
          { path: "sso", element: <AdminSsoPage /> },
          { path: "sessions", element: <AdminSessionsPage /> },
          { path: "email", element: <AdminEmailPage /> },
          { path: "templates", element: <AdminTemplatesPage /> },
          { path: "license", element: <AdminLicensePage /> },
          { path: "health", element: <AdminHealthPage /> },
          { path: "backup", element: <AdminBackupPage /> },
          { path: "departments", element: <AdminDepartmentsPage /> },
          { path: "tenants", element: <AdminTenantsPage /> },
          { path: "master-data", element: <AdminMasterDataPage /> },
          { path: "incident-setup", element: <AdminIncidentSetupPage /> },
          { path: "threat-intel-setup", element: <AdminThreatIntelSetupPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
])
