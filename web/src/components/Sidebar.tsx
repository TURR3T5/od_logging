import { useState, useEffect } from 'react';
import { Box, ScrollArea, Text, Collapse } from '@mantine/core';
import { CaretRight } from '@phosphor-icons/react';
import { useNavigate, useRouter } from '@tanstack/react-router';

interface SidebarItem {
	label: string;
	path?: string;
	children?: SidebarItem[];
}

const sidebarSections: SidebarItem[] = [
	{
		label: 'Inventory',
		children: [
			{ label: 'Items', path: '/logs?category=inventory&type=items' },
			{ label: 'Shops', path: '/logs?category=inventory&type=shops' },
			{ label: 'Crafting', path: '/logs?category=inventory&type=crafting' },
		],
	},
	{
		label: 'Players',
		children: [
			{ label: 'Connections', path: '/logs?category=players&type=connections' },
			{ label: 'Characters', path: '/logs?category=players&type=characters' },
		],
	},
	{
		label: 'Vehicles',
		children: [
			{ label: 'Spawned', path: '/logs?category=vehicles&type=spawned' },
			{ label: 'Purchases', path: '/logs?category=vehicles&type=purchases' },
		],
	},
	{
		label: 'Admin',
		children: [
			{ label: 'Actions', path: '/logs?category=admin&type=actions' },
			{ label: 'Reports', path: '/logs?category=admin&type=reports' },
		],
	},
];

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
			<div
				onClick={handleClick}
				className={`
          flex justify-between items-center px-3 py-2.5 rounded-md 
          ${isActive ? 'bg-blue-50 text-blue-800 font-medium' : 'text-gray-700 hover:text-gray-900'} 
          hover:bg-gray-100 cursor-pointer transition-colors
        `}
			>
				<Text size='sm'>{item.label}</Text>
				{hasChildren && (
					<span className={`transform transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
						<CaretRight size={16} className={isActive ? 'text-blue-600' : 'text-[#a3a3a3]'} />
					</span>
				)}
			</div>

			{hasChildren && (
				<Collapse in={expanded}>
					<div className='ml-3 pl-3 border-l border-gray-200 my-1'>
						{item.children?.map((child, index) => (
							<SubItem key={index} item={child} />
						))}
					</div>
				</Collapse>
			)}
		</>
	);
};

const SubItem = ({ item }: { item: SidebarItem }) => {
	const navigate = useNavigate();
	const router = useRouter();
	const isActive = item.path ? router.state.location.pathname + router.state.location.search === item.path : false;

	return (
		<div
			onClick={() => item.path && navigate({ to: item.path })}
			className={`
        px-3 py-2 my-0.5 rounded-md cursor-pointer text-sm 
        ${isActive ? 'bg-blue-50 text-blue-800 font-medium' : 'text-gray-600 hover:text-gray-900'} 
        hover:bg-gray-100 transition-colors
      `}
		>
			{item.label}
		</div>
	);
};

interface SidebarProps {
	opened: boolean;
}

export default function Sidebar({ opened }: SidebarProps) {
	const router = useRouter();
	const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

	const toggleSection = (label: string) => {
		setExpandedSections((prev) => ({
			...prev,
			[label]: !prev[label],
		}));
	};

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

	useEffect(() => {
		const newExpandedSections: Record<string, boolean> = {};

		sidebarSections.forEach((section) => {
			if (isSectionActive(section)) {
				newExpandedSections[section.label] = true;
			}
		});

		setExpandedSections((prev) => ({
			...prev,
			...newExpandedSections,
		}));
	}, [router.state.location.pathname, router.state.location.search]);

	return (
		<nav className={`h-full w-[260px] ${opened ? '' : 'hidden'} sm:block`}>
			<div className='p-4 h-full'>
				<ScrollArea className='h-full'>
					{sidebarSections.map((section, index) => (
						<Box key={index} mb={2}>
							<SidebarSection item={section} expanded={!!expandedSections[section.label]} toggle={() => toggleSection(section.label)} isActive={isSectionActive(section)} />
						</Box>
					))}
				</ScrollArea>
			</div>
		</nav>
	);
}
