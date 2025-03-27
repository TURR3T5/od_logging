import { useState, useEffect } from 'react';
import { Container, Title, Text, Paper, Group, Box, Tabs, Card, Badge, Switch, Checkbox, Divider, Button, Tooltip, ActionIcon, ColorSwatch } from '@mantine/core';
import { MapPin, Buildings, Car, ShieldStar, Users, Storefront, CirclesThree, Factory, Tree, Question, MagnifyingGlass, List, Funnel } from '@phosphor-icons/react';
import MainLayout from '../layouts/MainLayout';

// Location types
type LocationType = 'property' | 'business' | 'gang' | 'police' | 'medical' | 'landmark' | 'shop' | 'mechanic' | 'park' | 'other';

// Location object structure
interface MapLocation {
	id: string;
	name: string;
	type: LocationType;
	position: { x: number; y: number };
	owner?: string;
	description?: string;
	isPublic: boolean;
	isForSale?: boolean;
	price?: number;
	color?: string;
}

// Mock data for locations
const mockLocations: MapLocation[] = [
	{
		id: 'prop1',
		name: 'Luxury Apartment',
		type: 'property',
		position: { x: 320, y: 210 },
		owner: 'Michael Stone',
		description: 'High-end apartment with ocean view',
		isPublic: false,
		isForSale: false,
		color: '#e74c3c',
	},
	{
		id: 'bus1',
		name: 'Bean Machine',
		type: 'business',
		position: { x: 380, y: 300 },
		owner: 'Sarah Johnson',
		description: 'Popular coffee shop in the city center',
		isPublic: true,
		color: '#3498db',
	},
	{
		id: 'gang1',
		name: 'Yellow Jack Territory',
		type: 'gang',
		position: { x: 220, y: 350 },
		owner: 'Yellow Jack Gang',
		description: 'Territory controlled by the Yellow Jack Gang',
		isPublic: false,
		color: '#f1c40f',
	},
	{
		id: 'police1',
		name: 'LSPD Headquarters',
		type: 'police',
		position: { x: 410, y: 270 },
		description: 'Main police station',
		isPublic: true,
		color: '#2c3e50',
	},
	{
		id: 'med1',
		name: 'Central Hospital',
		type: 'medical',
		position: { x: 450, y: 230 },
		description: 'Main medical facility',
		isPublic: true,
		color: '#27ae60',
	},
	{
		id: 'shop1',
		name: 'Downtown Clothing',
		type: 'shop',
		position: { x: 350, y: 370 },
		owner: 'Alex Martinez',
		description: 'Premium clothing store',
		isPublic: true,
		color: '#9b59b6',
	},
	{
		id: 'mech1',
		name: 'LS Customs',
		type: 'mechanic',
		position: { x: 250, y: 410 },
		owner: 'Johnny Mechanic',
		description: 'Vehicle modification shop',
		isPublic: true,
		color: '#e67e22',
	},
	{
		id: 'prop2',
		name: 'Downtown Apartment',
		type: 'property',
		position: { x: 370, y: 250 },
		isPublic: false,
		isForSale: true,
		price: 1250000,
		color: '#e74c3c',
	},
	{
		id: 'park1',
		name: 'Mirror Park',
		type: 'park',
		position: { x: 500, y: 300 },
		description: 'Public recreational area',
		isPublic: true,
		color: '#2ecc71',
	},
	{
		id: 'other1',
		name: 'Abandoned Warehouse',
		type: 'other',
		position: { x: 280, y: 450 },
		description: 'Mysterious abandoned location',
		isPublic: false,
		color: '#95a5a6',
	},
];

// Type icon mapping
const typeIcons = {
	property: <Buildings size={18} />,
	business: <Storefront size={18} />,
	gang: <Users size={18} />,
	police: <ShieldStar size={18} />,
	medical: <CirclesThree size={18} />,
	landmark: <MapPin size={18} />,
	shop: <Storefront size={18} />,
	mechanic: <Car size={18} />,
	park: <Tree size={18} />,
	other: <Question size={18} />,
};

// Type color mapping
const typeColors = {
	property: '#e74c3c',
	business: '#3498db',
	gang: '#f1c40f',
	police: '#2c3e50',
	medical: '#27ae60',
	landmark: '#8e44ad',
	shop: '#9b59b6',
	mechanic: '#e67e22',
	park: '#2ecc71',
	other: '#95a5a6',
};

// Type labels mapping
const typeLabels = {
	property: 'Ejendomme',
	business: 'Virksomheder',
	gang: 'Bande Territorier',
	police: 'Politi Stationer',
	medical: 'Hospitaler',
	landmark: 'Landmærker',
	shop: 'Butikker',
	mechanic: 'Mekanikere',
	park: 'Parker',
	other: 'Andre',
};

