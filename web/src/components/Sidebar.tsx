import { useState, useEffect, useCallback } from 'react';
import { Box, ScrollArea, Text, Collapse, Group } from '../components/mantine';
import { ChevronRight } from 'lucide-react';
import { useNavigate, useRouter } from '@tanstack/react-router';

interface SidebarItem {
	label: string;
	path?: string;
	children?: SidebarItem[];
}

const sidebarSections: SidebarItem[] = [
	{
		label: 'Overblik',
		children: [{ label: 'Server Logs', path: '/logs' }],
	},
	{
		label: 'Economy',
		children: [
			{ label: 'Bank Transactions', path: '/logs?category=economy&type=bank' },
			{ label: 'Player Money', path: '/logs?category=economy&type=player_money' },
			{ label: 'Wallet', path: '/logs?category=economy&type=wallet' },
			{ label: 'Money Laundering', path: '/logs?category=economy&type=money_laundering' },
		],
	},
	{
		label: 'Inventory',
		children: [
			{ label: 'Item Add/Remove', path: '/logs?category=inventory&type=item_add_remove' },
			{ label: 'Item Movement', path: '/logs?category=inventory&type=item_movement' },
			{ label: 'Item Gift', path: '/logs?category=inventory&type=item_gift' },
			{ label: 'Inventory Clear', path: '/logs?category=inventory&type=inventory_clear' },
			{ label: 'Car Trunk', path: '/logs?category=inventory&type=car_trunk' },
			{ label: 'Car Glove Box', path: '/logs?category=inventory&type=car_glovebox' },
		],
	},
	{
		label: 'Player Activity',
		children: [
			{ label: 'Join/Leave', path: '/logs?category=player&type=join_leave' },
			{ label: 'AFK Status', path: '/logs?category=player&type=afk' },
			{ label: 'ID Checks', path: '/logs?category=player&type=id_checks' },
			{ label: 'Crash Reports', path: '/logs?category=player&type=crash_reports' },
			{ label: 'Me Actions', path: '/logs?category=player&type=me_actions' },
			{ label: 'Death Logs', path: '/logs?category=player&type=death_logs' },
			{ label: 'Shot Reports', path: '/logs?category=player&type=shot_reports' },
			{ label: 'Loan Activity', path: '/logs?category=player&type=loan_activity' },
			{ label: 'Respawn', path: '/logs?category=player&type=respawn' },
		],
	},
	{
		label: 'Vehicles',
		children: [
			{ label: 'Purchase & Sales', path: '/logs?category=vehicles&type=purchase_sales' },
			{ label: 'Car Bank Transactions', path: '/logs?category=vehicles&type=car_bank' },
			{ label: 'Financing', path: '/logs?category=vehicles&type=financing' },
			{ label: 'Used Car Dealer', path: '/logs?category=vehicles&type=used_dealer' },
		],
	},
	{
		label: 'Mechanic',
		children: [
			{ label: 'Service Logs', path: '/logs?category=mechanic&type=service_logs' },
			{ label: 'Billing', path: '/logs?category=mechanic&type=billing' },
			{ label: 'Inventory Stash', path: '/logs?category=mechanic&type=inventory_stash' },
		],
	},
	{
		label: 'Criminal Activity',
		children: [
			{ label: 'House Robbery', path: '/logs?category=crime&type=house_robbery' },
			{ label: 'Train Robbery', path: '/logs?category=crime&type=train_robbery' },
			{ label: 'Money Transport', path: '/logs?category=crime&type=money_transport' },
			{ label: 'ATM Robbery', path: '/logs?category=crime&type=atm_robbery' },
			{ label: 'Jewelry Robbery', path: '/logs?category=crime&type=jewelry_robbery' },
			{ label: 'Store Robbery', path: '/logs?category=crime&type=store_robbery' },
			{ label: 'House Alarm', path: '/logs?category=crime&type=house_alarm' },
		],
	},
	{
		label: 'Drugs & Gangs',
		children: [
			{ label: 'Drug Sales', path: '/logs?category=drugs&type=drug_sales' },
			{ label: 'Drug Den', path: '/logs?category=drugs&type=drug_den' },
			{ label: 'LSD', path: '/logs?category=drugs&type=lsd' },
			{ label: 'Meth', path: '/logs?category=drugs&type=meth' },
			{ label: 'Cocaine', path: '/logs?category=drugs&type=cocaine' },
			{ label: 'Gang Coins', path: '/logs?category=drugs&type=gang_coins' },
			{ label: 'Turf Wars', path: '/logs?category=drugs&type=turf_wars' },
		],
	},
	{
		label: 'Illegal Activities',
		children: [
			{ label: 'Counterfeit Money', path: '/logs?category=illegal&type=counterfeit' },
			{ label: 'Money Washing', path: '/logs?category=illegal&type=money_washing' },
			{ label: 'Pawnshop', path: '/logs?category=illegal&type=pawnshop' },
			{ label: 'Graffiti', path: '/logs?category=illegal&type=graffiti' },
			{ label: 'Boosting', path: '/logs?category=illegal&type=boosting' },
			{ label: 'Mother/Father Denmark', path: '/logs?category=illegal&type=denmark' },
		],
	},
	{
		label: 'Business & Jobs',
		children: [
			{ label: 'Company Register', path: '/logs?category=business&type=company_register' },
			{ label: 'Lawyer Salary', path: '/logs?category=business&type=lawyer_salary' },
			{ label: 'Company Bills', path: '/logs?category=business&type=company_bills' },
			{ label: 'Taxi Bills', path: '/logs?category=business&type=taxi_bills' },
			{ label: 'Shops', path: '/logs?category=business&type=shops' },
			{ label: 'Boss Menu', path: '/logs?category=business&type=boss_menu' },
			{ label: 'Offline Shop', path: '/logs?category=business&type=offline_shop' },
			{ label: 'Company Stash', path: '/logs?category=business&type=company_stash' },
			{ label: 'Employee Bonus', path: '/logs?category=business&type=employee_bonus' },
		],
	},
	{
		label: 'Food & Recipes',
		children: [
			{ label: 'New Recipe', path: '/logs?category=food&type=new_recipe' },
			{ label: 'Change Recipe', path: '/logs?category=food&type=change_recipe' },
			{ label: 'Delete Recipe', path: '/logs?category=food&type=delete_recipe' },
			{ label: 'Menu Image Change', path: '/logs?category=food&type=menu_image' },
			{ label: 'Finished Products', path: '/logs?category=food&type=finished_products' },
		],
	},
	{
		label: 'Communication',
		children: [
			{ label: 'Phone Calls', path: '/logs?category=comms&type=phone_calls' },
			{ label: 'SMS Messages', path: '/logs?category=comms&type=sms' },
			{ label: 'Darkchat', path: '/logs?category=comms&type=darkchat' },
			{ label: 'Services', path: '/logs?category=comms&type=services' },
			{ label: 'Odessa News', path: '/logs?category=comms&type=odessa_news' },
			{ label: 'Mail', path: '/logs?category=comms&type=mail' },
			{ label: 'DBA', path: '/logs?category=comms&type=dba' },
		],
	},
	{
		label: 'Social Media',
		children: [
			{ label: 'TikTok', path: '/logs?category=social&type=tiktok' },
			{ label: 'Twitter', path: '/logs?category=social&type=twitter' },
			{ label: 'Instagram', path: '/logs?category=social&type=instagram' },
			{ label: 'Twitter Images', path: '/logs?category=social&type=twitter_images' },
			{ label: 'Pic Chat', path: '/logs?category=social&type=pic_chat' },
			{ label: 'Instagram Images', path: '/logs?category=social&type=instagram_images' },
			{ label: 'Media Gallery', path: '/logs?category=social&type=media_gallery' },
		],
	},
	{
		label: 'Housing',
		children: [
			{ label: 'Property Records', path: '/logs?category=housing&type=property_records' },
			{ label: 'House Actions', path: '/logs?category=housing&type=house_actions' },
			{ label: 'Keys Management', path: '/logs?category=housing&type=keys' },
			{ label: 'Furniture', path: '/logs?category=housing&type=furniture' },
		],
	},
	{
		label: 'Admin & Security',
		children: [
			{ label: 'QB Bans', path: '/logs?category=admin&type=qb_bans' },
			{ label: 'Auto Bank Bans', path: '/logs?category=admin&type=auto_bank_bans' },
			{ label: 'Join/Leave Security', path: '/logs?category=admin&type=join_leave_security' },
			{ label: 'Detection Log', path: '/logs?category=admin&type=detection' },
			{ label: 'Cheat Logs', path: '/logs?category=admin&type=cheat_logs' },
			{ label: 'Event Protection', path: '/logs?category=admin&type=event_protection' },
			{ label: 'Events Log', path: '/logs?category=admin&type=events' },
			{ label: 'Screenshots', path: '/logs?category=admin&type=screenshots' },
			{ label: 'Keys Monitoring', path: '/logs?category=admin&type=keys_monitoring' },
		],
	},
	{
		label: 'Police & Justice',
		children: [
			{ label: 'Prison', path: '/logs?category=police&type=prison' },
			{ label: 'Prison Escape', path: '/logs?category=police&type=prison_escape' },
			{ label: 'Fines', path: '/logs?category=police&type=fines' },
			{ label: 'Community Service', path: '/logs?category=police&type=community_service' },
			{ label: 'MDT Info', path: '/logs?category=police&type=mdt_info' },
		],
	},
	{
		label: 'Crafting & Skills',
		children: [
			{ label: 'Skillcheck AC', path: '/logs?category=crafting&type=skillcheck_ac' },
			{ label: 'Signs Logs', path: '/logs?category=crafting&type=signs' },
			{ label: 'OX Crafting', path: '/logs?category=crafting&type=ox_crafting' },
		],
	},
];

