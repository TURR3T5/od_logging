import { memo, useCallback, useEffect } from 'react';
import { Box, Text, Group, Badge, Paper, ActionIcon, Tooltip, Loader, Collapse, Transition } from '../mantine';
import { Pencil, PushPin, ClockCounterClockwise } from '../icons';
import { Rule } from '../../lib/RuleApiService';
import { useDisclosure } from '@mantine/hooks';

interface RuleItemProps {
	rule: Rule;
	isActive: boolean;
	onEdit: (rule: Rule) => void;
	onPin: (rule: Rule) => void;
	onHistory: (ruleId: string) => void;
	onBadgeClick: (ruleId: string) => void;
	onSelect: (ruleId: string) => void;
	isAuthorized: boolean;
	content: string | null;
	isLoading: boolean;
}

export const RuleItem = memo(({ rule, isActive, onEdit, onPin, onHistory, onBadgeClick, onSelect, isAuthorized, content, isLoading }: RuleItemProps) => {
	const [opened, { toggle }] = useDisclosure(isActive);

	useEffect(() => {
		if (isActive !== opened) {
			toggle();
		}
	}, [isActive, opened, toggle]);

	const handleClick = useCallback(() => {
		onSelect(rule.id);
	}, [rule.id, onSelect]);

	const handleEditClick = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			onEdit(rule);
		},
		[rule, onEdit]
	);

	const handlePinClick = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			onPin(rule);
		},
		[rule, onPin]
	);

	const handleHistoryClick = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			onHistory(rule.id);
		},
		[rule.id, onHistory]
	);

	const handleBadgeClick = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			onBadgeClick(rule.id);
		},
		[rule.id, onBadgeClick]
	);

	return (
		<Box mb='md'>
			<Paper
				withBorder
				id={`rule-${rule.id}`}
				className={isActive ? 'active-rule' : ''}
				style={(theme) => ({
					borderRadius: theme.radius.md,
					overflow: 'hidden',
					transition: 'all 0.3s ease',
					borderColor: isActive ? (rule.category === 'community' ? theme.colors.blue[5] : theme.colors.green[5]) : theme.colors.dark[4],
				})}
			>
				<Box
					px='md'
					py='md'
					onClick={handleClick}
					style={(theme) => ({
						cursor: 'pointer',
						backgroundColor: isActive ? (rule.category === 'community' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(34, 197, 94, 0.1)') : theme.colors.dark[7],
						'&:hover': {
							backgroundColor: !isActive ? theme.colors.dark[6] : rule.category === 'community' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(34, 197, 94, 0.1)',
						},
					})}
				>
					<Group justify='space-between'>
						<Group>
							<Badge
								color={rule.category === 'community' ? 'blue' : 'green'}
								size='lg'
								variant='light'
								style={{
									cursor: 'pointer',
									transition: 'transform 0.2s ease, box-shadow 0.2s ease',
									'&:hover': {
										transform: 'scale(1.05)',
										boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
									},
								}}
								onClick={handleBadgeClick}
							>
								{rule.badge}
							</Badge>
							<Text fw={500}>{rule.title}</Text>
							{rule.is_pinned && (
								<Badge color='yellow' size='sm' variant='light' className='pinned-badge'>
									Fastgjort
								</Badge>
							)}
							{new Date(rule.updated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
								<Badge color='cyan' size='sm' variant='light'>
									Opdateret
								</Badge>
							)}
						</Group>

						{isAuthorized && (
							<Group>
								<Tooltip label='Rediger'>
									<ActionIcon variant='light' size='sm' color='blue' onClick={handleEditClick}>
										<Pencil size={16} />
									</ActionIcon>
								</Tooltip>
								<Tooltip label={rule.is_pinned ? 'Fjern fra oversigt' : 'Fastgør til oversigt'}>
									<ActionIcon variant='light' size='sm' color={rule.is_pinned ? 'lime.8' : 'gray.7'} onClick={handlePinClick}>
										<PushPin size={16} weight={rule.is_pinned ? 'fill' : 'regular'} />
									</ActionIcon>
								</Tooltip>
								<Tooltip label='Vis historie'>
									<ActionIcon variant='light' size='sm' color='gray.7' onClick={handleHistoryClick}>
										<ClockCounterClockwise size={16} />
									</ActionIcon>
								</Tooltip>
							</Group>
						)}
					</Group>
				</Box>

				<Collapse in={opened} transitionDuration={300} transitionTimingFunction='ease'>
					<Box
						p='md'
						style={(theme) => ({
							backgroundColor: theme.colors.dark[8],
							borderTop: `1px solid ${theme.colors.dark[5]}`,
							whiteSpace: 'pre-line',
							lineHeight: 1.6,
							wordWrap: 'break-word',
							overflow: 'auto',
							maxWidth: '100%',
						})}
					>
						<Transition mounted={isActive} transition='fade' duration={200} timingFunction='ease'>
							{(styles) => (
								<div style={styles}>
									{isLoading ? (
										<Group justify='center' p='md'>
											<Loader size='sm' />
											<Text size='sm' c='dimmed'>
												Indlæser indhold...
											</Text>
										</Group>
									) : (
										<Text style={{ whiteSpace: 'pre-wrap', maxWidth: '100%' }}>{content || 'Indhold kunne ikke indlæses.'}</Text>
									)}
								</div>
							)}
						</Transition>
					</Box>
				</Collapse>
			</Paper>
		</Box>
	);
});
