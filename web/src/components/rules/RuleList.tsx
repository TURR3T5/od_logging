import { memo } from 'react';
import { Accordion, Center, Loader, Text } from '@mantine/core';
import RuleListItem from './RuleListItem';
import { Rule } from '../../lib/RuleApiService';

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
		<Accordion
			value={activeRuleId}
			onChange={onRuleExpanded}
			radius='md'
			variant='filled'
			style={{
				maxHeight: '60vh',
				overflow: 'auto',
			}}
		>
			{rules.map((rule) => (
				<RuleListItem key={rule.id} rule={rule} isActive={activeRuleId === rule.id} onEdit={onEditRule} onPin={onPinRule} onHistory={onViewHistory} onBadgeClick={onBadgeClick} isAuthorized={isAuthorized} />
			))}
		</Accordion>
	);
});

export default RuleList;
