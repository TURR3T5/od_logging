import { useState, useEffect } from 'react';
import { Box, Text, Group, Badge, Paper, ActionIcon, Tooltip, Loader, Collapse } from '@mantine/core';
import { Pencil, Pin, Clock } from 'lucide-react';
import { Rule } from '../../lib/RuleApiService';

interface RuleItemProps {
	rule: Rule;
	isActive: boolean;
	onSelect: (ruleId: string) => void;
	onEdit: (rule: Rule) => void;
	onPin: (rule: Rule) => void;
	onHistory: (ruleId: string) => void;
	onBadgeClick: (ruleId: string) => void;
	isAuthorized: boolean;
	content: string | null;
	isLoading: boolean;
}

function useRuleContent(rule: Rule, isActive: boolean) {
	const [content, setContent] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (isActive && !content) {
			setIsLoading(true);

			if (rule.content) {
				setContent(rule.content);
				setIsLoading(false);
				return;
			}

			setContent(rule.content || 'Content not available');
			setIsLoading(false);
		}
	}, [isActive, rule, content]);

	return { content, isLoading };
}

function RuleItem({ rule, isActive, onSelect, onEdit, onPin, onHistory, onBadgeClick, isAuthorized }: RuleItemProps) {
	const { content, isLoading } = useRuleContent(rule, isActive);

	const handleClick = () => {
		onSelect(rule.id);
	};

	const handleEditClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onEdit(rule);
	};

	const handlePinClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onPin(rule);
	};

	const handleHistoryClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onHistory(rule.id);
	};

	const handleBadgeClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onBadgeClick(rule.id);
	};

	return (
		<Box mb='md'>
			<Paper
				withBorder
				id={`rule-${rule.id}`}
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
									transition: 'transform 0.2s ease',
									'&:hover': {
										transform: 'scale(1.05)',
									},
								}}
								onClick={handleBadgeClick}
							>
								{rule.badge}
							</Badge>
							<Text fw={500}>{rule.title}</Text>
							{rule.is_pinned && (
								<Badge color='yellow' size='sm' variant='light'>
									Fastgjort
								</Badge>
							)}
							{new Date(rule.updated_at) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) && (
								<Badge color='cyan' size='sm' variant='light'>
									Opdateret
								</Badge>
							)}
						</Group>

						{isAuthorized && (
							<Group>
								<Tooltip label='Rediger'>
									<ActionIcon variant='light' size='sm' color='blue' onClick={handleEditClick}>
										<Pencil size={14} />
									</ActionIcon>
								</Tooltip>
								<Tooltip label={rule.is_pinned ? 'Fjern fra oversigt' : 'Fastgør til oversigt'}>
									<ActionIcon variant='light' size='sm' color={rule.is_pinned ? 'yellow' : 'gray'} onClick={handlePinClick}>
										<Pin size={14} />
									</ActionIcon>
								</Tooltip>
								<Tooltip label='Vis historie'>
									<ActionIcon variant='light' size='sm' color='gray' onClick={handleHistoryClick}>
										<Clock size={14} />
									</ActionIcon>
								</Tooltip>
							</Group>
						)}
					</Group>
				</Box>

				<Collapse in={isActive} transitionDuration={200}>
					<Box
						p='md'
						style={(theme) => ({
							backgroundColor: theme.colors.dark[8],
							borderTop: `1px solid ${theme.colors.dark[5]}`,
							whiteSpace: 'pre-line',
							lineHeight: 1.6,
						})}
					>
						{isLoading ? (
							<Group justify='center' p='md'>
								<Loader size='sm' />
								<Text size='sm' c='dimmed'>
									Indlæser indhold...
								</Text>
							</Group>
						) : (
							<Text style={{ whiteSpace: 'pre-wrap' }}>{content}</Text>
						)}
					</Box>
				</Collapse>
			</Paper>
		</Box>
	);
}

export default RuleItem;
