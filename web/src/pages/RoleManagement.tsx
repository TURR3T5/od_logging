import RoleManagement from '../components/admin/RoleManagement';
import MainLayout from '../layouts/MainLayout';

export default function RoleManagementPage() {
	return (
		<MainLayout requireAuth={true} requiredPermission='admin'>
			<RoleManagement />
		</MainLayout>
	);
}
