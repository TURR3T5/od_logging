import { useState, useEffect, useRef } from 'react';
import { Container, Title, Text, Box, Paper, Accordion, Group, Badge, Divider, TextInput, Tabs, List, Alert, Chip, Button, Modal, ActionIcon, MultiSelect, Switch, Textarea, Timeline, Loader, Center, Card, Tooltip, SegmentedControl } from '@mantine/core';
import { MagnifyingGlass, Lightbulb, X, Info, Pencil, PushPin, ClockCounterClockwise, ArrowRight, Eye, Check, Plus, GithubLogo, FileArrowDown } from '@phosphor-icons/react';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import './RulesPage.css'; // We'll create this file for the highlight animation

// Define interfaces
interface Rule {
	id: string;
	badge: string;
	title: string;
	content: string;
	category: 'community' | 'roleplay';
	tags: string[];
	is_pinned: boolean;
	created_at: string;
	updated_at: string;
	updated_by: string;
	version: number;
	order_index: number;
}

interface RuleChange {
	id: string;
	rule_id: string;
	previous_content: string;
	new_content: string;
	previous_title: string;
	new_title: string;
	previous_tags: string[];
	new_tags: string[];
	previous_pinned: boolean;
	new_pinned: boolean;
	changed_at: string;
	changed_by: string;
	version: number;
	change_notes: string;
}