const useActiveState = () => {
	const router = useRouter();
	const search = router.state.location.search;

	const params = new URLSearchParams(search);
	const activeCategory = params.get('category') || '';
	const activeType = params.get('type') || '';

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

function SidebarSection({ sectionIndex, item, expanded, toggle, hasActiveChild, onNavigate }: { sectionIndex: number; item: SidebarItem; expanded: boolean; toggle: () => void; hasActiveChild: boolean; onNavigate: (path: string) => void }) {
	const hasChildren = !!item.children && item.children.length > 0;

	const handleClick = useCallback(() => {
		if (hasChildren) {
			toggle();
		} else if (item.path) {
			onNavigate(item.path);
		}
	}, [hasChildren, item.path, onNavigate, toggle]);

	return (
		<>
			<Box
				onClick={handleClick}
				px='md'
				py='xs'
				style={(theme) => ({
					borderRadius: theme.radius.md,
					color: hasActiveChild && !expanded ? theme.colors.gray[3] : theme.colors.gray[6],
					backgroundColor: 'transparent',
					fontWeight: hasActiveChild && !expanded ? 500 : 'normal',
					cursor: 'pointer',
					transition: 'all 0.2s ease',
					'&:hover': {
						backgroundColor: theme.colors.dark[8],
						color: theme.colors.gray[0],
					},
				})}
			>
				<Group justify='space-between' wrap='nowrap'>
					<Text size='sm' fw={500}>
						{item.label}
					</Text>
					{hasChildren && (
						<Box
							style={{
								transform: expanded ? 'rotate(90deg)' : 'none',
								transition: 'transform 0.2s ease',
							}}
						>
							<ChevronRight size={16} color={hasActiveChild ? '#0099e6' : '#a3a3a3'} />
						</Box>
					)}
				</Group>
			</Box>

			{hasChildren && (
				<Collapse in={expanded}>
					<Box
						ml='md'
						pl='md'
						style={(theme) => ({
							borderLeft: `1px solid ${theme.colors.dark[6]}`,
							marginTop: theme.spacing.xs,
							marginBottom: theme.spacing.xs,
						})}
					>
						{item.children?.map((child, index) => (
							<SubItem key={index} item={child} sectionIndex={sectionIndex} itemIndex={index} onNavigate={onNavigate} />
						))}
					</Box>
				</Collapse>
			)}
		</>
	);
}

function SubItem({ item, sectionIndex, itemIndex, onNavigate }: { item: SidebarItem; sectionIndex: number; itemIndex: number; onNavigate: (path: string) => void }) {
	const { activeSectionIndex, activeItemIndex } = useActiveState();
	const isActive = sectionIndex === activeSectionIndex && itemIndex === activeItemIndex;

	const handleClick = useCallback(() => {
		if (item.path) {
			onNavigate(item.path);
		}
	}, [item.path, onNavigate]);

	return (
		<Box
			onClick={handleClick}
			px='md'
			py='xs'
			my='2px'
			style={(theme) => ({
				borderRadius: theme.radius.sm,
				backgroundColor: isActive ? 'rgba(82, 197, 255, 0.1)' : 'transparent',
				color: isActive ? '#0099e6' : theme.colors.gray[6],
				fontWeight: isActive ? 600 : 500,
				fontSize: theme.fontSizes.sm,
				cursor: 'pointer',
				transition: 'all 0.2s ease',
				hover: {
					backgroundColor: !isActive ? theme.colors.dark[8] : undefined,
					color: !isActive ? theme.colors.gray[0] : undefined,
				},
			})}
		>
			{item.label}
		</Box>
	);
}

export default function Sidebar() {
	const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
	const { activeSectionIndex, activeCategory } = useActiveState();
	const navigate = useNavigate();
	const [isNavigating, setIsNavigating] = useState(false);

	const toggleSection = useCallback((label: string) => {
		setExpandedSections((prev) => ({
			...prev,
			[label]: !prev[label],
		}));
	}, []);

	const handleNavigate = useCallback(
		(path: string) => {
			if (isNavigating) return;

			setIsNavigating(true);

			setTimeout(() => {
				navigate({ to: path });
				setIsNavigating(false);
			}, 50);
		},
		[isNavigating, navigate]
	);

	useEffect(() => {
		if (activeCategory && activeSectionIndex !== -1) {
			const activeSection = sidebarSections[activeSectionIndex];
			if (activeSection) {
				setExpandedSections((prev) => {
					if (!prev[activeSection.label]) {
						return {
							...prev,
							[activeSection.label]: true,
						};
					}
					return prev;
				});
			}
		}
	}, [activeCategory, activeSectionIndex]);

	const renderedSections = sidebarSections.map((section, index) => (
		<Box key={index} mb='sm'>
			<SidebarSection sectionIndex={index} item={section} expanded={!!expandedSections[section.label]} toggle={() => toggleSection(section.label)} hasActiveChild={index === activeSectionIndex} onNavigate={handleNavigate} />
		</Box>
	));

	return (
		<Box component='nav' h='100%' bg='#111'>
			<Box p='md' h='100%'>
				<ScrollArea h='100%'>{renderedSections}</ScrollArea>
			</Box>
		</Box>
	);
}
