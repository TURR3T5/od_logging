import { Title, Text, Box, Group, Stack, TextInput, ActionIcon, Button, Tabs } from '@mantine/core';
import { Search, X, Plus, FileDown } from 'lucide-react';

interface RulesHeaderProps {
	searchInput: string;
	onSearchChange: (value: string) => void;
	activeTab: string | null;
	onTabChange: (value: string | null) => void;
	isAuthorized: boolean;
	onCreateRule: () => void;
	onExportRules: () => void;
}

export function RulesHeader({ searchInput, onSearchChange, activeTab, onTabChange, isAuthorized, onCreateRule, onExportRules }: RulesHeaderProps) {
	return (
		<>
			<Box
				style={{
					background: 'linear-gradient(to right, rgba(225, 29, 72, 0.1), rgba(225, 29, 72, 0.02))',
					padding: '16px',
					borderRadius: '8px',
					marginBottom: '24px',
					borderLeft: '4px solid #e11d48',
				}}
			>
				<Text size='lg' fw={700} c='red.4'>
					DET ER ENHVER SPILLERS EGET ANSVAR AT HOLDE SIG OPDATERET PÅ ODESSA'S REGELSÆT - NYE/ÆNDREDE REGLER VIL ALTID BLIVE MELDT UD I DISCORD
				</Text>
			</Box>

			<Stack gap='lg'>
				<Group justify='space-between' align='center' wrap='wrap'>
					<Title order={1} c='gray.3' fw={800} style={{ flexGrow: 1 }}>
						OdessaRP Regelsæt
					</Title>

					{isAuthorized && (
						<Group gap='xs' wrap='wrap'>
							<Button leftSection={<Plus size={16} />} color='blue' onClick={onCreateRule} size='xs' variant='filled'>
								Opret ny regel
							</Button>
							<Button variant='outline' leftSection={<FileDown size={16} />} onClick={onExportRules} size='xs'>
								Eksporter regler
							</Button>
						</Group>
					)}
				</Group>

				<Box>
					<Stack gap='md'>
						<TextInput
							leftSection={<Search size={18} />}
							placeholder='Søg efter regler...'
							value={searchInput}
							onChange={(event) => onSearchChange(event.currentTarget.value)}
							rightSection={
								searchInput ? (
									<ActionIcon
										onClick={() => {
											onSearchChange('');
										}}
										size='sm'
									>
										<X size={16} />
									</ActionIcon>
								) : null
							}
						/>

						<Tabs value={activeTab} onChange={onTabChange}>
							<Tabs.List grow>
								<Tabs.Tab value='all'>Alle Regler</Tabs.Tab>
								<Tabs.Tab value='community'>Community</Tabs.Tab>
								<Tabs.Tab value='roleplay'>Rollespil</Tabs.Tab>
							</Tabs.List>
						</Tabs>
					</Stack>
				</Box>
			</Stack>
		</>
	);
}

export default RulesHeader;
