import { useState, useEffect } from 'react';
import { Box, ScrollArea, Text, Collapse, Group } from '@mantine/core';
import { ChevronRight } from 'lucide-react';
import { useNavigate, useRouter } from '@tanstack/react-router';

interface SidebarItem {
	label: string;
	path?: string;
	children?: SidebarItem[];
}

const sidebarSections: SidebarItem[] = [
	{
		label: 'System Overblik',
		children: [
			{ label: 'Server Logs', path: '/logs' },
			{ label: 'Join/Leave', path: '/logs?category=system&type=join_leave' },
			{ label: 'Crash Rapporter', path: '/logs?category=system&type=crash_reports' },
			{ label: 'Detection Log', path: '/logs?category=admin&type=detection' },
			{ label: 'Cheat Logs', path: '/logs?category=admin&type=cheat_logs' },
			{ label: 'Event Beskyttelse', path: '/logs?category=admin&type=event_protection' },
			{ label: 'Screenshots', path: '/logs?category=admin&type=screenshots' },
			{ label: 'Taster Overvågning', path: '/logs?category=admin&type=keys_monitoring' },
		],
	},
	{
		label: 'Økonomi',
		children: [
			{ label: 'Bank Transaktioner', path: '/logs?category=economy&type=bank' },
			{ label: 'Spiller Penge', path: '/logs?category=economy&type=player_money' },
			{ label: 'Pung', path: '/logs?category=economy&type=wallet' },
			{ label: 'Hvidvaskning', path: '/logs?category=economy&type=money_laundering' },
			{ label: 'Firma Regninger', path: '/logs?category=business&type=company_bills' },
			{ label: 'Taxa Regninger', path: '/logs?category=business&type=taxi_bills' },
			{ label: 'Advokat Løn', path: '/logs?category=business&type=lawyer_salary' },
			{ label: 'Medarbejder Bonus', path: '/logs?category=business&type=employee_bonus' },
		],
	},
	{
		label: 'Inventar & Genstande',
		children: [
			{ label: 'Item Tilføj/Fjern', path: '/logs?category=inventory&type=item_add_remove' },
			{ label: 'Item Ryk', path: '/logs?category=inventory&type=item_movement' },
			{ label: 'Item Gave', path: '/logs?category=inventory&type=item_gift' },
			{ label: 'Inventar Rydning', path: '/logs?category=inventory&type=inventory_clear' },
			{ label: 'Bil Bagagerum', path: '/logs?category=inventory&type=car_trunk' },
			{ label: 'Bil Handskerum', path: '/logs?category=inventory&type=car_glovebox' },
			{ label: 'Firma Opbevaring', path: '/logs?category=business&type=company_stash' },
		],
	},
	{
		label: 'Spiller Aktiviteter',
		children: [
			{ label: 'AFK Status', path: '/logs?category=player&type=afk' },
			{ label: 'ID Kontrol', path: '/logs?category=player&type=id_checks' },
			{ label: 'Me Actions', path: '/logs?category=player&type=me_actions' },
			{ label: 'Døds Logs', path: '/logs?category=player&type=death_logs' },
			{ label: 'Skud Rapporter', path: '/logs?category=player&type=shot_reports' },
			{ label: 'Lån Aktivitet', path: '/logs?category=player&type=loan_activity' },
			{ label: 'Genoplivning', path: '/logs?category=player&type=respawn' },
		],
	},
	{
		label: 'Køretøjer & Mekanik',
		children: [
			{ label: 'Køb & Salg', path: '/logs?category=vehicles&type=purchase_sales' },
			{ label: 'Bil Bank Transaktioner', path: '/logs?category=vehicles&type=car_bank' },
			{ label: 'Finansiering', path: '/logs?category=vehicles&type=financing' },
			{ label: 'Brugt Bil Forhandler', path: '/logs?category=vehicles&type=used_dealer' },
			{ label: 'Service Logs', path: '/logs?category=mechanic&type=service_logs' },
			{ label: 'Fakturering', path: '/logs?category=mechanic&type=billing' },
			{ label: 'Mekaniker Inventar', path: '/logs?category=mechanic&type=inventory_stash' },
		],
	},
	{
		label: 'Ulovlig Aktivitet',
		children: [
			{ label: 'Røverier', path: '/logs?category=crime&type=house_robbery' },
			{ label: 'Pengetransport', path: '/logs?category=crime&type=money_transport' },
			{ label: 'Hus Alarm', path: '/logs?category=crime&type=house_alarm' },
			{ label: 'Falske Penge', path: '/logs?category=illegal&type=counterfeit' },
			{ label: 'Pengevask', path: '/logs?category=illegal&type=money_washing' },
			{ label: 'Pantelåner', path: '/logs?category=illegal&type=pawnshop' },
			{ label: 'Graffiti', path: '/logs?category=illegal&type=graffiti' },
			{ label: 'Boosting', path: '/logs?category=illegal&type=boosting' },
			{ label: 'Mor/Far Danmark', path: '/logs?category=illegal&type=denmark' },
		],
	},
	{
		label: 'Stoffer & Bander',
		children: [
			{ label: 'Stof Salg', path: '/logs?category=drugs&type=drug_sales' },
			{ label: 'Stof Hule', path: '/logs?category=drugs&type=drug_den' },
			{ label: 'Stoffer', path: '/logs?category=drugs&type=lsd,meth,cocaine' },
			{ label: 'Bande Mønter', path: '/logs?category=drugs&type=gang_coins' },
			{ label: 'Territoriekrige', path: '/logs?category=drugs&type=turf_wars' },
		],
	},
	{
		label: 'Virksomheder & Ejendomme',
		children: [
			{ label: 'Virksomhedsregister', path: '/logs?category=business&type=company_register' },
			{ label: 'Butikker', path: '/logs?category=business&type=shops' },
			{ label: 'Boss Menu', path: '/logs?category=business&type=boss_menu' },
			{ label: 'Offline Butik', path: '/logs?category=business&type=offline_shop' },
			{ label: 'Ejendoms Optegnelser', path: '/logs?category=housing&type=property_records' },
			{ label: 'Hus Handlinger', path: '/logs?category=housing&type=house_actions' },
			{ label: 'Nøgle Administration', path: '/logs?category=housing&type=keys' },
			{ label: 'Møbler', path: '/logs?category=housing&type=furniture' },
		],
	},
	{
		label: 'Mad & Crafting',
		children: [
			{ label: 'Nye Opskrifter', path: '/logs?category=food&type=new_recipe' },
			{ label: 'Ændr Opskrift', path: '/logs?category=food&type=change_recipe' },
			{ label: 'Slet Opskrift', path: '/logs?category=food&type=delete_recipe' },
			{ label: 'Menu Billede Ændring', path: '/logs?category=food&type=menu_image' },
			{ label: 'Færdige Produkter', path: '/logs?category=food&type=finished_products' },
			{ label: 'Skillcheck AC', path: '/logs?category=crafting&type=skillcheck_ac' },
			{ label: 'Skilt Logs', path: '/logs?category=crafting&type=signs' },
			{ label: 'OX Crafting', path: '/logs?category=crafting&type=ox_crafting' },
		],
	},
	{
		label: 'Kommunikation',
		children: [
			{ label: 'Telefonopkald', path: '/logs?category=comms&type=phone_calls' },
			{ label: 'SMS', path: '/logs?category=comms&type=sms' },
			{ label: 'Darkchat', path: '/logs?category=comms&type=darkchat' },
			{ label: 'Tjenester', path: '/logs?category=comms&type=services' },
			{ label: 'Odessa Nyheder', path: '/logs?category=comms&type=odessa_news' },
			{ label: 'Mail', path: '/logs?category=comms&type=mail' },
			{ label: 'DBA', path: '/logs?category=comms&type=dba' },
			{ label: 'Sociale Medier', path: '/logs?category=social&type=tiktok,twitter,instagram' },
			{ label: 'Medie Billeder', path: '/logs?category=social&type=twitter_images,instagram_images' },
			{ label: 'Medie Galleri', path: '/logs?category=social&type=media_gallery' },
		],
	},
	{
		label: 'Retshåndhævelse',
		children: [
			{ label: 'Fængsel', path: '/logs?category=police&type=prison' },
			{ label: 'Fængsels Undvigelse', path: '/logs?category=police&type=prison_escape' },
			{ label: 'Bøder', path: '/logs?category=police&type=fines' },
			{ label: 'Samfundstjeneste', path: '/logs?category=police&type=community_service' },
			{ label: 'MDT Info', path: '/logs?category=police&type=mdt_info' },
			{ label: 'QB Bans', path: '/logs?category=admin&type=qb_bans' },
			{ label: 'Auto Bank Bans', path: '/logs?category=admin&type=auto_bank_bans' },
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

				if (itemCategory === activeCategory) {
					const itemTypes = itemType.split(',');
					const activeTypes = activeType.split(',');

					const hasMatchingType = activeTypes.some((activeTypeItem) => itemTypes.includes(activeTypeItem));

					if (hasMatchingType) {
						activeSectionIndex = sIndex;
						activeItemIndex = iIndex;
					}
				}
			});
		}
	});

	return { activeSectionIndex, activeItemIndex, activeCategory, activeType };
};

function SidebarSection({ sectionIndex, item, expanded, toggle, hasActiveChild, onNavigate }: { sectionIndex: number; item: SidebarItem; expanded: boolean; toggle: () => void; hasActiveChild: boolean; onNavigate: (path: string) => void }) {
	const hasChildren = !!item.children && item.children.length > 0;

	const handleClick = () => {
		if (hasChildren) {
			toggle();
		} else if (item.path) {
			onNavigate(item.path);
		}
	};

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

	const handleClick = () => {
		if (item.path) {
			onNavigate(item.path);
		}
	};

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

	const toggleSection = (label: string) => {
		setExpandedSections((prev) => ({
			...prev,
			[label]: !prev[label],
		}));
	};

	const handleNavigate = (path: string) => {
		if (isNavigating) return;
		setIsNavigating(true);

		navigate({ to: path });

		setTimeout(() => {
			setIsNavigating(false);
		}, 100);
	};

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
