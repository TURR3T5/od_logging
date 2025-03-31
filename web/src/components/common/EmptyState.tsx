import { Paper, Stack, Title, Text, Button, Group, Box } from '../mantine';
import { Folder, Plus } from '../icons';

interface EmptyStateProps {
	title?: string;
	message?: string;
	actionLabel?: string;
	onAction?: () => void;
	icon?: React.ReactNode;
	compact?: boolean;
}

export function EmptyState({ title = 'Ingen data', message = 'Der er ingen data at vise på nuværende tidspunkt.', actionLabel, onAction, icon = <Folder size={48} weight='duotone' color='#4c6ef5' />, compact = false }: EmptyStateProps) {
	if (compact) {
		return (
			<Group p='md' justify='center' gap='sm'>
				{icon && <Box style={{ transform: 'scale(0.5)' }}>{icon}</Box>}
				<Text size='sm'>{message}</Text>
				{actionLabel && onAction && (
					<Button variant='subtle' size='xs' leftSection={<Plus size={14} />} onClick={onAction}>
						{actionLabel}
					</Button>
				)}
			</Group>
		);
	}

	return (
		<Paper p='xl' withBorder radius='md'>
			<Stack align='center' gap='md' py='xl'>
				{icon}
				<Title order={3}>{title}</Title>
				<Text c='dimmed' ta='center' maw={500} mx='auto'>
					{message}
				</Text>

				{actionLabel && onAction && (
					<Button mt='md' leftSection={<Plus size={16} />} onClick={onAction}>
						{actionLabel}
					</Button>
				)}
			</Stack>
		</Paper>
	);
}
