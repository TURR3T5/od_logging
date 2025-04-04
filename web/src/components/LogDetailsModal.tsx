import { Box, Group, Text, Badge, Modal } from '@mantine/core';
import { format } from 'date-fns';
import { Log } from '../pages/Logs';

interface LogDetailsModalProps {
	opened: boolean;
	onClose: () => void;
	selectedLog: Log | null;
}

export function LogDetailsModal({ opened, onClose, selectedLog }: LogDetailsModalProps) {
	const formattedDetails = selectedLog
		? (() => {
				try {
					return typeof selectedLog.details === 'object' ? JSON.stringify(selectedLog.details, null, 2) : String(selectedLog.details || '');
				} catch (e) {
					console.error('Error formatting log details:', e);
					return '';
				}
		  })()
		: '';

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
					<Text fw={500}>Event:</Text>
					<Badge color='blue'>{selectedLog.event}</Badge>
				</Group>

				<Group mb='xs'>
					<Text fw={500}>Source:</Text>
					<Text>{selectedLog.source || 'N/A'}</Text>
				</Group>

				<Group mb='xs'>
					<Text fw={500}>Transaction ID (Steam):</Text>
					<Text>{selectedLog.txname || 'N/A'}</Text>
				</Group>

				<Group mb='xs'>
					<Text fw={500}>Character Name:</Text>
					<Text>{selectedLog.charname || 'N/A'}</Text>
				</Group>

				<Group mb='xs'>
					<Text fw={500}>Citizen ID:</Text>
					<Text>{selectedLog.citizenid || 'N/A'}</Text>
				</Group>

				<Group mb='xs'>
					<Text fw={500}>Discord ID:</Text>
					<Text>{selectedLog.discord || 'N/A'}</Text>
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
					backgroundColor: theme.colors.dark[8],
					padding: theme.spacing.md,
					borderRadius: theme.radius.sm,
					border: `1px solid ${theme.colors.dark[6]}`,
					fontSize: theme.fontSizes.sm,
				})}
			>
				{formattedDetails}
			</Box>
		</Modal>
	);
}

export default LogDetailsModal;
