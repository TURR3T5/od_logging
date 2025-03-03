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

// Store active section and item
const useActiveState = () => {
	const router = useRouter();
	const search = router.state.location.search;

	// Extract category and type from search params
	const params = new URLSearchParams(search);
	const activeCategory = params.get('category') || '';
	const activeType = params.get('type') || '';

	// Find active section and item indexes
	let activeSectionIndex = -1;
	let activeItemIndex = -1;

	sidebarSections.forEach((section, sIndex) => {
		if (section.children) {
			section.children.forEach((item, iIndex) => {
				if (!item.path) return;

				const itemParams = new URLSearchParams(new URL(item.path, 'http://example.com').search);
				const itemCategory = itemParams.get('category') || '';
				const itemType = itemParams.get('type') || '';

				if (itemCategory === activeCategory && itemType === activeType) {
					activeSectionIndex = sIndex;
					activeItemIndex = iIndex;
				}
			});
		}
	});

	return { activeSectionIndex, activeItemIndex, activeCategory, activeType };
};

const SidebarSection = ({ sectionIndex, item, expanded, toggle, hasActiveChild, onNavigate }: { sectionIndex: number; item: SidebarItem; expanded: boolean; toggle: () => void; hasActiveChild: boolean; onNavigate: (path: string) => void }) => {
	const hasChildren = !!item.children && item.children.length > 0;

	// Section is NOT active itself, but it does get a special highlight when a child is active
	const hasActiveChildStyle = hasActiveChild && !expanded ? 'text-[#bbc5d0] font-medium' : '';

	const handleClick = () => {
		if (hasChildren) {
			toggle();
		} else if (item.path) {
			onNavigate(item.path);
		}
	};

	return (
		<>
			<div
				onClick={handleClick}
				className={`
          flex justify-between items-center px-3 py-2.5 rounded-md 
          ${hasActiveChildStyle} 
          ${!hasActiveChild ? 'text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-[#f9fafb]' : ''} 
          cursor-pointer transition-colors font-medium
        `}
			>
				<Text size='sm' fw={500}>
					{item.label}
				</Text>
				{hasChildren && (
					<span className={`transform transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
						<CaretRight size={16} className={hasActiveChild ? 'text-[#0099e6]' : 'text-[#a3a3a3]'} />
					</span>
				)}
			</div>

			{hasChildren && (
				<Collapse in={expanded}>
					<div className='ml-3 pl-3 border-l border-[#262626] my-1'>
						{item.children?.map((child, index) => (
							<SubItem key={index} item={child} sectionIndex={sectionIndex} itemIndex={index} onNavigate={onNavigate} />
						))}
					</div>
				</Collapse>
			)}
		</>
	);
};

const SubItem = ({ item, sectionIndex, itemIndex, onNavigate }: { item: SidebarItem; sectionIndex: number; itemIndex: number; onNavigate: (path: string) => void }) => {
	const { activeSectionIndex, activeItemIndex } = useActiveState();
	const isActive = sectionIndex === activeSectionIndex && itemIndex === activeItemIndex;

	const handleClick = () => {
		if (item.path) {
			onNavigate(item.path);
		}
	};

	return (
		<div
			onClick={handleClick}
			className={`
        px-3 py-2 my-0.5 rounded-md cursor-pointer text-sm
        ${isActive ? 'bg-[#52c5ff1a] text-[#0099e6] font-semibold' : 'text-[#a3a3a3] font-medium'} 
        hover:bg-[#1a1a1a] hover:text-[#f9fafb] transition-colors
      `}
		>
			{item.label}
		</div>
	);
};

export default function Sidebar() {
	const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
	const { activeSectionIndex, activeCategory } = useActiveState();
	const navigate = useNavigate();
	const [isNavigating, setIsNavigating] = useState(false);

	const toggleSection = (label: string) => {
		setExpandedSections((prev) => ({
			...prev,
			[label]: !prev[label],
		}));
	};

	const handleNavigate = (path: string) => {
		if (isNavigating) return;

		setIsNavigating(true);

		setTimeout(() => {
			navigate({ to: path });
			setIsNavigating(false);
		}, 50);
	};

	useEffect(() => {
		if (activeCategory && activeSectionIndex !== -1) {
			const activeSection = sidebarSections[activeSectionIndex];
			if (activeSection) {
				setExpandedSections((prev) => ({
					...prev,
					[activeSection.label]: true,
				}));
			}
		}
	}, [activeCategory, activeSectionIndex]);

	return (
		<nav className='h-full bg-[#111]'>
			<div className='p-4 h-full'>
				<ScrollArea className='h-full'>
					{sidebarSections.map((section, index) => (
						<Box key={index} mb={2}>
							<SidebarSection sectionIndex={index} item={section} expanded={!!expandedSections[section.label]} toggle={() => toggleSection(section.label)} hasActiveChild={index === activeSectionIndex} onNavigate={handleNavigate} />
						</Box>
					))}
				</ScrollArea>
			</div>
		</nav>
	);
}
