import { useState, useEffect, useRef } from 'react';
import { Container, Title, Text, Paper, Group, Box, Tabs, Card, Badge, Switch, Checkbox, Divider, Button, Tooltip, ActionIcon, ColorSwatch, LoadingOverlay } from '@mantine/core';
import { MapPin, Buildings, Car, ShieldStar, Users, Storefront, CirclesThree, Factory, Tree, Question, MagnifyingGlass, List, Funnel } from '@phosphor-icons/react';
import MainLayout from '../layouts/MainLayout';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Location types
type LocationType = 'property' | 'business' | 'gang' | 'police' | 'medical' | 'landmark' | 'shop' | 'mechanic' | 'park' | 'other';

// Location object structure
interface MapLocation {
	id: string;
	name: string;
	type: LocationType;
	position: { x: number; y: number }; // Original game coordinates
	coordinates: [number, number]; // MapLibre coordinates (longitude, latitude)
	owner?: string;
	description?: string;
	isPublic: boolean;
	isForSale?: boolean;
	price?: number;
	color?: string;
}

// GTA V Map bounds and conversion factors
// These values would need to be tweaked based on the actual GTA V map
const MAP_BOUNDS = {
	southWest: [-74.25, 40.49] as [number, number], // Bottom left of the map in MapLibre coordinates
	northEast: [-73.69, 41.05] as [number, number], // Top right of the map in MapLibre coordinates

	// GTA V game coordinates (approximate)
	minX: -4000,
	maxX: 4000,
	minY: -4000,
	maxY: 4000,
};

// Convert GTA V coordinates to MapLibre coordinates
const convertToMapCoordinates = (x: number, y: number): [number, number] => {
	// Map GTA V X to longitude (west-east)
	const longRange = MAP_BOUNDS.northEast[0] - MAP_BOUNDS.southWest[0];
	const xRange = MAP_BOUNDS.maxX - MAP_BOUNDS.minX;
	const longitude = MAP_BOUNDS.southWest[0] + ((x - MAP_BOUNDS.minX) / xRange) * longRange;

	// Map GTA V Y to latitude (south-north) - note Y is inverted in GTA V
	const latRange = MAP_BOUNDS.northEast[1] - MAP_BOUNDS.southWest[1];
	const yRange = MAP_BOUNDS.maxY - MAP_BOUNDS.minY;
	const latitude = MAP_BOUNDS.southWest[1] + ((MAP_BOUNDS.maxY - y - MAP_BOUNDS.minY) / yRange) * latRange;

	return [longitude, latitude];
};

