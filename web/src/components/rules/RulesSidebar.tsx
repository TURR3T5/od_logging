import { List, Text, Paper, Badge, Group, Chip, Alert, Title } from '@mantine/core';
import { Info, Lightbulb } from '@phosphor-icons/react';
import { Rule } from '../../lib/RuleApiService';

interface RulesSidebarProps {
	pinnedRules: Rule[];
	recentlyUpdatedRules: Rule[];
	onRuleClick: (ruleId: string) => void;
}

export function RulesSidebar({ pinnedRules, recentlyUpdatedRules, onRuleClick }: RulesSidebarProps) {
	const renderPinnedRules = () => {
		return pinnedRules.length > 0 ? (
			pinnedRules.map((rule) => (
				<List.Item key={rule.id}>
					<Group gap='xs' onClick={() => onRuleClick(rule.id)} style={{ cursor: 'pointer' }}>
						<Badge size='sm' variant='light' color={rule.category === 'community' ? 'blue' : 'green'}>
							{rule.badge}
						</Badge>
						<Text>{rule.title}</Text>
					</Group>
				</List.Item>
			))
		) : (
			<Text c='dimmed'>Ingen fastgjorte regler endnu. Admin kan fastgøre regler for at vise dem her.</Text>
		);
	};

	const renderRecentlyUpdatedRules = () => {
		return recentlyUpdatedRules.map((rule) => (
			<Chip key={rule.id} checked={false} onClick={() => onRuleClick(rule.id)}>
				{rule.badge}: {rule.title}
			</Chip>
		));
	};

	return (
		<>
			<Paper withBorder p='md' radius='md' mb='xl' style={{ backgroundColor: 'rgba(30, 30, 30, 0.6)', height: '100%' }}>
				<Group mb='sm'>
					<Lightbulb size={24} color='#FFD700' />
					<Title order={4}>Hurtigt Overblik - Vigtigste Regler</Title>
				</Group>
				<List spacing='xs' size='sm'>
					{renderPinnedRules()}
				</List>
			</Paper>

			{recentlyUpdatedRules.length > 0 ? (
				<Alert mb='xl' icon={<Info size={24} />} title='Nyligt Opdaterede Regler' color='blue' style={{ height: '100%' }} variant='outline'>
					<Text size='sm' mb='xs'>
						Følgende regler er blevet opdateret inden for de sidste 14 dage:
					</Text>
					<Group>{renderRecentlyUpdatedRules()}</Group>
				</Alert>
			) : (
				<Paper withBorder p='md' radius='md' mb='xl' style={{ backgroundColor: 'rgba(30, 30, 30, 0.6)', height: '100%' }}>
					<Group mb='sm'>
						<Info size={24} color='#3b82f6' />
						<Title order={4}>Nyligt Opdaterede Regler</Title>
					</Group>
					<Text c='dimmed'>Ingen regler er blevet opdateret inden for de sidste 14 dage.</Text>
				</Paper>
			)}
		</>
	);
}
