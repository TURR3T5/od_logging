import { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { Container, Title, Box, Paper, Badge, Divider } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../components/AuthProvider';
import RuleApiService, { Rule, RulesResponse } from '../lib/RuleApiService';
import { useRulesFilter } from '../hooks/useRulesFilter';
import { usePermission } from '../hooks/usePermissions';
import { useModalState } from '../hooks/useModalState';
import { LoadingState } from '../components/common/LoadingState';

const RulesHeader = lazy(() => import('../components/rules/RulesHeader'));
const RulesSidebar = lazy(() => import('../components/rules/RulesSidebar'));
const EditRuleModal = lazy(() => import('../components/rules/EditRuleModal'));
const CreateRuleModal = lazy(() => import('../components/rules/CreateRuleModal'));
const RuleHistoryModal = lazy(() => import('../components/rules/RuleHistoryModal'));
const RuleItem = lazy(() => import('../components/rules/RuleItem'));

export default function RulesPage() {
	const [activeCommunityRule, setActiveCommunityRule] = useState<string | null>(null);
	const [activeRoleplayRule, setActiveRoleplayRule] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [_error, setError] = useState<string | null>(null);
	const [rules, setRules] = useState<RulesResponse>({
		community: [],
		roleplay: [],
		pinned: [],
		recentlyUpdated: [],
	});
	const { searchQuery, setSearchQuery, activeTab, setActiveTab, filteredRules } = useRulesFilter(rules);
	const communityRulesRef = useRef<HTMLDivElement>(null);
	const roleplayRulesRef = useRef<HTMLDivElement>(null);
	const { user } = useAuth();
	const { hasPermission: isAuthorized } = usePermission('content');
	const displayCommunityRules = activeTab === 'all' || activeTab === 'community';
	const displayRoleplayRules = activeTab === 'all' || activeTab === 'roleplay';
	const [debouncedSearchValue] = useDebouncedValue(searchQuery, 300);
	const editModal = useModalState<Rule>();
	const createModal = useModalState();
	const historyModal = useModalState<string>();

	const useRuleContent = (activeRuleId: string | null, rules: Rule[]) => {
		const [ruleContents, setRuleContents] = useState<Record<string, { content: string | null; loading: boolean }>>({});

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

						setRuleContents((prev) => ({
							...prev,
							[activeRuleId as string]: { content, loading: false },
						}));
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
		}, [activeRuleId, rules]);

		const getContent = (ruleId: string) => ruleContents[ruleId]?.content || null;
		const isLoading = (ruleId: string) => ruleContents[ruleId]?.loading || false;

		return { getContent, isLoading };
	};

	const { getContent: getCommunityRuleContent, isLoading: isCommunityRuleContentLoading } = useRuleContent(activeCommunityRule, filteredRules.community);
	const { getContent: getRoleplayRuleContent, isLoading: isRoleplayRuleContentLoading } = useRuleContent(activeRoleplayRule, filteredRules.roleplay);

	useEffect(() => {
		setSearchQuery(debouncedSearchValue);
	}, [debouncedSearchValue, setSearchQuery]);

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

	useEffect(() => {
		fetchRules();
	}, []);

	const togglePinnedRule = async (rule: Rule) => {
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
	};

	const scrollToRule = (ruleId: string) => {
		const allRules = [...rules.community, ...rules.roleplay];
		const rule = allRules.find((r) => r.id === ruleId);

		if (rule) {
			setActiveTab(rule.category === 'community' ? 'community' : 'roleplay');

			if (rule.category === 'community') {
				setActiveCommunityRule((prevId) => (prevId === ruleId ? null : ruleId));
			} else {
				setActiveRoleplayRule((prevId) => (prevId === ruleId ? null : ruleId));
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
	};

	const openEditModal = (rule: Rule) => {
		editModal.open(rule);
	};

	const exportRules = () => {
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
	};

	const openHistoryModal = (ruleId: string) => {
		historyModal.open(ruleId);
	};

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
						<Suspense fallback={<LoadingState />}>
							<RulesHeader searchInput={searchQuery} onSearchChange={setSearchQuery} activeTab={activeTab} onTabChange={setActiveTab} isAuthorized={isAuthorized} onCreateRule={createModal.open} onExportRules={exportRules} />
						</Suspense>

						<Suspense fallback={<LoadingState />}>
							<RulesSidebar pinnedRules={rules.pinned} recentlyUpdatedRules={rules.recentlyUpdated} onRuleClick={scrollToRule} />
						</Suspense>

						{isLoading ? (
							<LoadingState />
						) : (
							<>
								{activeTab === 'all' && displayCommunityRules && displayRoleplayRules ? (
									<Box style={{ gap: '20px', position: 'relative' }}>
										{/* Community Rules Section */}
										<Box>
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

											<Box
												ref={communityRulesRef}
												style={{
													height: 'auto',
													maxHeight: '600px',
													overflow: 'auto',
													width: '100%',
												}}
											>
												{filteredRules.community.map((rule) => (
													<RuleItem key={rule.id} rule={rule} isActive={activeCommunityRule === rule.id} onSelect={(ruleId: string) => setActiveCommunityRule((prev) => (prev === ruleId ? null : ruleId))} onEdit={openEditModal} onPin={togglePinnedRule} onHistory={openHistoryModal} onBadgeClick={scrollToRule} isAuthorized={isAuthorized} content={getCommunityRuleContent(rule.id)} isLoading={isCommunityRuleContentLoading(rule.id)} />
												))}
											</Box>
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

											<Box
												ref={roleplayRulesRef}
												style={{
													height: 'auto',
													maxHeight: '600px',
													overflow: 'auto',
													width: '100%',
												}}
											>
												{filteredRules.roleplay.map((rule) => (
													<RuleItem key={rule.id} rule={rule} isActive={activeRoleplayRule === rule.id} onSelect={(ruleId: string) => setActiveRoleplayRule((prev) => (prev === ruleId ? null : ruleId))} onEdit={openEditModal} onPin={togglePinnedRule} onHistory={openHistoryModal} onBadgeClick={scrollToRule} isAuthorized={isAuthorized} content={getRoleplayRuleContent(rule.id)} isLoading={isRoleplayRuleContentLoading(rule.id)} />
												))}
											</Box>
										</Box>
									</Box>
								) : (
									<Box>
										{displayCommunityRules && (
											<Box mb='xl'>
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

												<Box
													ref={communityRulesRef}
													style={{
														height: 'auto',
														maxHeight: '800px',
														overflow: 'auto',
														width: '100%',
													}}
												>
													<Suspense fallback={<LoadingState />}>
														{filteredRules.community.map((rule) => (
															<RuleItem key={rule.id} rule={rule} isActive={activeCommunityRule === rule.id} onSelect={(ruleId: string) => setActiveCommunityRule((prev) => (prev === ruleId ? null : ruleId))} onEdit={openEditModal} onPin={togglePinnedRule} onHistory={openHistoryModal} onBadgeClick={scrollToRule} isAuthorized={isAuthorized} content={getCommunityRuleContent(rule.id)} isLoading={isCommunityRuleContentLoading(rule.id)} />
														))}
													</Suspense>
												</Box>
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

												<Box
													ref={roleplayRulesRef}
													style={{
														height: 'auto',
														maxHeight: '800px',
														overflow: 'auto',
														width: '100%',
													}}
												>
													<Suspense fallback={<LoadingState />}>
														{filteredRules.roleplay.map((rule) => (
															<RuleItem key={rule.id} rule={rule} isActive={activeRoleplayRule === rule.id} onSelect={(ruleId: string) => setActiveRoleplayRule((prev) => (prev === ruleId ? null : ruleId))} onEdit={openEditModal} onPin={togglePinnedRule} onHistory={openHistoryModal} onBadgeClick={scrollToRule} isAuthorized={isAuthorized} content={getRoleplayRuleContent(rule.id)} isLoading={isRoleplayRuleContentLoading(rule.id)} />
														))}
													</Suspense>
												</Box>
											</Box>
										)}
									</Box>
								)}
							</>
						)}
					</Paper>
				</Container>
			</Box>

			<Suspense fallback={null}>
				<EditRuleModal currentRule={editModal.data} opened={editModal.isOpen} onClose={editModal.close} onRuleUpdated={fetchRules} username={user?.username} />
			</Suspense>
			<Suspense fallback={null}>
				<CreateRuleModal opened={createModal.isOpen} onClose={createModal.close} onRuleCreated={fetchRules} />
			</Suspense>
			<Suspense fallback={null}>
				<RuleHistoryModal ruleId={historyModal.data || ''} opened={historyModal.isOpen} onClose={historyModal.close} />
			</Suspense>
		</MainLayout>
	);
}