// Mock data for locations with MapLibre coordinates added
const mockLocations: MapLocation[] = [
	{
		id: 'prop1',
		name: 'Luxury Apartment',
		type: 'property',
		position: { x: 320, y: 210 },
		coordinates: convertToMapCoordinates(320, 210),
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
		coordinates: convertToMapCoordinates(380, 300),
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
		coordinates: convertToMapCoordinates(220, 350),
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
		coordinates: convertToMapCoordinates(410, 270),
		description: 'Main police station',
		isPublic: true,
		color: '#2c3e50',
	},
	{
		id: 'med1',
		name: 'Central Hospital',
		type: 'medical',
		position: { x: 450, y: 230 },
		coordinates: convertToMapCoordinates(450, 230),
		description: 'Main medical facility',
		isPublic: true,
		color: '#27ae60',
	},
	{
		id: 'shop1',
		name: 'Downtown Clothing',
		type: 'shop',
		position: { x: 350, y: 370 },
		coordinates: convertToMapCoordinates(350, 370),
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
		coordinates: convertToMapCoordinates(250, 410),
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
		coordinates: convertToMapCoordinates(370, 250),
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
		coordinates: convertToMapCoordinates(500, 300),
		description: 'Public recreational area',
		isPublic: true,
		color: '#2ecc71',
	},
	{
		id: 'other1',
		name: 'Abandoned Warehouse',
		type: 'other',
		position: { x: 280, y: 450 },
		coordinates: convertToMapCoordinates(280, 450),
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

// Custom marker HTML element creator
const createMarkerElement = (location: MapLocation) => {
	const element = document.createElement('div');
	element.className = 'custom-marker';
	element.setAttribute('data-location-id', location.id);
	element.style.width = '20px';
	element.style.height = '20px';
	element.style.borderRadius = '50%';
	element.style.backgroundColor = location.color || typeColors[location.type];
	element.style.border = '2px solid white';
	element.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
	element.style.cursor = 'pointer';

	return element;
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
	const [mapLoading, setMapLoading] = useState(true);

	const mapContainer = useRef<HTMLDivElement>(null);
	const map = useRef<maplibregl.Map | null>(null);
	const markers = useRef<Record<string, maplibregl.Marker>>({});

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

	// Initialize map
	useEffect(() => {
		if (map.current) return; // Initialize map only once

		if (mapContainer.current) {
			setMapLoading(true);

			map.current = new maplibregl.Map({
				container: mapContainer.current,
				style: {
					version: 8,
					sources: {
						'gta-map': {
							type: 'raster',
							tiles: [
								// This is a placeholder URL, you would need to replace with actual GTA V map tiles
								'https://gtav-map.example.com/tiles/{z}/{x}/{y}.png',
							],
							tileSize: 256,
							attribution: 'GTA V Map',
						},
					},
					layers: [
						{
							id: 'gta-map-layer',
							type: 'raster',
							source: 'gta-map',
							minzoom: 0,
							maxzoom: 22,
						},
					],
				},
				center: [-73.98, 40.76], // Center of the map (can be adjusted)
				zoom: 12,
				maxBounds: [MAP_BOUNDS.southWest, MAP_BOUNDS.northEast],
			});

			// For development, we can use a fallback background color if map tiles aren't available
			map.current.on('styledata', () => {
				const canvas = map.current?.getCanvas();
				if (canvas) {
					canvas.style.background = 'rgb(32, 32, 36)';
				}
			});

			map.current.on('load', () => {
				setMapLoading(false);

				// Add markers for all locations
				mockLocations.forEach((location) => {
					addMarkerToMap(location);
				});
			});
		}

		return () => {
			// Clean up map when component unmounts
			if (map.current) {
				map.current.remove();
				map.current = null;
			}
		};
	}, []);

	// Add a marker to the map
	const addMarkerToMap = (location: MapLocation) => {
		if (!map.current) return;

		const element = createMarkerElement(location);

		const marker = new maplibregl.Marker({
			element,
			anchor: 'center',
		})
			.setLngLat(location.coordinates)
			.addTo(map.current);

		// Add click event to marker
		element.addEventListener('click', () => {
			handleLocationClick(location);
		});

		// Store marker reference for later updates
		markers.current[location.id] = marker;
	};

	// Update markers based on filtered locations
	useEffect(() => {
		if (!map.current) return;

		// Hide all markers first
		Object.values(markers.current).forEach((marker) => {
			marker.getElement().style.display = 'none';
		});

		// Show only filtered markers
		filteredLocations.forEach((location) => {
			const marker = markers.current[location.id];
			if (marker) {
				marker.getElement().style.display = 'block';
			}
		});
	}, [filteredLocations]);

	// Handle location marker click
	const handleLocationClick = (location: MapLocation) => {
		setSelectedLocation(location);

		// Fly to the location
		if (map.current) {
			map.current.flyTo({
				center: location.coordinates,
				zoom: 14,
				duration: 1000,
			});
		}
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

	// Set waypoint function
	const setWaypoint = (location: MapLocation) => {
		// This would connect to the game client somehow
		// For now, just log and show an alert
		console.log(`Setting waypoint to ${location.name} at coordinates: ${location.position.x}, ${location.position.y}`);
		alert(`Waypoint set to ${location.name}`);
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
							{/* MapLibreGL Map Container */}
							<Box ref={mapContainer} style={{ width: '100%', height: '100%' }} />

							<LoadingOverlay visible={mapLoading} loaderProps={{ size: 'lg', color: 'blue' }} />

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
									zIndex: 10,
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

									<Group mb='xs'>
										<Text size='sm' fw={500}>
											Koordinater:
										</Text>
										<Text size='sm'>
											X: {selectedLocation.position.x.toFixed(0)}, Y: {selectedLocation.position.y.toFixed(0)}
										</Text>
									</Group>

									<Button fullWidth variant='outline' mt='md' leftSection={<MapPin size={16} />} onClick={() => setWaypoint(selectedLocation)}>
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
