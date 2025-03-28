import { memo, useState, useCallback, useEffect } from 'react';
import { Box, Text, Group, Badge, Paper, ActionIcon, Tooltip, Loader, Center, Stack, Collapse, Transition } from '@mantine/core';
import { Pencil, PushPin, ClockCounterClockwise } from '@phosphor-icons/react';
import { Rule } from '../../lib/RuleApiService';
import { useInView } from 'react-intersection-observer';
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

const RuleItem = memo(({ rule, isActive, onEdit, onPin, onHistory, onBadgeClick, onSelect, isAuthorized, content, isLoading }: RuleItemProps) => {
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

interface RuleListProps {
	rules: Rule[];
	activeRuleId: string | null;
	isLoading: boolean;
	onRuleExpanded: (ruleId: string | null) => void;
	onEditRule: (rule: Rule) => void;
	onPinRule: (rule: Rule) => void;
	onViewHistory: (ruleId: string) => void;
	onBadgeClick: (ruleId: string) => void;
	isAuthorized: boolean;
}

const RuleList = memo(({ rules, activeRuleId, isLoading, onRuleExpanded, onEditRule, onPinRule, onViewHistory, onBadgeClick, isAuthorized }: RuleListProps) => {
	const [visibleRules, setVisibleRules] = useState<Rule[]>([]);
	const [ruleContents, setRuleContents] = useState<Record<string, { content: string | null; loading: boolean }>>({});
	const pageSize = 15;
	const [page, setPage] = useState(1);
	const [loadingMore, setLoadingMore] = useState(false);

	const { ref: loadMoreRef, inView } = useInView({
		threshold: 0.1,
		rootMargin: '200px',
	});

	useEffect(() => {
		if (rules.length > 0) {
			setVisibleRules(rules.slice(0, pageSize));
			setPage(1);
		} else {
			setVisibleRules([]);
		}

		setRuleContents({});
	}, [rules]);

	useEffect(() => {
		if (inView && !loadingMore && visibleRules.length < rules.length) {
			setLoadingMore(true);

			setTimeout(() => {
				const nextPage = page + 1;
				const newRules = rules.slice(0, nextPage * pageSize);
				setVisibleRules(newRules);
				setPage(nextPage);
				setLoadingMore(false);
			}, 50);
		}
	}, [inView, loadingMore, page, rules, visibleRules.length]);

	useEffect(() => {
		if (activeRuleId && !ruleContents[activeRuleId]) {
			setRuleContents((prev) => ({
				...prev,
				[activeRuleId]: { content: null, loading: true },
			}));

			const loadContent = async () => {
				try {
					const activeRule = rules.find((r) => r.id === activeRuleId);
					const content = activeRule?.content || 'Content could not be loaded.';

					setTimeout(() => {
						setRuleContents((prev) => ({
							...prev,
							[activeRuleId as string]: { content, loading: false },
						}));
					}, 50);
				} catch (error) {
					console.error('Error loading rule content:', error);
					setRuleContents((prev) => ({
						...prev,
						[activeRuleId as string]: { content: null, loading: false },
					}));
				}
			};

			loadContent();
		}
	}, [activeRuleId, ruleContents, rules]);

	const handleSelectRule = useCallback(
		(ruleId: string) => {
			onRuleExpanded(activeRuleId === ruleId ? null : ruleId);
		},
		[activeRuleId, onRuleExpanded]
	);

	if (isLoading) {
		return (
			<Center p='xl'>
				<Loader size='lg' />
			</Center>
		);
	}

	if (rules.length === 0) {
		return (
			<Text ta='center' fs='italic' py='md'>
				Ingen regler matcher din søgning
			</Text>
		);
	}

	return (
		<Box>
			<Stack gap={0}>
				{visibleRules.map((rule) => (
					<RuleItem key={rule.id} rule={rule} isActive={activeRuleId === rule.id} onEdit={onEditRule} onPin={onPinRule} onHistory={onViewHistory} onBadgeClick={onBadgeClick} onSelect={handleSelectRule} isAuthorized={isAuthorized} content={ruleContents[rule.id]?.content || null} isLoading={ruleContents[rule.id]?.loading || false} />
				))}

				{visibleRules.length < rules.length && (
					<Box ref={loadMoreRef} py='sm' ta='center'>
						{loadingMore ? (
							<Loader size='sm' />
						) : (
							<Text size='sm' c='dimmed'>
								Scroll for at se flere regler
							</Text>
						)}
					</Box>
				)}
			</Stack>
		</Box>
	);
});

export default RuleList;
