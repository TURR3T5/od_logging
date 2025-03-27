import { useState, useCallback, memo, useEffect } from 'react';
import { Accordion, Group, Badge, Text, ActionIcon, Tooltip, Loader } from '@mantine/core';
import { Pencil, PushPin, ClockCounterClockwise } from '@phosphor-icons/react';
import RuleApiService, { Rule } from '../../lib/RuleApiService';

interface RuleListItemProps {
	rule: Rule;
	isActive: boolean;
	onEdit: (rule: Rule) => void;
	onPin: (rule: Rule) => void;
	onHistory: (ruleId: string) => void;
	onBadgeClick: (ruleId: string) => void;
	isAuthorized: boolean;
}

const RuleListItem = memo(
	({ rule, isActive, onEdit, onPin, onHistory, onBadgeClick, isAuthorized }: RuleListItemProps) => {
		const [content, setContent] = useState<string | null>(null);
		const [isLoading, setIsLoading] = useState(false);
		const [isExpanded, setIsExpanded] = useState(false);

		useEffect(() => {
			const loadContent = async () => {
				if (isExpanded && !content && !isLoading) {
					setIsLoading(true);
					try {
						const ruleContent = await RuleApiService.getRuleContent(rule.id);
						setContent(ruleContent);
					} catch (error) {
						console.error('Error loading rule content:', error);
					} finally {
						setIsLoading(false);
					}
				}
			};

			loadContent();
		}, [rule.id, isExpanded, content, isLoading]);

		const handleAccordionChange = useCallback(
			(value: string | null) => {
				setIsExpanded(value === rule.id);
			},
			[rule.id]
		);

		const handleEditClick = useCallback(
			(e: React.MouseEvent<HTMLDivElement>) => {
				e.stopPropagation();
				onEdit(rule);
			},
			[rule, onEdit]
		);

		const handlePinClick = useCallback(
			(e: React.MouseEvent<HTMLDivElement>) => {
				e.stopPropagation();
				onPin(rule);
			},
			[rule, onPin]
		);

		const handleHistoryClick = useCallback(
			(e: React.MouseEvent<HTMLDivElement>) => {
				e.stopPropagation();
				onHistory(rule.id);
			},
			[rule.id, onHistory]
		);

		const handleBadgeClick = useCallback(
			(e: React.MouseEvent<HTMLDivElement>) => {
				e.stopPropagation();
				onBadgeClick(rule.id);
			},
			[rule.id, onBadgeClick]
		);

		return (
			<Accordion.Item value={rule.id} id={`rule-${rule.id}`} className={isActive ? 'active-rule' : ''}>
				<Accordion.Control onClick={() => handleAccordionChange(rule.id)}>
					<Group justify='space-between'>
						<Group>
							<Badge color={rule.category === 'community' ? 'blue' : 'green'} size='lg' style={{ cursor: 'pointer' }} onClick={handleBadgeClick}>
								{rule.badge}
							</Badge>
							<Text fw={500}>{rule.title}</Text>
							{rule.is_pinned && (
								<Badge color='yellow' size='sm' variant='light'>
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
							<Group onClick={(e) => e.stopPropagation()}>
								<Tooltip label='Rediger'>
									<ActionIcon size='sm' color='blue' onClick={handleEditClick} component='div'>
										<Pencil size={16} />
									</ActionIcon>
								</Tooltip>
								<Tooltip label={rule.is_pinned ? 'Fjern fra oversigt' : 'Fastgør til oversigt'}>
									<ActionIcon size='sm' color={rule.is_pinned ? 'yellow' : 'gray'} onClick={handlePinClick} component='div'>
										<PushPin size={16} weight={rule.is_pinned ? 'fill' : 'regular'} />
									</ActionIcon>
								</Tooltip>
								<Tooltip label='Vis historie'>
									<ActionIcon size='sm' color='gray' onClick={handleHistoryClick} component='div'>
										<ClockCounterClockwise size={16} />
									</ActionIcon>
								</Tooltip>
							</Group>
						)}
					</Group>
				</Accordion.Control>
				<Accordion.Panel>
					{isLoading ? (
						<Group justify='center' p='md'>
							<Loader size='sm' />
							<Text size='sm' c='dimmed'>
								Indlæser indhold...
							</Text>
						</Group>
					) : (
						content || 'Indhold kunne ikke indlæses.'
					)}
				</Accordion.Panel>
			</Accordion.Item>
		);
	},
	(prevProps, nextProps) => {
		return prevProps.rule.id === nextProps.rule.id && prevProps.rule.title === nextProps.rule.title && prevProps.rule.badge === nextProps.rule.badge && prevProps.rule.is_pinned === nextProps.rule.is_pinned && prevProps.rule.updated_at === nextProps.rule.updated_at && prevProps.isActive === nextProps.isActive && prevProps.isAuthorized === nextProps.isAuthorized;
	}
);

export default RuleListItem;
