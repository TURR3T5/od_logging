import { Group, Tabs, SegmentedControl, Text, Switch } from '../mantine';
import { Bell, FileText, Calendar } from 'lucide-react';

interface ContentFiltersProps {
	activeTab: string | null;
	setActiveTab: (value: string | null) => void;
	viewMode: 'calendar' | 'grid';
	setViewMode: (value: 'calendar' | 'grid') => void;
	showPinnedOnly: boolean;
	setShowPinnedOnly: (value: boolean) => void;
}

export function ContentFilters({ activeTab, setActiveTab, viewMode, setViewMode, showPinnedOnly, setShowPinnedOnly }: ContentFiltersProps) {
	return (
		<Group justify='space-between' mb='md'>
			<Tabs value={activeTab} onChange={setActiveTab}>
				<Tabs.List>
					<Tabs.Tab value='all' leftSection={<Bell size={16} />}>
						Alle
					</Tabs.Tab>
					<Tabs.Tab value='news' leftSection={<FileText size={16} />}>
						Nyheder
					</Tabs.Tab>
					<Tabs.Tab value='events' leftSection={<Calendar size={16} />}>
						Events
					</Tabs.Tab>
				</Tabs.List>
			</Tabs>

			<Group>
				{activeTab === 'events' && (
					<SegmentedControl
						value={viewMode}
						onChange={(value) => setViewMode(value as 'calendar' | 'grid')}
						data={[
							{ label: 'Kalender', value: 'calendar' },
							{ label: 'Grid', value: 'grid' },
						]}
					/>
				)}

				<Group gap='xs'>
					<Text size='sm'>Kun fastgjorte</Text>
					<Switch checked={showPinnedOnly} onChange={(event) => setShowPinnedOnly(event.currentTarget.checked)} />
				</Group>
			</Group>
		</Group>
	);
}
