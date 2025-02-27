import { useState } from 'react';
import { Box, ScrollArea, Group, Text, Collapse, ThemeIcon, UnstyledButton } from '@mantine/core';
import { Gauge, Package, Users, ShoppingCart, Car, Gavel, FileText, CaretRight, IconWeight } from '@phosphor-icons/react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { DEFAULT_THEME } from '@mantine/core';

// Define the sidebar section types
interface SidebarItem {
	label: string;
	icon: React.FC<{ size?: number; weight?: IconWeight }>;
	path?: string;
	children?: SidebarItem[];
}

// Define sections for the sidebar - this could be moved to a config file
const sidebarSections: SidebarItem[] = [
	{
		label: 'Dashboard',
		icon: Gauge,
		path: '/logs',
	},
	{
		label: 'Inventory',
		icon: Package,
		children: [
			{ label: 'Items', path: '/logs?category=inventory&type=items', icon: Package },
			{ label: 'Shops', path: '/logs?category=inventory&type=shops', icon: ShoppingCart },
			{ label: 'Crafting', path: '/logs?category=inventory&type=crafting', icon: Package },
		],
	},
	{
		label: 'Players',
		icon: Users,
		children: [
			{ label: 'Connections', path: '/logs?category=players&type=connections', icon: Users },
			{ label: 'Characters', path: '/logs?category=players&type=characters', icon: Users },
		],
	},
	{
		label: 'Vehicles',
		icon: Car,
		children: [
			{ label: 'Spawned', path: '/logs?category=vehicles&type=spawned', icon: Car },
			{ label: 'Purchases', path: '/logs?category=vehicles&type=purchases', icon: ShoppingCart },
		],
	},
	{
		label: 'Admin',
		icon: Gavel,
		children: [
			{ label: 'Actions', path: '/logs?category=admin&type=actions', icon: Gavel },
			{ label: 'Reports', path: '/logs?category=admin&type=reports', icon: FileText },
		],
	},
];

// Component for a sidebar section with optional collapsible subsections
const SidebarSection = ({ item, expanded, toggle, isActive }: { item: SidebarItem; expanded: boolean; toggle: () => void; isActive: boolean }) => {
	const navigate = useNavigate();
	const hasChildren = !!item.children && item.children.length > 0;

	const handleClick = () => {
		if (hasChildren) {
			toggle();
		} else if (item.path) {
			navigate({ to: item.path });
		}
	};

	return (
		<>
			<UnstyledButton onClick={handleClick} className={`block w-full px-3 py-2 rounded-sm text-gray-0 transition-colors duration-200 ${isActive ? 'bg-dark-6' : ''} hover:bg-dark-5`}>
				<Group justify='space-between'>
					<Group gap='xs'>
						<ThemeIcon variant='light' size={30} color='blue'>
							<item.icon size={18} />
						</ThemeIcon>
						<Text>{item.label}</Text>
					</Group>
					{hasChildren && (
						<div className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
							<CaretRight size={16} />
						</div>
					)}
				</Group>
			</UnstyledButton>

			{hasChildren && (
				<Collapse in={expanded}>
					<div className='pl-9'>
						{item.children?.map((child, index) => (
							<SubItem key={index} item={child} />
						))}
					</div>
				</Collapse>
			)}
		</>
	);
};

// Component for a subsection
const SubItem = ({ item }: { item: SidebarItem }) => {
	const navigate = useNavigate();
	const router = useRouter();

	// Check if the current path matches this item's path
	const isActive = item.path ? router.state.location.pathname + router.state.location.search === item.path : false;

	return (
		<UnstyledButton onClick={() => item.path && navigate({ to: item.path })} className={`block w-full py-2 transition-colors duration-200 ${isActive ? 'text-blue-4 font-semibold' : 'text-gray-3'} hover:text-blue-2`}>
			<Group gap='xs'>
				{item.icon && <item.icon size={16} />}
				<Text size='sm'>{item.label}</Text>
			</Group>
		</UnstyledButton>
	);
};

interface SidebarProps {
	opened: boolean;
}

export default function Sidebar({ opened }: SidebarProps) {
	const router = useRouter();
	const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

	// Toggle expanded state for a section
	const toggleSection = (label: string) => {
		setExpandedSections((prev) => ({
			...prev,
			[label]: !prev[label],
		}));
	};

	// Check if a section should be highlighted as active
	const isSectionActive = (item: SidebarItem): boolean => {
		const currentPath = router.state.location.pathname + router.state.location.search;

		if (item.path && currentPath === item.path) {
			return true;
		}

		if (item.children) {
			return item.children.some((child) => child.path && currentPath === child.path);
		}

		return false;
	};

	return (
		<nav className={`h-full w-[320px] p-8 bg-[#141414] ${opened ? '' : 'hidden'} sm:block`}>
			<div className='flex-1 overflow-auto'>
				<ScrollArea>
					{sidebarSections.map((section, index) => (
						<Box key={index} mb='sm'>
							<SidebarSection item={section} expanded={!!expandedSections[section.label]} toggle={() => toggleSection(section.label)} isActive={isSectionActive(section)} />
						</Box>
					))}
				</ScrollArea>
			</div>
		</nav>
	);
}
