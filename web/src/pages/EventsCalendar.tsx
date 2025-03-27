import { Container, Title, Text, Box } from '@mantine/core';
import MainLayout from '../layouts/MainLayout';

export default function EventsCalendarPage() {
	return (
		<MainLayout requireAuth={false}>
			<Container size='xl' py='xl'>
				<Title order={1} mb='md'>
					Begivenheder Kalender
				</Title>
				<Text c='dimmed' mb='xl'>
					Hold dig opdateret med kommende begivenheder på OdessaRP
				</Text>

				<Box py='xl'>
					<Title order={2} ta='center'>
						Under Udvikling
					</Title>
					<Text ta='center' mt='md'>
						Begivenheder kalenderen er under udvikling. Besøg venligst vores Discord for at se kommende begivenheder.
					</Text>
				</Box>
			</Container>
		</MainLayout>
	);
}
