import { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Accordion, Text, Center, Loader } from '@mantine/core';
import { useVirtualizer } from '@tanstack/react-virtual';
import RuleListItem from './RuleListItem';
import { Rule } from '../../lib/RuleApiService';

interface VirtualizedRulesListProps {
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

export default function VirtualizedRulesList({ rules, activeRuleId, isLoading, onRuleExpanded, onEditRule, onPinRule, onViewHistory, onBadgeClick, isAuthorized }: VirtualizedRulesListProps) {
	const parentRef = useRef<HTMLDivElement>(null);
	const [parentHeight, setParentHeight] = useState(0);

	useEffect(() => {
		const updateParentHeight = () => {
			if (parentRef.current) {
				setParentHeight(parentRef.current.getBoundingClientRect().height);
			}
		};

		updateParentHeight();

		const resizeObserver = new ResizeObserver(updateParentHeight);
		if (parentRef.current) {
			resizeObserver.observe(parentRef.current);
		}

		window.addEventListener('resize', updateParentHeight);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener('resize', updateParentHeight);
		};
	}, []);

	const rowVirtualizer = useVirtualizer({
		count: rules.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 60,
		overscan: 5,
	});

	const handleAccordionChange = useCallback(
		(value: string | null) => {
			onRuleExpanded(value);
		},
		[onRuleExpanded]
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
		<Box
			ref={parentRef}
			style={{
				height: '60vh',
				overflow: 'auto',
				position: 'relative',
			}}
		>
			<Accordion
				value={activeRuleId}
				onChange={handleAccordionChange}
				radius='md'
				variant='filled'
				style={{
					height: `${rowVirtualizer.getTotalSize()}px`,
					width: '100%',
					position: 'relative',
				}}
			>
				{rowVirtualizer.getVirtualItems().map((virtualRow) => {
					const rule = rules[virtualRow.index];
					return (
						<Box
							key={rule.id}
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								width: '100%',
								transform: `translateY(${virtualRow.start}px)`,
							}}
						>
							<RuleListItem rule={rule} isActive={activeRuleId === rule.id} onEdit={onEditRule} onPin={onPinRule} onHistory={onViewHistory} onBadgeClick={onBadgeClick} isAuthorized={isAuthorized} />
						</Box>
					);
				})}
			</Accordion>
		</Box>
	);
}
