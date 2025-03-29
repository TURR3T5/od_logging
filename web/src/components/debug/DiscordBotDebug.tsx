import { useState } from 'react';
import { Paper, Title, Text, Group, Button, TextInput, Code, Accordion, Divider, Alert, Badge } from '@mantine/core';
import { useAuth } from '../AuthProvider';
import discordBotService from '../../lib/discordBot';

export default function DiscordBotDebug() {
	const { user } = useAuth();
	const [isTestingBot, setIsTestingBot] = useState(false);
	const [botTestResult, setBotTestResult] = useState<any>(null);
	const [userIdToTest, setUserIdToTest] = useState<string>('');
	const [userRoles, setUserRoles] = useState<string[] | null>(null);
	const [guildDetails, setGuildDetails] = useState<any>(null);
	const [syncStatus, setSyncStatus] = useState<{ success: boolean; message: string } | null>(null);

	const testBotAccess = async () => {
		setIsTestingBot(true);
		try {
			const result = await discordBotService.testBotAccess();
			setBotTestResult({
				success: result,
				message: result ? 'Bot access successful' : 'Bot access failed',
			});
		} catch (error) {
			console.error('Error during bot test:', error);
			setBotTestResult({
				success: false,
				message: `Error: ${error instanceof Error ? error.message : String(error)}`,
			});
		} finally {
			setIsTestingBot(false);
		}
	};

	const getUserRoles = async () => {
		if (!userIdToTest.trim()) {
			if (user?.provider_id) {
				setUserIdToTest(user.provider_id);
			} else {
				setUserRoles(null);
				return;
			}
		}

		try {
			const roles = await discordBotService.getMemberRoles(userIdToTest);
			setUserRoles(roles);
		} catch (error) {
			console.error('Error fetching user roles:', error);
			setUserRoles(null);
		}
	};

	const getGuildInfo = async () => {
		try {
			const details = await discordBotService.getGuildDetails();
			setGuildDetails(details);
		} catch (error) {
			console.error('Error fetching guild details:', error);
			setGuildDetails(null);
		}
	};

	const testSyncUserRoles = async () => {
		if (!userIdToTest.trim()) {
			if (user?.provider_id) {
				setUserIdToTest(user.provider_id);
			} else {
				setSyncStatus({
					success: false,
					message: 'No user ID provided',
				});
				return;
			}
		}

		try {
			const success = await discordBotService.syncUserRoles(userIdToTest);
			setSyncStatus({
				success,
				message: success ? `Successfully synced roles for user ${userIdToTest}` : `Failed to sync roles for user ${userIdToTest}`,
			});
		} catch (error) {
			console.error('Error syncing user roles:', error);
			setSyncStatus({
				success: false,
				message: `Error: ${error instanceof Error ? error.message : String(error)}`,
			});
		}
	};

	return (
		<Paper p='md' withBorder>
			<Title order={3} mb='md'>
				Discord Bot Debug Panel
			</Title>
			<Text mb='md' color='dimmed' size='sm'>
				This panel is for testing and debugging Discord bot functionality. Be careful when testing on a production server.
			</Text>

			<Alert title='⚠️ Debug Mode' color='yellow' mb='md'>
				This panel should only be visible to administrators and never in production.
			</Alert>

			{!discordBotService.isConfigured() && (
				<Alert title='Missing Configuration' color='red' mb='md'>
					Discord bot token is not configured. Please check your environment variables.
				</Alert>
			)}

			<Accordion>
				<Accordion.Item value='bot-test'>
					<Accordion.Control>
						<Group>
							<Text>Test Bot Access</Text>
							{botTestResult && <Badge color={botTestResult.success ? 'green' : 'red'}>{botTestResult.success ? 'Success' : 'Failed'}</Badge>}
						</Group>
					</Accordion.Control>
					<Accordion.Panel>
						<Text mb='md'>Test if the bot can access the Discord server.</Text>
						<Button onClick={testBotAccess} loading={isTestingBot} disabled={!discordBotService.isConfigured()} mb='md'>
							Test Bot Access
						</Button>

						{botTestResult && <Code block>{JSON.stringify(botTestResult, null, 2)}</Code>}
					</Accordion.Panel>
				</Accordion.Item>

				<Accordion.Item value='guild-info'>
					<Accordion.Control>Guild Information</Accordion.Control>
					<Accordion.Panel>
						<Text mb='md'>Fetch detailed information about the Discord server.</Text>
						<Button onClick={getGuildInfo} disabled={!discordBotService.isConfigured()} mb='md'>
							Get Guild Details
						</Button>

						{guildDetails && (
							<Code block style={{ maxHeight: '400px', overflow: 'auto' }}>
								{JSON.stringify(
									{
										id: guildDetails.id,
										name: guildDetails.name,
										icon: guildDetails.icon,
										approximate_member_count: guildDetails.approximate_member_count,
										approximate_presence_count: guildDetails.approximate_presence_count,
										roles: guildDetails.roles.map((r: any) => ({
											id: r.id,
											name: r.name,
											position: r.position,
											color: r.color,
											hoist: r.hoist,
											managed: r.managed,
											mentionable: r.mentionable,
										})),
									},
									null,
									2
								)}
							</Code>
						)}
					</Accordion.Panel>
				</Accordion.Item>

				<Accordion.Item value='user-roles'>
					<Accordion.Control>
						<Group>
							<Text>Get User Roles</Text>
							{userRoles !== null && <Badge color={userRoles.length > 0 ? 'blue' : 'gray'}>{userRoles.length} roles</Badge>}
						</Group>
					</Accordion.Control>
					<Accordion.Panel>
						<Text mb='md'>Check the Discord roles for a specific user.</Text>
						<Group mb='md'>
							<TextInput label='Discord User ID' placeholder={user?.provider_id || 'Enter Discord user ID'} value={userIdToTest} onChange={(e) => setUserIdToTest(e.currentTarget.value)} style={{ flex: 1 }} />
							<Button onClick={getUserRoles} disabled={!discordBotService.isConfigured()} style={{ marginTop: 'auto' }}>
								Get Roles
							</Button>
						</Group>

						{userRoles !== null && <Code block>{JSON.stringify(userRoles, null, 2)}</Code>}
					</Accordion.Panel>
				</Accordion.Item>

				<Accordion.Item value='sync-roles'>
					<Accordion.Control>
						<Group>
							<Text>Sync User Roles to Database</Text>
							{syncStatus && <Badge color={syncStatus.success ? 'green' : 'red'}>{syncStatus.success ? 'Success' : 'Failed'}</Badge>}
						</Group>
					</Accordion.Control>
					<Accordion.Panel>
						<Text mb='md'>Test syncing a user's Discord roles to the database.</Text>
						<Group mb='md'>
							<TextInput label='Discord User ID' placeholder={user?.provider_id || 'Enter Discord user ID'} value={userIdToTest} onChange={(e) => setUserIdToTest(e.currentTarget.value)} style={{ flex: 1 }} />
							<Button onClick={testSyncUserRoles} disabled={!discordBotService.isConfigured()} style={{ marginTop: 'auto' }}>
								Sync Roles
							</Button>
						</Group>

						{syncStatus && (
							<Alert color={syncStatus.success ? 'green' : 'red'} title={syncStatus.success ? 'Sync Successful' : 'Sync Failed'}>
								{syncStatus.message}
							</Alert>
						)}
					</Accordion.Panel>
				</Accordion.Item>
			</Accordion>

			<Divider my='md' />

			<Group justify='flex-end'>
				<Text size='xs' c='dimmed'>
					Current user ID: {user?.provider_id || 'Not logged in'}
				</Text>
			</Group>
		</Paper>
	);
}
