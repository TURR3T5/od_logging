import { Container, Title } from '../components/mantine';
import MainLayout from '../layouts/MainLayout';
import DiscordBotDebug from '../components/debug/DiscordBotDebug';

export default function DiscordBotTestPage() {
	return (
		<MainLayout requireAuth={true} requiredPermission='admin'>
			<Container size='xl' py='xl'>
				<Title order={1} mb='xl'>
					Discord Bot Test Page
				</Title>
				<DiscordBotDebug />
			</Container>
		</MainLayout>
	);
}
