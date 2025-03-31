import { useState, useEffect } from 'react';
import { Container, Title, Text, Box, Paper, Group, Table, Badge, Button, TextInput, ActionIcon, Modal, Divider, Loader, Center, Tabs } from '@mantine/core';
import { Trash, Plus, FloppyDisk, UserPlus, UserMinus, Users, MagnifyingGlass, At } from '@phosphor-icons/react';
import { useAuth } from '../AuthProvider';
import { supabase } from '../../lib/supabase';
import MainLayout from '../../layouts/MainLayout';
import { notifications } from '@mantine/notifications';
import { usePermission } from '../../hooks/usePermissions';

interface PermissionRole {
	id: string;
	name: string;
	level: 'admin' | 'staff' | 'content' | 'viewer';
	isActive: boolean;
}

interface EmailRole {
	id: string;
	email: string;
	role: 'admin' | 'staff' | 'content' | 'viewer';
	created_at: string;
}

export default function RoleManagement() {
	const { user } = useAuth();
	const { hasPermission: isAuthorized, isChecking: checkingPermission } = usePermission('admin');
	const [isLoading, setIsLoading] = useState(true);
	const [roles, setRoles] = useState<PermissionRole[]>([]);
	const [emailRoles, setEmailRoles] = useState<EmailRole[]>([]);
	const [roleModalOpen, setRoleModalOpen] = useState(false);
	const [emailRoleModalOpen, setEmailRoleModalOpen] = useState(false);
	const [newRoleId, setNewRoleId] = useState('');
	const [newRoleName, setNewRoleName] = useState('');
	const [newRoleLevel, setNewRoleLevel] = useState<'admin' | 'staff' | 'content' | 'viewer'>('viewer');
	const [newEmail, setNewEmail] = useState('');
	const [newEmailRole, setNewEmailRole] = useState<'admin' | 'staff' | 'content' | 'viewer'>('viewer');
	const [isSaving, setIsSaving] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [activeTab, setActiveTab] = useState<string | null>('discord');

	useEffect(() => {
		const checkPermission = async () => {
			if (isAuthorized && (await usePermission('admin'))) {
				fetchRoles();
				fetchEmailRoles();
			} else {
				setIsLoading(false);
			}
		};
		checkPermission();
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

	const fetchEmailRoles = async () => {
		try {
			const { data, error } = await supabase.from('user_roles').select('*').order('created_at', { ascending: false });

			if (error) {
				console.error('Error fetching email roles:', error);
				setEmailRoles([]);
			} else {
				setEmailRoles(data || []);
			}
		} catch (err) {
			console.error('Error fetching email roles:', err);
			setEmailRoles([]);
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

	const addEmailRole = async () => {
		if (!newEmail.trim() || !newEmail.includes('@')) {
			notifications.show({
				title: 'Validation Error',
				message: 'Please enter a valid email address',
				color: 'red',
			});
			return;
		}

		if (emailRoles.some((r) => r.email.toLowerCase() === newEmail.toLowerCase())) {
			notifications.show({
				title: 'Duplicate Email',
				message: 'This email already has an assigned role',
				color: 'red',
			});
			return;
		}

		setIsSaving(true);
		try {
			const { error } = await supabase.from('user_roles').insert({
				email: newEmail,
				role: newEmailRole,
			});

			if (error) throw error;

			notifications.show({
				title: 'Email Role Added',
				message: `Added ${newEmail} with ${newEmailRole} permissions`,
				color: 'green',
			});

			setNewEmail('');
			setEmailRoleModalOpen(false);
			fetchEmailRoles();
		} catch (err) {
			console.error('Error adding email role:', err);
			notifications.show({
				title: 'Error',
				message: 'Failed to add email role',
				color: 'red',
			});
		} finally {
			setIsSaving(false);
		}
	};

	const removeRole = (id: string) => {
		setRoles(roles.filter((role) => role.id !== id));

		notifications.show({
			title: 'Role Removed',
			message: 'The role has been removed from permissions',
			color: 'blue',
		});
	};

	const removeEmailRole = async (id: string) => {
		try {
			const { error } = await supabase.from('user_roles').delete().eq('id', id);

			if (error) throw error;

			notifications.show({
				title: 'Email Role Removed',
				message: 'The email role assignment has been removed',
				color: 'blue',
			});

			fetchEmailRoles();
		} catch (err) {
			console.error('Error removing email role:', err);
			notifications.show({
				title: 'Error',
				message: 'Failed to remove email role',
				color: 'red',
			});
		}
	};

	const toggleRoleStatus = (id: string) => {
		setRoles(roles.map((role) => (role.id === id ? { ...role, isActive: !role.isActive } : role)));
	};

	const updateEmailRole = async (id: string, newRole: 'admin' | 'staff' | 'content' | 'viewer') => {
		try {
			const { error } = await supabase.from('user_roles').update({ role: newRole }).eq('id', id);

			if (error) throw error;

			notifications.show({
				title: 'Role Updated',
				message: 'The email role has been updated successfully',
				color: 'green',
			});

			fetchEmailRoles();
		} catch (err) {
			console.error('Error updating email role:', err);
			notifications.show({
				title: 'Error',
				message: 'Failed to update email role',
				color: 'red',
			});
		}
	};

	const filteredRoles = roles.filter((role) => role.name.toLowerCase().includes(searchTerm.toLowerCase()) || role.id.includes(searchTerm));
	const filteredEmailRoles = emailRoles.filter((role) => role.email.toLowerCase().includes(searchTerm.toLowerCase()));

	if (!isAuthorized) {
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

	if (isLoading || checkingPermission) {
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
							<Title order={2}>Role Management</Title>
							<Text c='dimmed'>Manage access levels for Discord server roles and email-based roles</Text>
						</Box>
					</Group>

					<Tabs value={activeTab} onChange={setActiveTab}>
						<Tabs.List mb='lg'>
							<Tabs.Tab value='discord' leftSection={<Users size={16} />}>
								Discord Roles
							</Tabs.Tab>
							<Tabs.Tab value='email' leftSection={<At size={16} />}>
								Email Roles
							</Tabs.Tab>
						</Tabs.List>

						<Tabs.Panel value='discord'>
							<Group justify='space-between' mb='lg'>
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
						</Tabs.Panel>

						<Tabs.Panel value='email'>
							<Group justify='space-between' mb='lg'>
								<Box>
									<Text size='lg' fw={500}>
										Email-Based Permissions
									</Text>
									<Text size='sm' c='dimmed'>
										Assign permission levels directly to email addresses. Users will automatically get these permissions when they sign up.
									</Text>
								</Box>
								<Button leftSection={<Plus size={16} />} onClick={() => setEmailRoleModalOpen(true)}>
									Add Email Role
								</Button>
							</Group>

							<Group mb='md'>
								<TextInput placeholder='Search by email...' value={searchTerm} onChange={(e) => setSearchTerm(e.currentTarget.value)} style={{ flex: 1 }} leftSection={<MagnifyingGlass size={16} />} />
							</Group>

							<Table striped>
								<Table.Thead>
									<Table.Tr>
										<Table.Th>Email</Table.Th>
										<Table.Th>Role</Table.Th>
										<Table.Th>Added On</Table.Th>
										<Table.Th>Actions</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{filteredEmailRoles.length > 0 ? (
										filteredEmailRoles.map((role) => (
											<Table.Tr key={role.id}>
												<Table.Td>{role.email}</Table.Td>
												<Table.Td>
													<Badge color={role.role === 'admin' ? 'red' : role.role === 'staff' ? 'blue' : role.role === 'content' ? 'green' : 'gray'}>{role.role.toUpperCase()}</Badge>
												</Table.Td>
												<Table.Td>{new Date(role.created_at).toLocaleDateString()}</Table.Td>
												<Table.Td>
													<Group>
														<select value={role.role} onChange={(e) => updateEmailRole(role.id, e.target.value as any)} style={{ padding: '4px', borderRadius: '4px' }}>
															<option value='admin'>Admin</option>
															<option value='staff'>Staff</option>
															<option value='content'>Content</option>
															<option value='viewer'>Viewer</option>
														</select>
														<ActionIcon variant='transparent' color='red' onClick={() => removeEmailRole(role.id)}>
															<Trash size={18} />
														</ActionIcon>
													</Group>
												</Table.Td>
											</Table.Tr>
										))
									) : (
										<Table.Tr>
											<Table.Td colSpan={4} style={{ textAlign: 'center' }}>
												{searchTerm ? 'No email roles match your search' : 'No email roles found. Add email roles to manage permissions.'}
											</Table.Td>
										</Table.Tr>
									)}
								</Table.Tbody>
							</Table>
						</Tabs.Panel>
					</Tabs>
				</Paper>

				{/* Add Discord Role Modal */}
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

				{/* Add Email Role Modal */}
				<Modal opened={emailRoleModalOpen} onClose={() => setEmailRoleModalOpen(false)} title='Add Email Role Permission' size='md'>
					<Box>
						<TextInput label='Email Address' placeholder='Enter email address to assign role' value={newEmail} onChange={(e) => setNewEmail(e.currentTarget.value)} mb='md' required type='email' />

						<Box mb='md'>
							<Text size='sm' mb='xs' fw={500}>
								Permission Level
							</Text>
							<Group>
								<Button.Group>
									<Button variant={newEmailRole === 'admin' ? 'filled' : 'outline'} color='red' onClick={() => setNewEmailRole('admin')}>
										Admin
									</Button>
									<Button variant={newEmailRole === 'staff' ? 'filled' : 'outline'} color='blue' onClick={() => setNewEmailRole('staff')}>
										Staff
									</Button>
									<Button variant={newEmailRole === 'content' ? 'filled' : 'outline'} color='green' onClick={() => setNewEmailRole('content')}>
										Content
									</Button>
									<Button variant={newEmailRole === 'viewer' ? 'filled' : 'outline'} color='gray' onClick={() => setNewEmailRole('viewer')}>
										Viewer
									</Button>
								</Button.Group>
							</Group>
						</Box>

						<Group justify='flex-end' mt='xl'>
							<Button variant='outline' onClick={() => setEmailRoleModalOpen(false)}>
								Cancel
							</Button>
							<Button onClick={addEmailRole} loading={isSaving}>
								Add Email Role
							</Button>
						</Group>
					</Box>
				</Modal>
			</Container>
		</MainLayout>
	);
}