export default function RulesPage() {
	// State variables
	const [activeCommunityRule, setActiveCommunityRule] = useState<string | null>(null);
	const [activeRoleplayRule, setActiveRoleplayRule] = useState<string | null>(null);
	const [scrollY, setScrollY] = useState(0);
	const [searchQuery, setSearchQuery] = useState('');
	const [communityRules, setCommunityRules] = useState<Rule[]>([]);
	const [roleplayRules, setRoleplayRules] = useState<Rule[]>([]);
	const [filteredCommunityRules, setFilteredCommunityRules] = useState<Rule[]>([]);
	const [filteredRoleplayRules, setFilteredRoleplayRules] = useState<Rule[]>([]);
	const [pinnedRules, setPinnedRules] = useState<Rule[]>([]);
	const [recentlyUpdatedRules, setRecentlyUpdatedRules] = useState<Rule[]>([]);
	const [activeTab, setActiveTab] = useState<string | null>('all');
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Edit rule state
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [currentRule, setCurrentRule] = useState<Rule | null>(null);
	const [editedContent, setEditedContent] = useState('');
	const [editedTitle, setEditedTitle] = useState('');
	const [editedTags, setEditedTags] = useState<string[]>([]);
	const [isPinned, setIsPinned] = useState(false);
	const [editedBadge, setEditedBadge] = useState('');
	const [changeNotes, setChangeNotes] = useState('');
	const [isSaving, setIsSaving] = useState(false);

	// Create rule state
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [newRule, setNewRule] = useState({
		badge: '',
		title: '',
		content: '',
		category: 'community' as 'community' | 'roleplay',
		tags: [] as string[],
		is_pinned: false,
	});

	// History state
	const [historyModalOpen, setHistoryModalOpen] = useState(false);
	const [ruleHistory, setRuleHistory] = useState<RuleChange[]>([]);
	const [historyLoading, setHistoryLoading] = useState(false);

	const { isAuthorized, user } = useAuth();
	const rulesRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		fetchRules();
	}, []);

	useEffect(() => {
		const handleScroll = () => {
			setScrollY(window.scrollY);
		};

		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, []);

	useEffect(() => {
		if (searchQuery.trim() === '') {
			setFilteredCommunityRules(communityRules);
			setFilteredRoleplayRules(roleplayRules);
		} else {
			const lowerCaseQuery = searchQuery.toLowerCase();

			setFilteredCommunityRules(communityRules.filter((rule) => rule.title.toLowerCase().includes(lowerCaseQuery) || rule.content.toLowerCase().includes(lowerCaseQuery) || rule.tags.some((tag) => tag.toLowerCase().includes(lowerCaseQuery)) || rule.badge.toLowerCase().includes(lowerCaseQuery)));

			setFilteredRoleplayRules(roleplayRules.filter((rule) => rule.title.toLowerCase().includes(lowerCaseQuery) || rule.content.toLowerCase().includes(lowerCaseQuery) || rule.tags.some((tag) => tag.toLowerCase().includes(lowerCaseQuery)) || rule.badge.toLowerCase().includes(lowerCaseQuery)));
		}
	}, [searchQuery, communityRules, roleplayRules]);

	const displayCommunityRules = activeTab === 'all' || activeTab === 'community';
	const displayRoleplayRules = activeTab === 'all' || activeTab === 'roleplay';

	const fetchRules = async () => {
		setIsLoading(true);
		try {
			const { data, error } = await supabase.from('rules').select('*').order('order_index');

			if (error) throw error;

			if (data) {
				setCommunityRules(data.filter((rule) => rule.category === 'community'));
				setRoleplayRules(data.filter((rule) => rule.category === 'roleplay'));
				setFilteredCommunityRules(data.filter((rule) => rule.category === 'community'));
				setFilteredRoleplayRules(data.filter((rule) => rule.category === 'roleplay'));
				setPinnedRules(data.filter((rule) => rule.is_pinned));

				const thirtyDaysAgo = new Date();
				thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 14);

				setRecentlyUpdatedRules(data.filter((rule) => new Date(rule.updated_at) > thirtyDaysAgo).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
			}

			setError(null);
		} catch (err) {
			console.error('Failed to fetch rules:', err);
			setError('Der opstod en fejl ved indlæsning af regler. Prøv venligst igen senere.');
		} finally {
			setIsLoading(false);
		}
	};

	const updateRule = async (ruleId: string, updates: any, notes: string = '') => {
		try {
			const { data: currentRule, error: fetchError } = await supabase.from('rules').select('*').eq('id', ruleId).single();

			if (fetchError) throw fetchError;

			const newVersion = currentRule.version + 1;

			const { error: changeError } = await supabase.from('rule_changes').insert({
				rule_id: ruleId,
				previous_content: currentRule.content,
				new_content: updates.content || currentRule.content,
				previous_title: currentRule.title,
				new_title: updates.title || currentRule.title,
				previous_tags: currentRule.tags,
				new_tags: updates.tags || currentRule.tags,
				previous_pinned: currentRule.is_pinned,
				new_pinned: updates.is_pinned !== undefined ? updates.is_pinned : currentRule.is_pinned,
				changed_by: updates.updated_by || 'Unknown',
				version: newVersion,
				change_notes: notes,
			});

			if (changeError) throw changeError;

			const { data, error } = await supabase
				.from('rules')
				.update({
					...updates,
					version: newVersion,
					updated_at: new Date().toISOString(),
				})
				.eq('id', ruleId);

			if (error) throw error;

			return data;
		} catch (error) {
			console.error('Error updating rule:', error);
			throw error;
		}
	};

	const createRule = async (rule: Omit<Rule, 'id' | 'created_at' | 'updated_at' | 'version' | 'updated_by' | 'order_index'>) => {
		try {
			const { data: maxOrderData, error: maxOrderError } = await supabase.from('rules').select('order_index').eq('category', rule.category).order('order_index', { ascending: false }).limit(1);

			if (maxOrderError) throw maxOrderError;

			const nextOrder = maxOrderData && maxOrderData.length > 0 ? maxOrderData[0].order_index + 1 : 0;

			const { data, error } = await supabase.from('rules').insert({
				...rule,
				order_index: nextOrder,
				updated_by: user?.username || 'Unknown',
				version: 1,
			});

			if (error) throw error;

			return data;
		} catch (error) {
			console.error('Error creating rule:', error);
			throw error;
		}
	};

	const fetchRuleHistory = async (ruleId: string) => {
		try {
			const { data, error } = await supabase.from('rule_changes').select('*').eq('rule_id', ruleId).order('version', { ascending: false });

			if (error) throw error;

			return data;
		} catch (error) {
			console.error('Error fetching rule history:', error);
			throw error;
		}
	};

	// Toggle pinned status
	const togglePinnedRule = async (rule: Rule) => {
		try {
			await updateRule(
				rule.id,
				{
					is_pinned: !rule.is_pinned,
					updated_by: user?.username || 'Unknown',
				},
				`Regel blev ${rule.is_pinned ? 'fjernet fra' : 'tilføjet til'} hurtig oversigt af ${user?.username || 'Unknown'}`
			);

			// Refresh rules
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

	// UI Handlers

	// Scroll to specific rule
	const scrollToRule = (ruleId: string) => {
		const element = document.getElementById(`rule-${ruleId}`);
		if (element) {
			// Check which category the rule belongs to
			const rule = [...communityRules, ...roleplayRules].find((r) => r.id === ruleId);

			if (rule) {
				// Set active tab
				setActiveTab(rule.category === 'community' ? 'community' : 'roleplay');

				// Set active accordion item
				if (rule.category === 'community') {
					setActiveCommunityRule(ruleId);
				} else {
					setActiveRoleplayRule(ruleId);
				}

				// Wait for tab switch and accordion to open
				setTimeout(() => {
					// Scroll to the element
					element.scrollIntoView({ behavior: 'smooth', block: 'center' });

					// Add highlighting effect
					element.classList.add('highlight-rule');
					setTimeout(() => {
						element.classList.remove('highlight-rule');
					}, 2000);
				}, 100);
			}
		}
	};

	// Open edit modal
	const openEditModal = (rule: Rule) => {
		setCurrentRule(rule);
		setEditedTitle(rule.title);
		setEditedContent(rule.content);
		setEditedTags(rule.tags || []);
		setIsPinned(rule.is_pinned);
		setEditedBadge(rule.badge);
		setChangeNotes('');
		setEditModalOpen(true);
	};

	// Save edited rule
	const handleSaveRule = async () => {
		if (!currentRule) return;

		setIsSaving(true);
		try {
			await updateRule(
				currentRule.id,
				{
					title: editedTitle,
					content: editedContent,
					tags: editedTags,
					is_pinned: isPinned,
					badge: editedBadge,
					updated_by: user?.username || 'Unknown',
				},
				changeNotes
			);

			// Refresh rules
			fetchRules();

			notifications.show({
				title: 'Regel opdateret',
				message: 'Reglen er blevet opdateret med succes',
				color: 'green',
			});

			setEditModalOpen(false);
		} catch (error) {
			console.error('Error updating rule:', error);
			notifications.show({
				title: 'Fejl',
				message: 'Der opstod en fejl under opdatering af reglen',
				color: 'red',
			});
		} finally {
			setIsSaving(false);
		}
	};

	// Create new rule
	const handleCreateRule = async () => {
		if (!newRule.badge || !newRule.title || !newRule.content) {
			notifications.show({
				title: 'Manglende information',
				message: 'Venligst udfyld alle påkrævede felter',
				color: 'red',
			});
			return;
		}

		try {
			await createRule({
				badge: newRule.badge,
				title: newRule.title,
				content: newRule.content,
				category: newRule.category,
				tags: newRule.tags,
				is_pinned: newRule.is_pinned,
			});

			// Reset form
			setNewRule({
				badge: '',
				title: '',
				content: '',
				category: 'community',
				tags: [],
				is_pinned: false,
			});

			// Refresh rules
			fetchRules();

			notifications.show({
				title: 'Regel oprettet',
				message: 'Den nye regel er blevet oprettet med succes',
				color: 'green',
			});

			setCreateModalOpen(false);
		} catch (error) {
			console.error('Error creating rule:', error);
			notifications.show({
				title: 'Fejl',
				message: 'Der opstod en fejl under oprettelse af reglen',
				color: 'red',
			});
		}
	};

	// Open history modal
	const openHistoryModal = async (ruleId: string) => {
		setHistoryLoading(true);
		setHistoryModalOpen(true);
		try {
			const history = await fetchRuleHistory(ruleId);
			setRuleHistory(history || []);
		} catch (error) {
			console.error('Error fetching rule history:', error);
			notifications.show({
				title: 'Fejl',
				message: 'Der opstod en fejl ved hentning af regelhistorik',
				color: 'red',
			});
		} finally {
			setHistoryLoading(false);
		}
	};

	// Export rules to JSON
	const exportRules = () => {
		const data = {
			community: communityRules,
			roleplay: roleplayRules,
		};

		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = `odessa_rules_${new Date().toISOString().split('T')[0]}.json`;
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

	const RuleItem = ({ rule }: { rule: Rule }) => {
		const isActive = rule.category === 'community' ? rule.id === activeCommunityRule : rule.id === activeRoleplayRule;

		const handleEditClick = (e: React.MouseEvent) => {
			e.stopPropagation();
			openEditModal(rule);
		};

		const handlePinClick = (e: React.MouseEvent) => {
			e.stopPropagation();
			togglePinnedRule(rule);
		};

		const handleHistoryClick = (e: React.MouseEvent) => {
			e.stopPropagation();
			openHistoryModal(rule.id);
		};

		const handleBadgeClick = (e: React.MouseEvent) => {
			e.stopPropagation();
			scrollToRule(rule.id);
		};

		return (
			<Accordion.Item value={rule.id} key={rule.id} id={`rule-${rule.id}`} className={isActive ? 'active-rule' : ''}>
				<Accordion.Control>
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
									<ActionIcon
										size='sm'
										color='blue'
										onClick={handleEditClick}
										component='div'
									>
										<Pencil size={16} />
									</ActionIcon>
								</Tooltip>
								<Tooltip label={rule.is_pinned ? 'Fjern fra oversigt' : 'Fastgør til oversigt'}>
									<ActionIcon
										size='sm'
										color={rule.is_pinned ? 'yellow' : 'gray'}
										onClick={handlePinClick}
										component='div'
									>
										<PushPin size={16} weight={rule.is_pinned ? 'fill' : 'regular'} />
									</ActionIcon>
								</Tooltip>
								<Tooltip label='Vis historie'>
									<ActionIcon
										size='sm'
										color='gray'
										onClick={handleHistoryClick}
										component='div'
									>
										<ClockCounterClockwise size={16} />
									</ActionIcon>
								</Tooltip>
							</Group>
						)}
					</Group>
				</Accordion.Control>
				<Accordion.Panel>{rule.content}</Accordion.Panel>
			</Accordion.Item>
		);
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
						backgroundImage: 'linear-gradient(135deg, #111111 25%, #1a1a1a 25%, #1a1a1a 50%, #111111 50%, #111111 75%, #1a1a1a 75%, #1a1a1a 100%)',
						backgroundSize: '40px 40px',
						opacity: 0.5,
						transform: `translateY(${scrollY * 0.1}px)`,
						pointerEvents: 'none',
						zIndex: 0,
					}}
				/>

				<Box
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background: 'radial-gradient(circle at 50% 50%, rgba(13, 13, 13, 0.7) 0%, rgba(10, 10, 10, 0.9) 70%, rgba(8, 8, 8, 0.95) 100%)',
						pointerEvents: 'none',
						zIndex: 0,
					}}
				/>

				<Container size='lg' py='xl' style={{ position: 'relative', zIndex: 1 }}>
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
								<TextInput leftSection={<MagnifyingGlass size={18} />} placeholder='Søg efter regler...' value={searchQuery} onChange={(event) => setSearchQuery(event.currentTarget.value)} style={{ flexGrow: 1 }} rightSection={searchQuery ? <X size={16} style={{ cursor: 'pointer' }} onClick={() => setSearchQuery('')} /> : null} />
							</Group>

							<Tabs value={activeTab} onChange={setActiveTab}>
								<Tabs.List>
									<Tabs.Tab value='all'>Alle Regler</Tabs.Tab>
									<Tabs.Tab value='community'>Discord & Community Regler</Tabs.Tab>
									<Tabs.Tab value='roleplay'>Rollespils Regler</Tabs.Tab>
								</Tabs.List>
							</Tabs>
						</Box>

						<Paper withBorder p='md' radius='md' mb='xl' style={{ backgroundColor: 'rgba(30, 30, 30, 0.6)' }}>
							<Group mb='sm'>
								<Lightbulb size={24} color='#FFD700' />
								<Title order={4}>Hurtigt Overblik - Vigtigste Regler</Title>
							</Group>
							<List spacing='xs' size='sm'>
								{pinnedRules.length > 0 ? (
									pinnedRules.map((rule) => (
										<List.Item key={rule.id}>
											<Group gap='xs'>
												<Badge size='sm' color={rule.category === 'community' ? 'blue' : 'green'} style={{ cursor: 'pointer' }} onClick={() => scrollToRule(rule.id)}>
													{rule.badge}
												</Badge>
												<Text>{rule.title}</Text>
											</Group>
										</List.Item>
									))
								) : (
									<Text c='dimmed'>Ingen fastgjorte regler endnu. Admin kan fastgøre regler for at vise dem her.</Text>
								)}
							</List>
						</Paper>

						{recentlyUpdatedRules.length > 0 && (
							<Alert icon={<Info size={24} />} title='Nyligt Opdaterede Regler' color='blue' mb='xl' variant='outline'>
								<Text size='sm' mb='xs'>
									Følgende regler er blevet opdateret inden for de sidste 14 dage:
								</Text>
								<Group>
									{recentlyUpdatedRules.map((rule) => (
										<Chip key={rule.id} checked={false} onClick={() => scrollToRule(rule.id)}>
											{rule.badge}: {rule.title}
										</Chip>
									))}
								</Group>
							</Alert>
						)}

						{isLoading ? (
							<Center p='xl'>
								<Loader size='lg' />
							</Center>
						) : (
							<>
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

										<Accordion value={activeCommunityRule} onChange={setActiveCommunityRule} radius='md' variant='filled'>
											{filteredCommunityRules.length > 0 ? (
												filteredCommunityRules.map((rule) => <RuleItem key={rule.id} rule={rule} />)
											) : (
												<Text ta='center' fs='italic' py='md'>
													Ingen regler matcher din søgning
												</Text>
											)}
										</Accordion>
									</Box>
								)}

								{displayCommunityRules && displayRoleplayRules && (
									<Divider
										my='xl'
										style={{
											position: 'relative',
											overflow: 'visible',
										}}
										label={
											<Badge size='lg' radius='sm' variant='light'>
												OdessaRP
											</Badge>
										}
										labelPosition='center'
									/>
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

										<Accordion value={activeRoleplayRule} onChange={setActiveRoleplayRule} radius='md' variant='filled'>
											{filteredRoleplayRules.length > 0 ? (
												filteredRoleplayRules.map((rule) => <RuleItem key={rule.id} rule={rule} />)
											) : (
												<Text ta='center' fs='italic' py='md'>
													Ingen regler matcher din søgning
												</Text>
											)}
										</Accordion>
									</Box>
								)}
							</>
						)}
					</Paper>
				</Container>
			</Box>

			{/* Edit Rule Modal */}
			<Modal opened={editModalOpen} onClose={() => setEditModalOpen(false)} title={<Text fw={700}>Rediger Regel {currentRule?.badge}</Text>} size='lg'>
				{currentRule && (
					<Box>
						<Group grow mb='md'>
							<TextInput label='Badge' value={editedBadge} onChange={(e) => setEditedBadge(e.target.value)} required />
							<TextInput label='Titel' value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} required />
						</Group>

						<Tabs defaultValue='edit'>
							<Tabs.List mb='xs'>
								<Tabs.Tab value='edit' leftSection={<Pencil size={14} />}>
									Rediger
								</Tabs.Tab>
								<Tabs.Tab value='preview' leftSection={<Eye size={14} />}>
									Forhåndsvisning
								</Tabs.Tab>
							</Tabs.List>

							<Tabs.Panel value='edit' pt='xs'>
								<Textarea label='Indhold' value={editedContent} onChange={(e) => setEditedContent(e.target.value)} minRows={10} mb='md' required />
							</Tabs.Panel>

							<Tabs.Panel value='preview' pt='xs'>
								<Paper withBorder p='md' style={{ minHeight: '200px' }}>
									{editedContent}
								</Paper>
							</Tabs.Panel>
						</Tabs>

						<MultiSelect
							label='Tags'
							data={[
								{ value: 'behavior', label: 'Opførsel' },
								{ value: 'combat', label: 'Kamp' },
								{ value: 'roleplay', label: 'Rollespil' },
								{ value: 'ooc', label: 'OOC' },
								{ value: 'fear', label: 'Fear RP' },
								{ value: 'rdm', label: 'RDM' },
								{ value: 'vdm', label: 'VDM' },
								{ value: 'metagaming', label: 'Metagaming' },
								{ value: 'powergaming', label: 'Powergaming' },
								{ value: 'nlr', label: 'NLR' },
								{ value: 'support', label: 'Support' },
								{ value: 'staff', label: 'Staff' },
								{ value: 'discord', label: 'Discord' },
							]}
							value={editedTags}
							onChange={setEditedTags}
							mb='md'
							searchable
						/>

						<Switch label='Fastgør til Hurtigt Overblik' checked={isPinned} onChange={(e) => setIsPinned(e.currentTarget.checked)} mb='md' />

						<Textarea label='Ændringsnoter (valgfrit)' placeholder='Beskriv kort hvad der er ændret og hvorfor' value={changeNotes} onChange={(e) => setChangeNotes(e.target.value)} mb='lg' />

						<Group justify='right'>
							<Button variant='outline' onClick={() => setEditModalOpen(false)}>
								Annuller
							</Button>
							<Button onClick={handleSaveRule} loading={isSaving}>
								Gem Ændringer
							</Button>
						</Group>
					</Box>
				)}
			</Modal>

			{/* Create Rule Modal */}
			<Modal opened={createModalOpen} onClose={() => setCreateModalOpen(false)} title={<Text fw={700}>Opret Ny Regel</Text>} size='lg'>
				<Box>
					<Group grow mb='md'>
						<TextInput label='Badge' placeholder='F.eks. C1 eller §8' value={newRule.badge} onChange={(e) => setNewRule({ ...newRule, badge: e.target.value })} required />
						<TextInput label='Titel' placeholder='Regel titel' value={newRule.title} onChange={(e) => setNewRule({ ...newRule, title: e.target.value })} required />
					</Group>

					<SegmentedControl
						mb='md'
						fullWidth
						value={newRule.category}
						onChange={(value: string) => setNewRule({ ...newRule, category: value as 'community' | 'roleplay' })}
						data={[
							{ label: 'Community Regel', value: 'community' },
							{ label: 'Rollespils Regel', value: 'roleplay' },
						]}
					/>

					<Tabs defaultValue='edit'>
						<Tabs.List mb='xs'>
							<Tabs.Tab value='edit' leftSection={<Pencil size={14} />}>
								Rediger
							</Tabs.Tab>
							<Tabs.Tab value='preview' leftSection={<Eye size={14} />}>
								Forhåndsvisning
							</Tabs.Tab>
						</Tabs.List>

						<Tabs.Panel value='edit' pt='xs'>
							<Textarea label='Indhold' placeholder='Regelens indhold' value={newRule.content} onChange={(e) => setNewRule({ ...newRule, content: e.target.value })} minRows={10} mb='md' required />
						</Tabs.Panel>

						<Tabs.Panel value='preview' pt='xs'>
							<Paper withBorder p='md' style={{ minHeight: '200px' }}>
								{newRule.content}
							</Paper>
						</Tabs.Panel>
					</Tabs>

					<MultiSelect
						label='Tags'
						data={[
							{ value: 'behavior', label: 'Opførsel' },
							{ value: 'combat', label: 'Kamp' },
							{ value: 'roleplay', label: 'Rollespil' },
							{ value: 'ooc', label: 'OOC' },
							{ value: 'fear', label: 'Fear RP' },
							{ value: 'rdm', label: 'RDM' },
							{ value: 'vdm', label: 'VDM' },
							{ value: 'metagaming', label: 'Metagaming' },
							{ value: 'powergaming', label: 'Powergaming' },
							{ value: 'nlr', label: 'NLR' },
							{ value: 'support', label: 'Support' },
							{ value: 'staff', label: 'Staff' },
							{ value: 'discord', label: 'Discord' },
						]}
						value={newRule.tags}
						onChange={(value) => setNewRule({ ...newRule, tags: value })}
						mb='md'
						searchable
					/>

					<Switch label='Fastgør til Hurtigt Overblik' checked={newRule.is_pinned} onChange={(e) => setNewRule({ ...newRule, is_pinned: e.currentTarget.checked })} mb='lg' />

					<Group justify='right'>
						<Button variant='outline' onClick={() => setCreateModalOpen(false)}>
							Annuller
						</Button>
						<Button onClick={handleCreateRule}>Opret Regel</Button>
					</Group>
				</Box>
			</Modal>

			{/* Rule History Modal */}
			<Modal opened={historyModalOpen} onClose={() => setHistoryModalOpen(false)} title={<Text fw={700}>Regel Historik</Text>} size='xl'>
				{historyLoading ? (
					<Center p='xl'>
						<Loader />
					</Center>
				) : (
					<Box>
						{ruleHistory.length === 0 ? (
							<Text ta='center' c='dimmed' py='xl'>
								Ingen ændringshistorik fundet for denne regel
							</Text>
						) : (
							<Timeline active={0} bulletSize={24} lineWidth={2}>
								{ruleHistory.map((change) => (
									<Timeline.Item
										key={change.id}
										bullet={<Check size={12} />}
										title={
											<Group>
												<Text fw={700}>Version {change.version}</Text>
												{change.previous_pinned !== change.new_pinned && (
													<Badge color={change.new_pinned ? 'yellow' : 'gray'} variant='light'>
														{change.new_pinned ? 'Fastgjort' : 'Fjernet fra oversigt'}
													</Badge>
												)}
											</Group>
										}
									>
										<Group>
											<Text size='sm' c='dimmed'>
												{new Date(change.changed_at).toLocaleString('da-DK')}
											</Text>
											<Text size='sm'>Ændret af: {change.changed_by || 'Ukendt'}</Text>
										</Group>

										{change.change_notes && (
											<Card mt='xs' withBorder p='xs'>
												<Text size='sm'>{change.change_notes}</Text>
											</Card>
										)}

										<Accordion mt='xs'>
											<Accordion.Item value='changes'>
												<Accordion.Control>
													<Text size='sm'>Se detaljerede ændringer</Text>
												</Accordion.Control>
												<Accordion.Panel>
													{change.previous_title !== change.new_title && (
														<Box mb='md'>
															<Text fw={500} size='sm'>
																Titel ændret:
															</Text>
															<Text size='sm' style={{ textDecoration: 'line-through' }} c='red.5'>
																{change.previous_title}
															</Text>
															<Text size='sm' c='green.5'>
																{change.new_title}
															</Text>
														</Box>
													)}

													<Tabs defaultValue='diff'>
														<Tabs.List>
															<Tabs.Tab value='diff'>Indhold ændringer</Tabs.Tab>
															<Tabs.Tab value='before'>Før</Tabs.Tab>
															<Tabs.Tab value='after'>Efter</Tabs.Tab>
														</Tabs.List>

														<Tabs.Panel value='diff' pt='md'>
															<Box>
																<Text>Simple sammenligning:</Text>
																{change.previous_content === change.new_content ? (
																	<Text c='dimmed' fs='italic'>
																		Ingen ændringer i indhold
																	</Text>
																) : (
																	<Box>
																		<Box mb='sm'>
																			<Text fw={500} size='sm'>
																				Gammel version:
																			</Text>
																			<Paper withBorder p='sm' style={{ backgroundColor: '#ffeeee' }} c='dark.5'>
																				{change.previous_content}
																			</Paper>
																		</Box>
																		<Box>
																			<Text fw={500} size='sm'>
																				Ny version:
																			</Text>
																			<Paper withBorder p='sm' style={{ backgroundColor: '#eeffee' }} c='dark.5'>
																				{change.new_content}
																			</Paper>
																		</Box>
																	</Box>
																)}
															</Box>
														</Tabs.Panel>

														<Tabs.Panel value='before' pt='md'>
															<Paper withBorder p='sm' style={{ maxHeight: '300px', overflow: 'auto' }}>
																{change.previous_content}
															</Paper>
														</Tabs.Panel>

														<Tabs.Panel value='after' pt='md'>
															<Paper withBorder p='sm' style={{ maxHeight: '300px', overflow: 'auto' }}>
																{change.new_content}
															</Paper>
														</Tabs.Panel>
													</Tabs>

													{/* Show tags changes if they exist */}
													{(!change.previous_tags || !change.new_tags || JSON.stringify(change.previous_tags) !== JSON.stringify(change.new_tags)) && (
														<Box mt='md'>
															<Text fw={500} size='sm'>
																Tags ændret:
															</Text>
															<Group>
																<Box>
																	<Text size='sm'>Før:</Text>
																	<Group mt='xs'>
																		{change.previous_tags && change.previous_tags.length > 0 ? (
																			change.previous_tags.map((tag, index) => (
																				<Badge key={index} color='gray'>
																					{tag}
																				</Badge>
																			))
																		) : (
																			<Text size='sm' c='dimmed'>
																				Ingen tags
																			</Text>
																		)}
																	</Group>
																</Box>
																<ArrowRight size={16} />
																<Box>
																	<Text size='sm'>Efter:</Text>
																	<Group mt='xs'>
																		{change.new_tags && change.new_tags.length > 0 ? (
																			change.new_tags.map((tag, index) => (
																				<Badge key={index} color='blue'>
																					{tag}
																				</Badge>
																			))
																		) : (
																			<Text size='sm' c='dimmed'>
																				Ingen tags
																			</Text>
																		)}
																	</Group>
																</Box>
															</Group>
														</Box>
													)}
												</Accordion.Panel>
											</Accordion.Item>
										</Accordion>
									</Timeline.Item>
								))}
							</Timeline>
						)}
					</Box>
				)}
			</Modal>
		</MainLayout>
	);
}
