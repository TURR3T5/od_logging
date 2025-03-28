import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { Container, Title, Text, Box, Paper, Group, Badge, Divider, TextInput, List, Alert, Chip, Button, ActionIcon, Tabs, Loader, Center } from '@mantine/core';
import { MagnifyingGlass, X, Info, Plus, FileArrowDown, Lightbulb } from '@phosphor-icons/react';
import { notifications } from '@mantine/notifications';
import { debounce, throttle } from 'lodash';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../components/AuthProvider';
import RuleApiService, { Rule, RulesResponse } from '../lib/RuleApiService';
import RuleList from '../components/rules/RuleList';
import './RulesPage.css';

const EditRuleModal = lazy(() => import('../components/rules/EditRuleModal'));
const CreateRuleModal = lazy(() => import('../components/rules/CreateRuleModal'));
const RuleHistoryModal = lazy(() => import('../components/rules/RuleHistoryModal'));

export default function RulesPage() {
	const [activeCommunityRule, setActiveCommunityRule] = useState<string | null>(null);
	const [activeRoleplayRule, setActiveRoleplayRule] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<string | null>('all');
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
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
	const [filteredRules, setFilteredRules] = useState<{
		community: Rule[];
		roleplay: Rule[];
	}>({
		community: [],
		roleplay: [],
	});

	const scrollYRef = useRef(0);
	const rulesRef = useRef<HTMLDivElement>(null);
	const { isAuthorized, user } = useAuth();
	const displayCommunityRules = activeTab === 'all' || activeTab === 'community';
	const displayRoleplayRules = activeTab === 'all' || activeTab === 'roleplay';

	useEffect(() => {
		const handleScroll = throttle(() => {
			scrollYRef.current = window.scrollY;
		}, 100);

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => {
			handleScroll.cancel();
			window.removeEventListener('scroll', handleScroll);
		};
	}, []);

	useEffect(() => {
		fetchRules();
	}, []);

	useEffect(() => {
		if (!rules) return;

		const filterRulesByQuery = (rulesArray: Rule[], query: string) => {
			if (query.trim() === '') return rulesArray;

			const lowerCaseQuery = query.toLowerCase();
			return rulesArray.filter((rule) => rule.title.toLowerCase().includes(lowerCaseQuery) || (rule.content && rule.content.toLowerCase().includes(lowerCaseQuery)) || rule.tags.some((tag) => tag.toLowerCase().includes(lowerCaseQuery)) || rule.badge.toLowerCase().includes(lowerCaseQuery));
		};

		setFilteredRules({
			community: filterRulesByQuery(rules.community, searchQuery),
			roleplay: filterRulesByQuery(rules.roleplay, searchQuery),
		});
	}, [searchQuery, rules]);

	const debouncedSearch = useRef(
		debounce((value: string) => {
			setSearchQuery(value);
		}, 300)
	).current;

	const fetchRules = async () => {
		setIsLoading(true);
		try {
			const data = await RuleApiService.getRulesList();

			setRules(data);
			setFilteredRules({
				community: data.community,
				roleplay: data.roleplay,
			});

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
			const element = document.getElementById(`rule-${ruleId}`);
			if (element) {
				const allRules = [...rules.community, ...rules.roleplay];
				const rule = allRules.find((r) => r.id === ruleId);

				if (rule) {
					setActiveTab(rule.category === 'community' ? 'community' : 'roleplay');

					if (rule.category === 'community') {
						setActiveCommunityRule(ruleId);
					} else {
						setActiveRoleplayRule(ruleId);
					}

					requestAnimationFrame(() => {
						element.scrollIntoView({ behavior: 'smooth', block: 'center' });

						element.classList.add('highlight-rule');
						setTimeout(() => {
							element.classList.remove('highlight-rule');
						}, 2000);
					});
				}
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

	const renderPinnedRules = () => {
		return rules.pinned.length > 0 ? (
			rules.pinned.map((rule) => (
				<List.Item key={rule.id}>
					<Group gap='xs' onClick={() => scrollToRule(rule.id)} style={{ cursor: 'pointer' }} >
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
		return rules.recentlyUpdated.map((rule) => (
			<Chip key={rule.id} checked={false} onClick={() => scrollToRule(rule.id)}>
				{rule.badge}: {rule.title}
			</Chip>
		));
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
						<Box
							style={{
								background: 'linear-gradient(to right, rgba(225, 29, 72, 0.1), rgba(225, 29, 72, 0.02))',
								padding: '16px',
								borderRadius: '8px',
								marginBottom: '24px',
								borderLeft: '4px solid #e11d48',
							}}
						>
							<Badge color='red' size='lg' radius='sm' mb='md'>
								VIGTIGT
							</Badge>
							<Text size='lg' fw={700} c='red.4'>
								DET ER ENHVER SPILLERS EGET ANSVAR AT HOLDE SIG OPDATERET PÅ ODESSA'S REGELSÆT - NYE/ÆNDREDE REGLER VIL ALTID BLIVE MELDT UD I DISCORD
							</Text>
						</Box>

						<Group justify='space-between' mb='lg'>
							<Title order={1} c='gray.3' fw={800}>
								OdessaRP Regelsæt
							</Title>

							{isAuthorized && (
								<Group>
									<Button leftSection={<Plus size={16} />} onClick={() => setCreateModalOpen(true)}>
										Opret ny regel
									</Button>
									<Button variant='outline' leftSection={<FileArrowDown size={16} />} onClick={exportRules}>
										Eksporter regler
									</Button>
								</Group>
							)}
						</Group>

						{error && (
							<Alert color='red' mb='lg'>
								{error}
							</Alert>
						)}

						<Box mb='xl'>
							<Group justify='space-between' mb='md'>
								<TextInput
									leftSection={<MagnifyingGlass size={18} />}
									placeholder='Søg efter regler...'
									defaultValue={searchQuery}
									onChange={(event) => debouncedSearch(event.currentTarget.value)}
									style={{ flexGrow: 1 }}
									rightSection={
										searchQuery ? (
											<ActionIcon
												onClick={() => {
													setSearchQuery('');
													debouncedSearch('');
												}}
											>
												<X size={16} />
											</ActionIcon>
										) : null
									}
								/>
							</Group>

							<Tabs value={activeTab} onChange={setActiveTab}>
								<Tabs.List>
									<Tabs.Tab value='all'>Alle Regler</Tabs.Tab>
									<Tabs.Tab value='community'>Discord & Community Regler</Tabs.Tab>
									<Tabs.Tab value='roleplay'>Rollespils Regler</Tabs.Tab>
								</Tabs.List>
							</Tabs>
						</Box>

						<Paper withBorder p='md' radius='md' mb='xl' style={{ backgroundColor: 'rgba(30, 30, 30, 0.6)', height: '100%' }}>
							<Group mb='sm'>
								<Lightbulb size={24} color='#FFD700' />
								<Title order={4}>Hurtigt Overblik - Vigtigste Regler</Title>
							</Group>
							<List spacing='xs' size='sm'>
								{renderPinnedRules()}
							</List>
						</Paper>
						{rules.recentlyUpdated.length > 0 ? (
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
									// Individual rule category display for when a specific tab is selected
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
