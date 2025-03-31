import { Center, Loader, Text, Stack, Group, Paper } from '@mantine/core';
interface LoadingStateProps {
	text?: string;
	compact?: boolean;
	fullPage?: boolean;
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}
export function LoadingState({ text = 'Indlæser...', compact = false, fullPage = false, size = 'lg' }: LoadingStateProps) {
		if (compact) {
		return (
			<Group gap='sm' justify='center' py='md'>
				<Loader size='sm' />
				<Text size='sm' c='dimmed'>
					{text}
				</Text>
			</Group>
		);
	}
		if (fullPage) {
		return (
			<Center style={{ height: '100vh', width: '100%' }}>
				<Stack align='center' gap='md'>
					<Loader size={size} />
					<Text c='dimmed'>{text}</Text>
				</Stack>
			</Center>
		);
	}
		return (
		<Center py='xl'>
			<Paper p='xl' radius='md' w='100%'>
				<Stack align='center' gap='md'>
					<Loader size={size} />
					<Text c='dimmed'>{text}</Text>
				</Stack>
			</Paper>
		</Center>
	);
}