export default function CityMapPage() {
	const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
	const [visibleTypes, setVisibleTypes] = useState<Record<LocationType, boolean>>({
		property: true,
		business: true,
		gang: true,
		police: true,
		medical: true,
		landmark: true,
		shop: true,
		mechanic: true,
		park: true,
		other: true,
	});
	const [showOnlyForSale, setShowOnlyForSale] = useState(false);
	const [showOnlyPublic, setShowOnlyPublic] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [showFilterPanel, setShowFilterPanel] = useState(false);

	// Filter locations based on current filters
	const filteredLocations = mockLocations.filter((loc) => {
		// Filter by type
		if (!visibleTypes[loc.type]) return false;

		// Filter for-sale properties if enabled
		if (showOnlyForSale && !loc.isForSale) return false;

		// Filter public locations if enabled
		if (showOnlyPublic && !loc.isPublic) return false;

		// Filter by search query
		if (searchQuery && !loc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

		return true;
	});

	// Handle location pin click
	const handleLocationClick = (location: MapLocation) => {
		setSelectedLocation(location);
	};

	// Toggle visibility for a specific location type
	const toggleTypeVisibility = (type: LocationType) => {
		setVisibleTypes((prev) => ({
			...prev,
			[type]: !prev[type],
		}));
	};

	// Toggle all types visibility
	const toggleAllTypes = (value: boolean) => {
		const newVisibleTypes = {} as Record<LocationType, boolean>;
		Object.keys(visibleTypes).forEach((type) => {
			newVisibleTypes[type as LocationType] = value;
		});
		setVisibleTypes(newVisibleTypes);
	};

	return (
		<MainLayout requireAuth={false}>
			<Container size='xl' py='xl'>
				<Title order={1} mb='md'>
					OdessaRP By Kort
				</Title>

				<Group justify='space-between' mb='md'>
					<Text c='dimmed'>Udforsk byen, find ejendomme, virksomheder og mere</Text>
					<Group>
						<Tooltip label={showFilterPanel ? 'Skjul filtre' : 'Vis filtre'}>
							<ActionIcon variant='subtle' onClick={() => setShowFilterPanel(!showFilterPanel)} color={showFilterPanel ? 'blue' : 'gray'}>
								<Funnel size={18} />
							</ActionIcon>
						</Tooltip>
						<Tooltip label='Liste visning'>
							<ActionIcon variant='subtle'>
								<List size={18} />
							</ActionIcon>
						</Tooltip>
					</Group>
				</Group>

				<Box style={{ display: 'flex', gap: '20px' }}>
					{/* Filter panel */}
					{showFilterPanel && (
						<Paper withBorder p='md' radius='md' style={{ width: '250px', flexShrink: 0 }}>
							<Title order={4} mb='md'>
								Filtre
							</Title>

							<Box mb='md'>
								<Text fw={500} mb='xs'>
									Søg
								</Text>
								<Group>
									<Box style={{ position: 'relative', width: '100%' }}>
										<input
											type='text'
											placeholder='Søg efter lokation...'
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
											style={{
												width: '100%',
												padding: '8px 30px 8px 10px',
												borderRadius: '4px',
												border: '1px solid #444',
												background: '#333',
												color: 'white',
											}}
										/>
										<MagnifyingGlass
											size={16}
											style={{
												position: 'absolute',
												right: '10px',
												top: '50%',
												transform: 'translateY(-50%)',
												color: '#aaa',
											}}
										/>
									</Box>
								</Group>
							</Box>

							<Divider my='md' />

							<Box mb='md'>
								<Group justify='space-between' mb='xs'>
									<Text fw={500}>Lokations Typer</Text>
									<Group gap='xs'>
										<Button size='xs' variant='subtle' onClick={() => toggleAllTypes(true)}>
											Alle
										</Button>
										<Button size='xs' variant='subtle' onClick={() => toggleAllTypes(false)}>
											Ingen
										</Button>
									</Group>
								</Group>

								{(Object.keys(typeLabels) as LocationType[]).map((type) => (
									<Group key={type} justify='space-between' mb='xs'>
										<Group gap='xs'>
											<ColorSwatch color={typeColors[type]} size={14} />
											<Text size='sm'>{typeLabels[type]}</Text>
										</Group>
										<Checkbox checked={visibleTypes[type]} onChange={() => toggleTypeVisibility(type)} />
									</Group>
								))}
							</Box>

							<Divider my='md' />

							<Box>
								<Text fw={500} mb='xs'>
									Yderligere Filtre
								</Text>
								<Group justify='space-between' mb='xs'>
									<Text size='sm'>Kun Til Salg</Text>
									<Switch checked={showOnlyForSale} onChange={(event) => setShowOnlyForSale(event.currentTarget.checked)} />
								</Group>
								<Group justify='space-between'>
									<Text size='sm'>Kun Offentlige</Text>
									<Switch checked={showOnlyPublic} onChange={(event) => setShowOnlyPublic(event.currentTarget.checked)} />
								</Group>
							</Box>
						</Paper>
					)}

					<Box style={{ flexGrow: 1 }}>
						<Paper withBorder p={0} radius='md' style={{ overflow: 'hidden', position: 'relative', height: '700px' }}>
							{/* Interactive Map */}
							<Box
								style={{
									width: '100%',
									height: '100%',
									background: 'url("/api/placeholder/1000/800") center center / cover no-repeat',
									position: 'relative',
								}}
							>
								{/* Place location pins */}
								{filteredLocations.map((location) => (
									<Tooltip key={location.id} label={location.name}>
										<Box
											style={{
												position: 'absolute',
												left: `${location.position.x}px`,
												top: `${location.position.y}px`,
												width: '20px',
												height: '20px',
												borderRadius: '50%',
												background: location.color || typeColors[location.type],
												border: '2px solid white',
												transform: 'translate(-50%, -50%)',
												cursor: 'pointer',
												zIndex: selectedLocation?.id === location.id ? 10 : 1,
												boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
											}}
											onClick={() => handleLocationClick(location)}
										/>
									</Tooltip>
								))}

								{/* Legend */}
								<Box
									style={{
										position: 'absolute',
										bottom: '20px',
										right: '20px',
										background: 'rgba(0,0,0,0.7)',
										padding: '10px',
										borderRadius: '4px',
										maxWidth: '200px',
									}}
								>
									<Text size='sm' fw={600} mb='xs'>
										Pins:
									</Text>
									{(Object.keys(typeLabels) as LocationType[])
										.filter((type) => visibleTypes[type])
										.map((type) => (
											<Group key={type} gap='xs' mb='xs'>
												<ColorSwatch color={typeColors[type]} size={12} />
												<Text size='xs'>{typeLabels[type]}</Text>
											</Group>
										))}
								</Box>
							</Box>

							{/* Location detail panel */}
							{selectedLocation && (
								<Paper
									style={{
										position: 'absolute',
										top: '20px',
										left: '20px',
										width: '300px',
										zIndex: 100,
										backgroundColor: 'rgba(26, 27, 30, 0.9)',
										backdropFilter: 'blur(10px)',
									}}
									withBorder
									p='md'
									radius='md'
								>
									<Group justify='space-between' mb='xs'>
										<Title order={4}>{selectedLocation.name}</Title>
										<ActionIcon size='sm' onClick={() => setSelectedLocation(null)}>
											<Box style={{ color: '#aaa', fontSize: '18px' }}>×</Box>
										</ActionIcon>
									</Group>

									<Group mb='md'>
										<Badge leftSection={typeIcons[selectedLocation.type]} color={selectedLocation.type === 'property' ? 'red' : selectedLocation.type === 'business' ? 'blue' : selectedLocation.type === 'gang' ? 'yellow' : selectedLocation.type === 'police' ? 'dark' : selectedLocation.type === 'medical' ? 'green' : selectedLocation.type === 'mechanic' ? 'orange' : selectedLocation.type === 'park' ? 'lime' : 'gray'}>
											{typeLabels[selectedLocation.type]}
										</Badge>

										{selectedLocation.isPublic ? (
											<Badge color='blue' variant='light'>
												Offentlig
											</Badge>
										) : (
											<Badge color='gray' variant='light'>
												Privat
											</Badge>
										)}

										{selectedLocation.isForSale && (
											<Badge color='green' variant='light'>
												Til Salg
											</Badge>
										)}
									</Group>

									{selectedLocation.description && (
										<Text size='sm' mb='md' c='dimmed'>
											{selectedLocation.description}
										</Text>
									)}

									{selectedLocation.owner && (
										<Group mb='xs'>
											<Text size='sm' fw={500}>
												Ejer:
											</Text>
											<Text size='sm'>{selectedLocation.owner}</Text>
										</Group>
									)}

									{selectedLocation.isForSale && selectedLocation.price && (
										<Group mb='md'>
											<Text size='sm' fw={500}>
												Pris:
											</Text>
											<Text size='sm'>${selectedLocation.price.toLocaleString()}</Text>
										</Group>
									)}

									<Button fullWidth variant='outline' mt='md' leftSection={<MapPin size={16} />}>
										Sæt Waypoint
									</Button>
								</Paper>
							)}
						</Paper>
					</Box>
				</Box>
			</Container>
		</MainLayout>
	);
}
