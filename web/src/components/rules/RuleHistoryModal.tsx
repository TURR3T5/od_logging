import { useEffect, useState } from 'react';
import { Box, Center, Text, Group, Badge, Card, Tabs, Paper, Timeline, Modal, Accordion, Loader } from '@mantine/core';
import { ArrowRight, Check } from '@phosphor-icons/react';
import RuleApiService, { RuleChange } from '../../lib/RuleApiService';
import { EmptyState } from '../common/EmptyState';

interface RuleHistoryModalProps {
	ruleId: string;
	opened: boolean;
	onClose: () => void;
}

export default function RuleHistoryModal({ ruleId, opened, onClose }: RuleHistoryModalProps) {
	const [ruleHistory, setRuleHistory] = useState<RuleChange[]>([]);
	const [historyLoading, setHistoryLoading] = useState(false);

	useEffect(() => {
		const fetchRuleHistory = async () => {
			if (!opened || !ruleId) return;

			setHistoryLoading(true);
			try {
				const history = await RuleApiService.getRuleHistory(ruleId);
				setRuleHistory(history);
			} catch (error) {
				console.error('Error fetching rule history:', error);
			} finally {
				setHistoryLoading(false);
			}
		};

		fetchRuleHistory();
	}, [ruleId, opened]);

	return (
		<Modal opened={opened} onClose={onClose} title={<Text fw={700}>Regel Historik</Text>} size='xl'>
			{historyLoading ? (
				<Center p='xl'>
					<Loader />
				</Center>
			) : (
				<Box>
					{ruleHistory.length === 0 ? (
						<EmptyState title="Ingen data" message="Der er ingen data at vise." />
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
	);
}
