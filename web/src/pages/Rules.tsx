import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { Container, Title, Box, Paper, Badge, Divider, Loader, Center } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDebouncedValue } from '@mantine/hooks';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../components/AuthProvider';
import RuleApiService, { Rule, RulesResponse } from '../lib/RuleApiService';
import RuleList from '../components/rules/RuleList';
import { useRulesFilter } from '../hooks/useRulesFilter';
import { RulesSidebar } from '../components/rules/RulesSidebar';
import { RulesHeader } from '../components/rules/RulesHeader';
import '../styles/RulesPage.css';

const EditRuleModal = lazy(() => import('../components/rules/EditRuleModal'));
const CreateRuleModal = lazy(() => import('../components/rules/CreateRuleModal'));
const RuleHistoryModal = lazy(() => import('../components/rules/RuleHistoryModal'));

export default function RulesPage() {
	const [activeCommunityRule, setActiveCommunityRule] = useState<string | null>(null);
	const [activeRoleplayRule, setActiveRoleplayRule] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [_error, setError] = useState<string | null>(null);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [currentRule, setCurrentRule] = useState<Rule | null>(null);
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [historyModalOpen, setHistoryModalOpen] = useState(false);
	const [selectedRuleId, setSelectedRuleId] = useState<string>('');
	const [rules, setRules] = useState<RulesResponse>({
		community: [],
		roleplay: [],
		pinned: [],
		recentlyUpdated: [],
	});
	const { searchQuery, setSearchQuery, activeTab, setActiveTab, filteredRules } = useRulesFilter(rules);
	const rulesRef = useRef<HTMLDivElement>(null);
	const { isAuthorized, user } = useAuth();
	const displayCommunityRules = activeTab === 'all' || activeTab === 'community';
	const displayRoleplayRules = activeTab === 'all' || activeTab === 'roleplay';
	const [debouncedSearchValue] = useDebouncedValue(searchQuery, 300);

	useEffect(() => {
		setSearchQuery(debouncedSearchValue);
	}, [debouncedSearchValue, setSearchQuery]);

	useEffect(() => {
		fetchRules();
	}, []);

	const fetchRules = async () => {
		setIsLoading(true);
		try {
			const data = await RuleApiService.getRulesList();

			setRules(data);
			setError(null);
		} catch (err) {
			setError('Der opstod en fejl ved indlæsning af regler. Prøv venligst igen senere.');
		} finally {
			setIsLoading(false);
		}
	};

	const togglePinnedRule = useCallback(
		async (rule: Rule) => {
			try {
				await RuleApiService.updateRule(
					rule.id,
					{
						is_pinned: !rule.is_pinned,
						updated_by: user?.username || 'Unknown',
					},
					`Regel blev ${rule.is_pinned ? 'fjernet fra' : 'tilføjet til'} hurtig oversigt af ${user?.username || 'Unknown'}`
				);

				fetchRules();

				notifications.show({
					title: rule.is_pinned ? 'Regel fjernet fra hurtig oversigt' : 'Regel tilføjet til hurtig oversigt',
					message: rule.is_pinned ? 'Reglen vises ikke længere i det hurtige overblik' : 'Reglen vises nu i det hurtige overblik',
					color: 'blue',
				});
			} catch (error) {
				console.error('Error toggling pin status:', error);
				notifications.show({
					title: 'Fejl',
					message: 'Der opstod en fejl ved ændring af pin-status',
					color: 'red',
				});
			}
		},
		[user?.username]
	);

	const scrollToRule = useCallback(
		(ruleId: string) => {
			const allRules = [...rules.community, ...rules.roleplay];
			const rule = allRules.find((r) => r.id === ruleId);

			if (rule) {
				setActiveTab(rule.category === 'community' ? 'community' : 'roleplay');

				if (rule.category === 'community') {
					setActiveCommunityRule(ruleId);
				} else {
					setActiveRoleplayRule(ruleId);
				}

				setTimeout(() => {
					const element = document.getElementById(`rule-${ruleId}`);
					if (element) {
						element.scrollIntoView({
							behavior: 'smooth',
							block: 'center',
						});

						element.classList.add('highlight-rule');
						setTimeout(() => {
							element.classList.remove('highlight-rule');
						}, 2000);
					}
				}, 50);
			}
		},
		[rules.community, rules.roleplay]
	);

	const openEditModal = useCallback((rule: Rule) => {
		setCurrentRule(rule);
		setEditModalOpen(true);
	}, []);

	const exportRules = useCallback(() => {
		const data = {
			community: rules.community,
			roleplay: rules.roleplay,
		};

		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = `odessa_rules_${new Date().toISOString().split('T')[0]}.json`;
		a.style.display = 'none';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		notifications.show({
			title: 'Regler eksporteret',
			message: 'Reglerne er blevet eksporteret til en JSON-fil',
			color: 'blue',
		});
	}, [rules.community, rules.roleplay]);

	const openHistoryModal = useCallback((ruleId: string) => {
		setSelectedRuleId(ruleId);
		setHistoryModalOpen(true);
	}, []);

	return (
		<MainLayout requireAuth={false}>
			<Box
				style={{
					position: 'relative',
					minHeight: '100vh',
					overflow: 'hidden',
				}}
			>
				<Box
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: '#0a0a0a',
						backgroundImage: 'radial-gradient(#1a1a1a 1px, transparent 1px)',
						backgroundSize: '30px 30px',
						opacity: 0.6,
						pointerEvents: 'none',
						zIndex: 0,
					}}
				/>

				<Container size={1000} py='xl' style={{ position: 'relative', zIndex: 1 }}>
					<Paper
						withBorder
						p='xl'
						radius='md'
						mb='xl'
						style={{
							background: 'rgba(25, 25, 25, 0.95)',
							backdropFilter: 'blur(10px)',
							borderColor: '#333',
							boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
						}}
					>
						<RulesHeader searchInput={searchQuery} onSearchChange={setSearchQuery} activeTab={activeTab} onTabChange={setActiveTab} isAuthorized={isAuthorized} onCreateRule={() => setCreateModalOpen(true)} onExportRules={exportRules} />

						<RulesSidebar pinnedRules={rules.pinned} recentlyUpdatedRules={rules.recentlyUpdated} onRuleClick={scrollToRule} />

						{isLoading ? (
							<Center p='xl'>
								<Loader size='lg' />
							</Center>
						) : (
							<>
								{activeTab === 'all' && displayCommunityRules && displayRoleplayRules ? (
									<Box style={{ gap: '20px', position: 'relative' }}>
										{/* Community Rules Section */}
										<Box ref={rulesRef}>
											<Title
												order={3}
												mb='md'
												style={{
													display: 'inline-block',
													padding: '10px 20px',
													background: 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))',
													borderRadius: '8px',
													borderLeft: '4px solid #3b82f6',
													fontWeight: 700,
												}}
											>
												DISCORD & COMMUNITY GUIDELINES
											</Title>

											<RuleList rules={filteredRules.community} activeRuleId={activeCommunityRule} isLoading={isLoading} onRuleExpanded={setActiveCommunityRule} onEditRule={openEditModal} onPinRule={togglePinnedRule} onViewHistory={openHistoryModal} onBadgeClick={scrollToRule} isAuthorized={isAuthorized} />
										</Box>

										<Divider size='sm' labelPosition='center' label={<Badge variant='light'>OdessaRP</Badge>} my={24} />

										{/* Roleplay Rules Section */}
										<Box>
											<Title
												order={3}
												mb='md'
												style={{
													display: 'inline-block',
													padding: '10px 20px',
													background: 'linear-gradient(to right, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05))',
													borderRadius: '8px',
													borderLeft: '4px solid #22c55e',
													fontWeight: 700,
												}}
											>
												ROLLESPILS REGLER
											</Title>

											<RuleList rules={filteredRules.roleplay} activeRuleId={activeRoleplayRule} isLoading={isLoading} onRuleExpanded={setActiveRoleplayRule} onEditRule={openEditModal} onPinRule={togglePinnedRule} onViewHistory={openHistoryModal} onBadgeClick={scrollToRule} isAuthorized={isAuthorized} />
										</Box>
									</Box>
								) : (
									<Box>
										{displayCommunityRules && (
											<Box mb='xl' ref={rulesRef}>
												<Title
													order={3}
													mb='md'
													style={{
														display: 'inline-block',
														padding: '10px 20px',
														background: 'linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))',
														borderRadius: '8px',
														borderLeft: '4px solid #3b82f6',
														fontWeight: 700,
													}}
												>
													DISCORD & COMMUNITY GUIDELINES
												</Title>

												<RuleList rules={filteredRules.community} activeRuleId={activeCommunityRule} isLoading={isLoading} onRuleExpanded={setActiveCommunityRule} onEditRule={openEditModal} onPinRule={togglePinnedRule} onViewHistory={openHistoryModal} onBadgeClick={scrollToRule} isAuthorized={isAuthorized} />
											</Box>
										)}

										{displayRoleplayRules && (
											<Box>
												<Title
													order={3}
													mb='md'
													style={{
														display: 'inline-block',
														padding: '10px 20px',
														background: 'linear-gradient(to right, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.05))',
														borderRadius: '8px',
														borderLeft: '4px solid #22c55e',
														fontWeight: 700,
													}}
												>
													ROLLESPILS REGLER
												</Title>

												<RuleList rules={filteredRules.roleplay} activeRuleId={activeRoleplayRule} isLoading={isLoading} onRuleExpanded={setActiveRoleplayRule} onEditRule={openEditModal} onPinRule={togglePinnedRule} onViewHistory={openHistoryModal} onBadgeClick={scrollToRule} isAuthorized={isAuthorized} />
											</Box>
										)}
									</Box>
								)}
							</>
						)}
					</Paper>
				</Container>
			</Box>

			<Suspense
				fallback={
					<Center p='xl'>
						<Loader />
					</Center>
				}
			>
				{editModalOpen && <EditRuleModal currentRule={currentRule} opened={editModalOpen} onClose={() => setEditModalOpen(false)} onRuleUpdated={fetchRules} username={user?.username} />}

				{createModalOpen && <CreateRuleModal opened={createModalOpen} onClose={() => setCreateModalOpen(false)} onRuleCreated={fetchRules} />}

				{historyModalOpen && <RuleHistoryModal ruleId={selectedRuleId} opened={historyModalOpen} onClose={() => setHistoryModalOpen(false)} />}
			</Suspense>
		</MainLayout>
	);
}
