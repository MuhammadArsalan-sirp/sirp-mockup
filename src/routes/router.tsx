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
import { AdminLayout } from "@/features/administration/admin-layout"
import { AdminOverviewPage } from "@/features/administration/admin-overview-page"
import { AdminUsersPage } from "@/features/administration/admin-users-page"
import { AdminGroupsPage } from "@/features/administration/admin-groups-page"
import { AdminRolesPage } from "@/features/administration/admin-roles-page"
import { AdminOrgPage } from "@/features/administration/admin-org-page"
import { AdminLogsPage } from "@/features/administration/admin-logs-page"
import { AdminPlaceholderPage } from "@/features/administration/admin-placeholder-page"
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
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminOverviewPage /> },
          { path: "users", element: <AdminUsersPage /> },
          { path: "groups", element: <AdminGroupsPage /> },
          { path: "roles", element: <AdminRolesPage /> },
          { path: "org", element: <AdminOrgPage /> },
          { path: "logs", element: <AdminLogsPage /> },
          { path: "departments", element: <AdminPlaceholderPage /> },
          { path: "tenants", element: <AdminPlaceholderPage /> },
          { path: "incident-setup", element: <AdminPlaceholderPage /> },
          { path: "threat-intel-setup", element: <AdminPlaceholderPage /> },
          { path: "master-data", element: <AdminPlaceholderPage /> },
          { path: "sso", element: <AdminPlaceholderPage /> },
          { path: "sessions", element: <AdminPlaceholderPage /> },
          { path: "email", element: <AdminPlaceholderPage /> },
          { path: "templates", element: <AdminPlaceholderPage /> },
          { path: "license", element: <AdminPlaceholderPage /> },
          { path: "health", element: <AdminPlaceholderPage /> },
          { path: "backup", element: <AdminPlaceholderPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
])
