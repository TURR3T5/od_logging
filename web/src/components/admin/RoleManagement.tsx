import { useState, useEffect } from 'react';
import { Container, Title, Text, Box, Paper, Group, Table, Badge, Button, TextInput, ActionIcon, Modal, Divider, Loader, Center } from '@mantine/core';
import { Trash, Plus, FloppyDisk, UserPlus, UserMinus, Users, MagnifyingGlass } from '@phosphor-icons/react';
import { useAuth } from '../AuthProvider';
import { supabase } from '../../lib/supabase';
import MainLayout from '../../layouts/MainLayout';
import { notifications } from '@mantine/notifications';

interface PermissionRole {
	id: string;
	name: string;
	level: 'admin' | 'staff' | 'content' | 'viewer';
	isActive: boolean;
}

interface RolePermissionsData {
	id: string;
	admin_roles: string[];
	staff_roles: string[];
	content_roles: string[];
	viewer_roles: string[];
	created_at: string;
	updated_at: string;
	updated_by: string;
}

export default function RoleManagement() {
	const { isAuthorized, hasPermission, user } = useAuth();
	const [isLoading, setIsLoading] = useState(true);
	const [roles, setRoles] = useState<PermissionRole[]>([]);
	const [selectedRole, setSelectedRole] = useState<PermissionRole | null>(null);
	const [roleModalOpen, setRoleModalOpen] = useState(false);
	const [newRoleId, setNewRoleId] = useState('');
	const [newRoleName, setNewRoleName] = useState('');
	const [newRoleLevel, setNewRoleLevel] = useState<'admin' | 'staff' | 'content' | 'viewer'>('viewer');
	const [isSaving, setIsSaving] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');

	useEffect(() => {
		if (isAuthorized && hasPermission('admin')) {
			fetchRoles();
		} else {
			setIsLoading(false);
		}
	}, [isAuthorized]);

	const fetchRoles = async () => {
		setIsLoading(true);
		try {
			const { data, error } = await supabase.from('role_permissions').select('*').single();

			if (error) {
				console.error('Error fetching roles:', error);
				setRoles([]);
			} else if (data) {
				const transformedRoles: PermissionRole[] = [
					...data.admin_roles.map((id: string) => ({
						id,
						name: `Admin Role ${id.substring(0, 6)}...`,
						level: 'admin' as const,
						isActive: true,
					})),
					...data.staff_roles.map((id: string) => ({
						id,
						name: `Staff Role ${id.substring(0, 6)}...`,
						level: 'staff' as const,
						isActive: true,
					})),
					...data.content_roles.map((id: string) => ({
						id,
						name: `Content Role ${id.substring(0, 6)}...`,
						level: 'content' as const,
						isActive: true,
					})),
					...data.viewer_roles.map((id: string) => ({
						id,
						name: `Viewer Role ${id.substring(0, 6)}...`,
						level: 'viewer' as const,
						isActive: true,
					})),
				];

				setRoles(transformedRoles);
			}
		} catch (err) {
			console.error('Error in role fetch:', err);
			setRoles([]);
		} finally {
			setIsLoading(false);
		}
	};

	const updateRoles = async () => {
		setIsSaving(true);
		try {
			const adminRoles = roles.filter((r) => r.level === 'admin' && r.isActive).map((r) => r.id);
			const staffRoles = roles.filter((r) => r.level === 'staff' && r.isActive).map((r) => r.id);
			const contentRoles = roles.filter((r) => r.level === 'content' && r.isActive).map((r) => r.id);
			const viewerRoles = roles.filter((r) => r.level === 'viewer' && r.isActive).map((r) => r.id);

			const updatedData = {
				admin_roles: adminRoles,
				staff_roles: staffRoles,
				content_roles: contentRoles,
				viewer_roles: viewerRoles,
				updated_at: new Date().toISOString(),
				updated_by: user?.username || 'Unknown',
			};

			const { error } = await supabase.from('role_permissions').update(updatedData).eq('id', '1');
			if (error) {
				throw error;
			}

			notifications.show({
				title: 'Roles Updated',
				message: 'The permission roles have been successfully updated',
				color: 'green',
			});
		} catch (err) {
			console.error('Error updating roles:', err);
			notifications.show({
				title: 'Update Failed',
				message: 'There was an error updating the roles',
				color: 'red',
			});
		} finally {
			setIsSaving(false);
		}
	};

	const addRole = () => {
		if (!newRoleId.trim() || !newRoleName.trim()) {
			notifications.show({
				title: 'Validation Error',
				message: 'Please enter both a role ID and a name',
				color: 'red',
			});
			return;
		}

		if (!/^\d{17,19}$/.test(newRoleId)) {
			notifications.show({
				title: 'Invalid Role ID',
				message: 'Please enter a valid Discord role ID (17-19 digits)',
				color: 'red',
			});
			return;
		}

		if (roles.some((role) => role.id === newRoleId)) {
			notifications.show({
				title: 'Duplicate Role',
				message: 'This role ID already exists in the permissions',
				color: 'red',
			});
			return;
		}

		const newRole: PermissionRole = {
			id: newRoleId,
			name: newRoleName,
			level: newRoleLevel,
			isActive: true,
		};

		setRoles([...roles, newRole]);
		setNewRoleId('');
		setNewRoleName('');
		setRoleModalOpen(false);

		notifications.show({
			title: 'Role Added',
			message: `Added ${newRoleName} with ${newRoleLevel} permissions`,
			color: 'green',
		});
	};

	const removeRole = (id: string) => {
		setRoles(roles.filter((role) => role.id !== id));

		notifications.show({
			title: 'Role Removed',
			message: 'The role has been removed from permissions',
			color: 'blue',
		});
	};

	const toggleRoleStatus = (id: string) => {
		setRoles(roles.map((role) => (role.id === id ? { ...role, isActive: !role.isActive } : role)));
	};

	const changeRoleLevel = (id: string, newLevel: 'admin' | 'staff' | 'content' | 'viewer') => {
		setRoles(roles.map((role) => (role.id === id ? { ...role, level: newLevel } : role)));
	};

	const filteredRoles = roles.filter((role) => role.name.toLowerCase().includes(searchTerm.toLowerCase()) || role.id.includes(searchTerm));

	if (!isAuthorized || !hasPermission('admin')) {
		return (
			<MainLayout>
				<Container size='md' py='xl'>
					<Paper withBorder p='xl' radius='md'>
						<Title order={2} ta='center' mb='md'>
							Access Denied
						</Title>
						<Text ta='center'>You do not have permission to access the role management panel.</Text>
					</Paper>
				</Container>
			</MainLayout>
		);
	}

	if (isLoading) {
		return (
			<MainLayout>
				<Center style={{ height: 'calc(100vh - 200px)' }}>
					<Loader size='xl' />
				</Center>
			</MainLayout>
		);
	}

	return (
		<MainLayout>
			<Container size='xl' py='xl'>
				<Paper shadow='md' p='lg' radius='md' withBorder>
					<Group justify='space-between' mb='lg'>
						<Box>
							<Title order={2}>Discord Role Permissions</Title>
							<Text c='dimmed'>Manage access levels for Discord server roles</Text>
						</Box>
						<Group>
							<Button leftSection={<FloppyDisk size={16} />} onClick={updateRoles} loading={isSaving}>
								Save Changes
							</Button>
							<Button leftSection={<Plus size={16} />} variant='outline' onClick={() => setRoleModalOpen(true)}>
								Add Role
							</Button>
						</Group>
					</Group>

					<Divider my='md' />

					<Paper withBorder p='md' radius='md' mb='xl'>
						<Group justify='space-between' mb='md'>
							<Group>
								<Users size={24} />
								<Text fw={500}>Permission Levels</Text>
							</Group>
						</Group>
						<Text size='sm' mb='xs'>
							Each Discord role can be assigned one of these permission levels:
						</Text>
						<Group mb='md'>
							<Badge color='red'>Admin</Badge>
							<Text size='sm'>- Full access to all features and settings</Text>
						</Group>
						<Group mb='md'>
							<Badge color='blue'>Staff</Badge>
							<Text size='sm'>- Can manage logs, user reports, and moderate content</Text>
						</Group>
						<Group mb='md'>
							<Badge color='green'>Content</Badge>
							<Text size='sm'>- Can create and edit news, events, and some content</Text>
						</Group>
						<Group mb='md'>
							<Badge color='gray'>Viewer</Badge>
							<Text size='sm'>- Can view most pages but cannot modify content</Text>
						</Group>
					</Paper>

					<Group mb='md'>
						<TextInput placeholder='Search by role name or ID...' value={searchTerm} onChange={(e) => setSearchTerm(e.currentTarget.value)} style={{ flex: 1 }} leftSection={<MagnifyingGlass size={16} />} />
					</Group>

					<Table striped>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Role ID</Table.Th>
								<Table.Th>Role Name</Table.Th>
								<Table.Th>Permission Level</Table.Th>
								<Table.Th>Status</Table.Th>
								<Table.Th>Actions</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{filteredRoles.length > 0 ? (
								filteredRoles.map((role) => (
									<Table.Tr key={role.id}>
										<Table.Td style={{ fontFamily: 'monospace' }}>{role.id}</Table.Td>
										<Table.Td>{role.name}</Table.Td>
										<Table.Td>
											<Badge color={role.level === 'admin' ? 'red' : role.level === 'staff' ? 'blue' : role.level === 'content' ? 'green' : 'gray'}>{role.level.toUpperCase()}</Badge>
										</Table.Td>
										<Table.Td>
											<Badge color={role.isActive ? 'green' : 'red'}>{role.isActive ? 'Active' : 'Inactive'}</Badge>
										</Table.Td>
										<Table.Td>
											<Group>
												<ActionIcon variant='transparent' color={role.isActive ? 'red' : 'green'} onClick={() => toggleRoleStatus(role.id)}>
													{role.isActive ? <UserMinus size={18} /> : <UserPlus size={18} />}
												</ActionIcon>
												<ActionIcon variant='transparent' color='red' onClick={() => removeRole(role.id)}>
													<Trash size={18} />
												</ActionIcon>
											</Group>
										</Table.Td>
									</Table.Tr>
								))
							) : (
								<Table.Tr>
									<Table.Td colSpan={5} style={{ textAlign: 'center' }}>
										{searchTerm ? 'No roles match your search' : 'No roles found. Add roles to manage permissions.'}
									</Table.Td>
								</Table.Tr>
							)}
						</Table.Tbody>
					</Table>
				</Paper>

				{/* Add Role Modal */}
				<Modal opened={roleModalOpen} onClose={() => setRoleModalOpen(false)} title='Add Discord Role Permission' size='md'>
					<Box>
						<TextInput label='Discord Role ID' placeholder='Enter Discord role ID (e.g., 123456789012345678)' value={newRoleId} onChange={(e) => setNewRoleId(e.currentTarget.value)} mb='md' required />

						<TextInput label='Role Name' placeholder='Enter a recognizable name for this role' value={newRoleName} onChange={(e) => setNewRoleName(e.currentTarget.value)} mb='md' required />

						<Box mb='md'>
							<Text size='sm' mb='xs' fw={500}>
								Permission Level
							</Text>
							<Group>
								<Button.Group>
									<Button variant={newRoleLevel === 'admin' ? 'filled' : 'outline'} color='red' onClick={() => setNewRoleLevel('admin')}>
										Admin
									</Button>
									<Button variant={newRoleLevel === 'staff' ? 'filled' : 'outline'} color='blue' onClick={() => setNewRoleLevel('staff')}>
										Staff
									</Button>
									<Button variant={newRoleLevel === 'content' ? 'filled' : 'outline'} color='green' onClick={() => setNewRoleLevel('content')}>
										Content
									</Button>
									<Button variant={newRoleLevel === 'viewer' ? 'filled' : 'outline'} color='gray' onClick={() => setNewRoleLevel('viewer')}>
										Viewer
									</Button>
								</Button.Group>
							</Group>
						</Box>

						<Group justify='flex-end' mt='xl'>
							<Button variant='outline' onClick={() => setRoleModalOpen(false)}>
								Cancel
							</Button>
							<Button onClick={addRole}>Add Role</Button>
						</Group>
					</Box>
				</Modal>
			</Container>
		</MainLayout>
	);
}
