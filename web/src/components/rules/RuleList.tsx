import { useState, useEffect } from 'react';
import { Box, Text, Loader, Center, Stack } from '@mantine/core';
import { Rule } from '../../lib/RuleApiService';
import { useInView } from 'react-intersection-observer';
import RuleItem from './RuleItem';
import { useRuleContent } from '../../hooks/useRuleContent';
import { EmptyState } from '../common/EmptyState';

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

const RuleList = ({ rules, activeRuleId, isLoading, onRuleExpanded, onEditRule, onPinRule, onViewHistory, onBadgeClick, isAuthorized }: RuleListProps) => {
	const [visibleRules, setVisibleRules] = useState<Rule[]>([]);
	const [ruleContents, setRuleContents] = useState<Record<string, { content: string | null; loading: boolean }>>({});
	const pageSize = 15;
	const [page, setPage] = useState(1);
	const [loadingMore, setLoadingMore] = useState(false);
	const { getContent, isLoading: isContentLoading } = useRuleContent(activeRuleId, rules);
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

	const handleSelectRule = (ruleId: string) => {
		onRuleExpanded(activeRuleId === ruleId ? null : ruleId);
	};

	if (isLoading) {
		return (
			<Center p='xl'>
				<Loader size='lg' />
			</Center>
		);
	}

	if (rules.length === 0) {
		return <EmptyState title='Ingen regler' message='Der er ingen regler at vise.' />;
	}

	return (
		<Box>
			<Stack gap={0}>
				{visibleRules.map((rule) => (
					<RuleItem key={rule.id} rule={rule} isActive={activeRuleId === rule.id} onEdit={onEditRule} onPin={onPinRule} onHistory={onViewHistory} onBadgeClick={onBadgeClick} onSelect={handleSelectRule} isAuthorized={isAuthorized} content={getContent(rule.id)} isLoading={isContentLoading(rule.id)} />
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
};

export default RuleList;