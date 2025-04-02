import { Title, Text, Box, Group, TextInput, ActionIcon, Button, Tabs } from '@mantine/core';
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

			<Group justify='space-between' mb='lg'>
				<Title order={1} c='gray.3' fw={800}>
					OdessaRP Regelsæt
				</Title>

				{isAuthorized && (
					<Group>
						<Button leftSection={<Plus size={16} />} color='blue' onClick={onCreateRule}>
							Opret ny regel
						</Button>
						<Button variant='outline' leftSection={<FileDown size={16} />} onClick={onExportRules}>
							Eksporter regler
						</Button>
					</Group>
				)}
			</Group>

			<Box mb='xl'>
				<Group justify='space-between' mb='md'>
					<TextInput
						leftSection={<Search size={18} />}
						placeholder='Søg efter regler...'
						value={searchInput}
						onChange={(event) => onSearchChange(event.currentTarget.value)}
						style={{ flexGrow: 1 }}
						rightSection={
							searchInput ? (
								<ActionIcon
									onClick={() => {
										onSearchChange('');
									}}
								>
									<X size={16} />
								</ActionIcon>
							) : null
						}
					/>
				</Group>

				<Tabs value={activeTab} onChange={onTabChange}>
					<Tabs.List>
						<Tabs.Tab value='all'>Alle Regler</Tabs.Tab>
						<Tabs.Tab value='community'>Discord & Community Regler</Tabs.Tab>
						<Tabs.Tab value='roleplay'>Rollespils Regler</Tabs.Tab>
					</Tabs.List>
				</Tabs>
			</Box>
		</>
	);
}

export default RulesHeader;
