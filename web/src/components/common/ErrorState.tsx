import { Center, Paper, Group, Title, Text, Button, Stack } from '../mantine';
import { CircleAlert, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
	title?: string;
	message?: string;
	onRetry?: () => void;
	compact?: boolean;
	icon?: React.ReactNode;
}

export function ErrorState({ title = 'Der opstod en fejl', message = 'Der opstod en fejl under indlæsning af data. Prøv venligst igen senere.', onRetry, compact = false, icon = <CircleAlert size={48} color='#e03131' /> }: ErrorStateProps) {
	if (compact) {
		return (
			<Group gap='sm' align='center' p='md'>
				<CircleAlert size={24} color='#e03131' />
				<Text>{message}</Text>
				{onRetry && (
					<Button variant='outline' size='xs' leftSection={<RefreshCw size={14} />} onClick={onRetry}>
						Prøv igen
					</Button>
				)}
			</Group>
		);
	}

	return (
		<Center py='xl'>
			<Paper withBorder p='xl' radius='md' shadow='md' maw={500} w='100%'>
				<Stack align='center' gap='md'>
					{icon}
					<Title order={2} ta='center'>
						{title}
					</Title>
					<Text ta='center' c='dimmed'>
						{message}
					</Text>
					{onRetry && (
						<Button mt='md' leftSection={<RefreshCw size={16} />} onClick={onRetry}>
							Prøv igen
						</Button>
					)}
				</Stack>
			</Paper>
		</Center>
	);
}
