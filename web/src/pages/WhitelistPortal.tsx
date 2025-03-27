import { Container, Title, Text, Box } from '@mantine/core';
import MainLayout from '../layouts/MainLayout';

export default function WhitelistApplicationPage() {
	return (
		<MainLayout requireAuth={false}>
			<Container size='xl' py='xl'>
				<Title order={1} mb='md'>
					Whitelist Ansøgning
				</Title>
				<Text c='dimmed' mb='xl'>
					Ansøg om at blive whitelisted på OdessaRP serveren
				</Text>

				<Box py='xl'>
					<Title order={2} ta='center'>
						Under Udvikling
					</Title>
					<Text ta='center' mt='md'>
						Whitelist ansøgningsportalen er under udvikling. Besøg venligst vores Discord for at ansøge.
					</Text>
				</Box>
			</Container>
		</MainLayout>
	);
}
