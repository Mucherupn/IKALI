import { ControlAdminDashboard } from '@/components/control-admin-dashboard';

export default function ControlPage() {
  // SECURITY NOTE: /control is intentionally unprotected in this phase and MUST be secured with proper auth/authorization before production launch.
  return <ControlAdminDashboard />;
}
