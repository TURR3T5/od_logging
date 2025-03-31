import { useMemo } from 'react';
import { Box, Group, Text, Badge, Modal } from '../components/mantine';
import { format } from 'date-fns';
import { Log } from '../pages/Logs';

interface LogDetailsModalProps {
	opened: boolean;
	onClose: () => void;
	selectedLog: Log | null;
}

export function LogDetailsModal({ opened, onClose, selectedLog }: LogDetailsModalProps) {
	const formattedDetails = useMemo(() => {
		if (!selectedLog) return '';

		try {
			return typeof selectedLog.details === 'object' ? JSON.stringify(selectedLog.details, null, 2) : String(selectedLog.details || '');
		} catch (e) {
			console.error('Error formatting log details:', e);
			return '';
		}
	}, [selectedLog]);

	if (!selectedLog) return null;

	return (
		<Modal opened={opened} onClose={onClose} title={<Text fw={700}>Log Details</Text>} size='lg'>
			<Box mb='md'>
				<Group mb='xs'>
					<Text fw={500}>Category:</Text>
					<Badge color='indigo'>{selectedLog.category || 'N/A'}</Badge>
				</Group>

				<Group mb='xs'>
					<Text fw={500}>Type:</Text>
					<Badge color='teal'>{selectedLog.type || 'N/A'}</Badge>
				</Group>

				<Group mb='xs'>
					<Text fw={500}>Event Type:</Text>
					<Badge color='blue'>{selectedLog.event_type}</Badge>
				</Group>

				<Group mb='xs'>
					<Text fw={500}>Player:</Text>
					<Text>{selectedLog.player_name || 'System'}</Text>
				</Group>

				<Group mb='xs'>
					<Text fw={500}>Server ID:</Text>
					<Text>{selectedLog.server_id || 'N/A'}</Text>
				</Group>

				<Group mb='xs'>
					<Text fw={500}>Steam ID:</Text>
					<Text>{selectedLog.player_id || 'N/A'}</Text>
				</Group>

				<Group mb='xs'>
					<Text fw={500}>Discord ID:</Text>
					<Text>{selectedLog.discord_id || 'N/A'}</Text>
				</Group>

				<Group mb='xs'>
					<Text fw={500}>Time:</Text>
					<Text>{selectedLog.created_at ? format(new Date(selectedLog.created_at), 'MMM d, yyyy HH:mm:ss') : 'Unknown'}</Text>
				</Group>
			</Box>

			<Text fw={500} mb='xs'>
				Details:
			</Text>
			<Box
				style={(theme) => ({
					fontFamily: 'monospace',
					whiteSpace: 'pre-wrap',
					maxHeight: '400px',
					overflow: 'auto',
					backgroundColor: theme.colors.dark[7],
					padding: theme.spacing.md,
					borderRadius: theme.radius.sm,
					fontSize: theme.fontSizes.sm,
				})}
			>
				{formattedDetails}
			</Box>
		</Modal>
	);
}
