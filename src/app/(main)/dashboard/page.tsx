"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DashboardAdmin } from "@/components/dashboard-admin";
import { DashboardUser } from "@/components/dashboard-user";
import { PageHeader } from "@/components/page-header";

export default function DashboardPage() {
  const [showAdminView, setShowAdminView] = React.useState(true);

  return (
    <div className="container mx-auto px-0">
      <PageHeader
        title="Dashboard"
        description={showAdminView ? "Vista general para administradores." : "Resumen de tu actividad."}
      >
        <div className="flex items-center space-x-2">
          <Switch
            id="role-switch"
            checked={showAdminView}
            onCheckedChange={setShowAdminView}
            aria-label="Toggle admin view"
          />
          <Label htmlFor="role-switch">Vista de Administrador</Label>
        </div>
      </PageHeader>

      {showAdminView ? <DashboardAdmin /> : <DashboardUser />}
    </div>
  );
}
