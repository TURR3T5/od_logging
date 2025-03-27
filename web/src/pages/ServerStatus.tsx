import { useState, useEffect } from 'react';
import { Container, Title, Text, Paper, Group, Box, Grid, RingProgress, Progress, Card, Badge, Timeline, SimpleGrid, Divider, ActionIcon, Center, Tooltip } from '@mantine/core';
import { ArrowUp, ArrowDown, Clock, Users, CloudCheck, Warning, Lightning, ArrowClockwise, ChartBar, Database, Calendar, GlobeSimple, Cpu, ListBullets, Pulse } from '@phosphor-icons/react';
import MainLayout from '../layouts/MainLayout';
import { supabase } from '../lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

// Types for server status data
interface ServerStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance' | 'restarting';
  players: {
    current: number;
    max: number;
  };
  uptime: number; // in hours
  lastRestart: string;
  performance: {
    cpu: number;
    ram: number;
    tick: number;
  };
  ping: number;
  version: string;
  ip: string;
}

interface MaintenanceEvent {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed';
  start: string;
  end?: string;
}

interface PlayerCount {
  time: string;
  count: number;
}

// Mock data
const mockServerStatus: ServerStatus[] = [
  {
    id: 'server1',
    name: 'OdessaRP Main',
    status: 'online',
    players: {
      current: 185,
      max: 300
    },
    uptime: 86.5, // hours
    lastRestart: '2025-03-26T12:00:00Z',
    performance: {
      cpu: 42,
      ram: 65,
      tick: 88
    },
    ping: 32,
    version: 'v3.5.2',
    ip: 'play.odessarp.com'
  },
  {
    id: 'server2',
    name: 'OdessaRP Development',
    status: 'maintenance',
    players: {
      current: 0,
      max: 100
    },
    uptime: 0,
    lastRestart: '2025-03-26T09:30:00Z',
    performance: {
      cpu: 0,
      ram: 0,
      tick: 0
    },
    ping: 0,
    version: 'v3.6.0-dev',
    ip: 'dev.odessarp.com'
  }
];

const mockMaintenanceEvents: MaintenanceEvent[] = [
  {
    id: 'maint1',
    title: 'Planlagt Vedligeholdelse',
    description: 'Opdatering af server-scripts og performance-optimering',
    status: 'planned',
    start: '2025-03-30T22:00:00Z',
    end: '2025-03-31T02:00:00Z'
  },
  {
    id: 'maint2',
    title: 'Database Vedligeholdelse',
    description: 'Optimering af database-forespørgsler og indeks',
    status: 'in-progress',
    start: '2025-03-27T10:00:00Z',
    end: '2025-03-27T14:00:00Z'
  },
  {
    id: 'maint3',
    title: 'Script Opdatering',
    description: 'Opdatering af køretøjs-scripts og ekstra tilpasninger',
    status: 'completed',
    start: '2025-03-25T23:00:00Z',
    end: '2025-03-26T01:30:00Z'
  }
];

// Mock player count data over time (24 hours)
const generateMockPlayerData = (): PlayerCount[] => {
  const data: PlayerCount[] = [];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
    // Create a realistic player count curve based on time of day
    let baseCount = 80;
    const hour = time.getHours();
    
    // Fewer players in early morning, peak in evening
    if (hour >= 2 && hour < 7) {
      baseCount = 30;
    } else if (hour >= 7 && hour < 12) {
      baseCount = 60;
    } else if (hour >= 12 && hour < 18) {
      baseCount = 110;
    } else if (hour >= 18 && hour < 23) {
      baseCount = 180;
    } else {
      baseCount = 140;
    }
    
    // Add some randomness
    const count = Math.floor(baseCount + (Math.random() * 30 - 15));
    
    data.push({
      time: time.toISOString(),
      count: Math.max(0, count) // Ensure no negative player counts
    });
  }
  return data;
};

export default function ServerStatusPage() {
  const [servers, setServers] = useState<ServerStatus[]>(mockServerStatus);
  const [maintenanceEvents, setMaintenanceEvents] = useState<MaintenanceEvent[]>(mockMaintenanceEvents);
  const [playerData, setPlayerData] = useState<PlayerCount[]>(generateMockPlayerData());
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Determine the main server state
  const mainServer = servers.find(s => s.id === 'server1') || servers[0];
  const isMainServerUp = mainServer && mainServer.status === 'online';
  
  // Define status colors
  const statusColors = {
    online: 'green',
    offline: 'red',
    maintenance: 'yellow',
    restarting: 'blue'
  };
  
  // Define performance level colors
  const getPerformanceColor = (value: number) => {
    if (value >= 80) return 'green';
    if (value >= 50) return 'yellow';
    return 'red';
  };
  
  // Refresh server status
  const refreshStatus = () => {
    setRefreshing(true);
    
    // Simulate an API call to refresh data
    setTimeout(() => {
      // Small random variations in player count and performance
      const updatedServers = servers.map(server => {
        if (server.status === 'online') {
          const currentPlayers = server.players.current;
          const variation = Math.floor(Math.random() * 11) - 5; // -5 to +5
          
          return {
            ...server,
            players: {
              ...server.players,
              current: Math.max(0, Math.min(server.players.max, currentPlayers + variation))
            },
            performance: {
              cpu: Math.max(5, Math.min(95, server.performance.cpu + (Math.random() * 10 - 5))),
              ram: Math.max(10, Math.min(95, server.performance.ram + (Math.random() * 10 - 5))),
              tick: Math.max(50, Math.min(99, server.performance.tick + (Math.random() * 6 - 3)))
            },
            ping: Math.max(10, Math.min(100, server.ping + (Math.random() * 10 - 5)))
          };
        }
        return server;
      });
      
      setServers(updatedServers);
      setLastRefresh(new Date());
      setRefreshing(false);
    }, 1000);
  };
  
  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('da-DK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format hours to days, hours
  const formatUptime = (hours: number) => {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    
    if (days > 0) {
      return `${days}d ${remainingHours}t`;
    }
    return `${remainingHours}t ${Math.floor((hours - Math.floor(hours)) * 60)}m`;
  };
  
  // Format the time for the chart
  const formatChartTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('da-DK', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format player data for chart display
  const formattedPlayerData = playerData.map(dataPoint => ({
    ...dataPoint,
    formattedTime: formatChartTime(dataPoint.time)
  }));
  
  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshStatus();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [servers]);

  return (
    <MainLayout requireAuth={false}>
      <Container size="xl" py="xl">
        <Group position="apart" mb="lg">
          <Box>
            <Title order={1}>Server Status</Title>
            <Text c="dimmed">Oversigt over OdessaRP servere og drift</Text>
          </Box>
          <Group>
            <Text size="xs" c="dimmed">
              Sidst opdateret: {lastRefresh.toLocaleTimeString()}
            </Text>
            <Tooltip label="Opdater status">
              <ActionIcon 
                color="blue" 
                variant="subtle" 
                onClick={refreshStatus}
                loading={refreshing}
              >
                <ArrowClockwise size={20} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
        
        {/* Main server status overview */}
        <Paper withBorder p="xl" radius="md" mb="lg" bg={isMainServerUp ? 'dark.8' : 'dark.7'}>
          <Group position="apart">
            <Box>
              <Group mb="xs">
                <Badge 
                  size="lg" 
                  color={statusColors[mainServer.status]}
                  leftSection={
                    mainServer.status === 'online' ? <CloudCheck size={14} /> :
                    mainServer.status === 'offline' ? <Warning size={14} /> :
                    mainServer.status === 'maintenance' ? <Cpu size={14} /> :
                    <Clock size={14} />
                  }
                >
                  {mainServer.status === 'online' ? 'ONLINE' : 
                   mainServer.status === 'offline' ? 'OFFLINE' : 
                   mainServer.status === 'maintenance' ? 'VEDLIGEHOLDELSE' : 
                   'GENSTARTER'}
                </Badge>
                <Text fw={500} size="sm">|</Text>
                <Text fw={500} size="sm">Server IP: {mainServer.ip}</Text>
              </Group>
              <Title order={2}>{mainServer.name}</Title>
              <Text c="dimmed">Version {mainServer.version}</Text>
            </Box>
            <Box>
              <Group mb="xs">
                <Group spacing="xs">
                  <Users size={20} />
                  <Text size="xl" fw={700}>{mainServer.players.current}</Text>
                </Group>
                <Text c="dimmed">/</Text>
                <Text c="dimmed">{mainServer.players.max} spillere</Text>
              </Group>
              
              {mainServer.status === 'online' && (
                <Group spacing="md">
                  <Badge leftSection={<Clock size={14} />}>
                    Oppetid: {formatUptime(mainServer.uptime)}
                  </Badge>
                  <Badge color={mainServer.ping < 50 ? 'green' : mainServer.ping < 100 ? 'yellow' : 'red'}>
                    Ping: {Math.round(mainServer.ping)}ms
                  </Badge>
                </Group>
              )}
            </Box>
          </Group>
          
          {mainServer.status === 'online' && (
            <>
              <Divider my="md" />
              <SimpleGrid cols={3}>
                <Box>
                  <Text size="sm" c="dimmed" mb="xs">CPU</Text>
                  <Group position="apart" mb="xs">
                    <Text size="sm">{Math.round(mainServer.performance.cpu)}%</Text>
                    <Badge 
                      size="sm" 
                      color={getPerformanceColor(mainServer.performance.cpu)}
                    >
                      {mainServer.performance.cpu < 50 ? 'Høj' : 
                       mainServer.performance.cpu < 80 ? 'Medium' : 'Lav'}
                    </Badge>
                  </Group>
                  <Progress 
                    value={mainServer.performance.cpu} 
                    color={
                      mainServer.performance.cpu > 80 ? 'red' :
                      mainServer.performance.cpu > 60 ? 'yellow' : 'green'
                    } 
                    size="md" 
                    radius="xl"
                  />
                </Box>
                
                <Box>
                  <Text size="sm" c="dimmed" mb="xs">RAM</Text>
                  <Group position="apart" mb="xs">
                    <Text size="sm">{Math.round(mainServer.performance.ram)}%</Text>
                    <Badge 
                      size="sm" 
                      color={getPerformanceColor(mainServer.performance.ram)}
                    >
                      {mainServer.performance.ram < 50 ? 'Høj' : 
                       mainServer.performance.ram < 80 ? 'Medium' : 'Lav'}
                    </Badge>
                  </Group>
                  <Progress 
                    value={mainServer.performance.ram} 
                    color={
                      mainServer.performance.ram > 80 ? 'red' :
                      mainServer.performance.ram > 60 ? 'yellow' : 'green'
                    } 
                    size="md" 
                    radius="xl"
                  />
                </Box>
                
                <Box>
                  <Text size="sm" c="dimmed" mb="xs">Tick Rate</Text>
                  <Group position="apart" mb="xs">
                    <Text size="sm">{Math.round(mainServer.performance.tick)}%</Text>
                    <Badge 
                      size="sm" 
                      color={getPerformanceColor(mainServer.performance.tick)}
                    >
                      {mainServer.performance.tick < 70 ? 'Lav' : 
                       mainServer.performance.tick < 85 ? 'Medium' : 'Høj'}
                    </Badge>
                  </Group>
                  <Progress 
                    value={mainServer.performance.tick} 
                    color={
                      mainServer.performance.tick < 70 ? 'red' :
                      mainServer.performance.tick < 85 ? 'yellow' : 'green'
                    } 
                    size="md" 
                    radius="xl"
                  />
                </Box>
              </SimpleGrid>
            </>
          )}
        </Paper>
        
        <Grid gutter="md">
          {/* Player count chart */}
          <Grid.Col span={8}>
            <Paper withBorder p="md" radius="md" style={{ height: '350px' }}>
              <Title order={4} mb="md">
                <Group spacing="xs">
                  <ChartBar size={20} />
                  Spiller Aktivitet (24 Timer)
                </Group>
              </Title>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart
                  data={formattedPlayerData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedTime" 
                    interval={2} 
                    angle={-15} 
                    textAnchor="end"
                  />
                  <YAxis />
                  <RechartsTooltip 
                    formatter={(value) => [`${value} spillere`, 'Online']}
                    labelFormatter={(label) => `Tid: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Online Spillere"
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid.Col>
          
          {/* Secondary servers */}
          <Grid.Col span={4}>
            <Paper withBorder p="md" radius="md" style={{ height: '350px' }}>
              <Title order={4} mb="md">
                <Group spacing="xs">
                  <Database size={20} />
                  Andre Servere
                </Group>
              </Title>
              
              {servers.filter(server => server.id !== 'server1').map(server => (
                <Paper 
                  key={server.id} 
                  withBorder 
                  p="md" 
                  radius="md" 
                  mb="md"
                  style={{
                    borderLeft: `4px solid ${server.status === 'online' ? '#10b981' : 
                                            server.status === 'maintenance' ? '#eab308' : 
                                            server.status === 'restarting' ? '#3b82f6' : '#ef4444'}`
                  }}
                >
                  <Group position="apart" mb="xs">
                    <Text fw={600}>{server.name}</Text>
                    <Badge 
                      size="sm" 
                      color={statusColors[server.status]}
                    >
                      {server.status === 'online' ? 'ONLINE' : 
                       server.status === 'offline' ? 'OFFLINE' : 
                       server.status === 'maintenance' ? 'VEDLIGEHOLDELSE' : 
                       'GENSTARTER'}
                    </Badge>
                  </Group>
                  
                  <Group>
                    <Text size="sm">Version {server.version}</Text>
                    <Text size="sm" c="dimmed">|</Text>
                    <Text size="sm">{server.ip}</Text>
                  </Group>
                  
                  {server.status === 'online' && (
                    <Group mt="xs">
                      <Badge leftSection={<Users size={14} />}>
                        {server.players.current}/{server.players.max}
                      </Badge>
                    </Group>
                  )}
                </Paper>
              ))}
              
              {servers.filter(server => server.id !== 'server1').length === 0 && (
                <Center style={{ height: '70%' }}>
                  <Text c="dimmed" fs="italic">Ingen sekundære servere tilgængelige</Text>
                </Center>
              )}
            </Paper>
          </Grid.Col>
          
          {/* Maintenance Timeline */}
          <Grid.Col span={6}>
            <Paper withBorder p="md" radius="md">
              <Title order={4} mb="md">
                <Group spacing="xs">
                  <Cpu size={20} />
                  Vedligeholdelse & Opdateringer
                </Group>
              </Title>
              
              <Timeline active={0} bulletSize={24} lineWidth={2}>
                {maintenanceEvents.map((event, index) => (
                  <Timeline.Item
                    key={event.id}
                    title={
                      <Group>
                        <Text fw={600}>{event.title}</Text>
                        <Badge 
                          size="sm" 
                          color={
                            event.status === 'planned' ? 'blue' : 
                            event.status === 'in-progress' ? 'yellow' : 
                            'green'
                          }
                        >
                          {event.status === 'planned' ? 'Planlagt' : 
                           event.status === 'in-progress' ? 'I Gang' : 
                           'Afsluttet'}
                        </Badge>
                      </Group>
                    }
                    bullet={
                      event.status === 'planned' ? <Calendar size={14} /> : 
                      event.status === 'in-progress' ? <Cpu size={14} /> : 
                      <CheckCircle size={14} />
                    }
                  >
                    <Text size="sm" mt={4}>
                      {formatDate(event.start)}
                      {event.end ? ` - ${formatDate(event.end)}` : ''}
                    </Text>
                    <Text size="sm" mt="sm">
                      {event.description}
                    </Text>
                  </Timeline.Item>
                ))}
                
                {maintenanceEvents.length === 0 && (
                  <Center py="xl">
                    <Text c="dimmed" fs="italic">Ingen planlagte vedligeholdelser</Text>
                  </Center>
                )}
              </Timeline>
            </Paper>
          </Grid.Col>
          
          {/* Server Information */}
          <Grid.Col span={6}>
            <Paper withBorder p="md" radius="md">
              <Title order={4} mb="md">
                <Group spacing="xs">
                  <GlobeSimple size={20} />
                  Server Information
                </Group>
              </Title>
              
              <SimpleGrid cols={2}>
                <Card withBorder p="md" radius="md">
                  <Group position="apart" mb="md">
                    <Box>
                      <Text c="dimmed" size="xs">SENESTE GENSTART</Text>
                      <Text fw={600}>{formatDate(mainServer.lastRestart)}</Text>
                    </Box>
                    <Clock size={30} />
                  </Group>
                  <Text size="sm">
                    {mainServer.status === 'online' 
                      ? `Serveren har været online i ${formatUptime(mainServer.uptime)}`
                      : 'Serveren er i øjeblikket ikke online'}
                  </Text>
                </Card>
                
                <Card withBorder p="md" radius="md">
                  <Group position="apart" mb="md">
                    <Box>
                      <Text c="dimmed" size="xs">MAX SPILLERE I DAG</Text>
                      <Text fw={600}>192</Text>
                    </Box>
                    <Users size={30} />
                  </Group>
                  <Group spacing="xs">
                    <ArrowUp size={16} color="#10b981" />
                    <Text size="sm" c="green">8% højere end i går</Text>
                  </Group>
                </Card>
                
                <Card withBorder p="md" radius="md">
                  <Group position="apart" mb="md">
                    <Box>
                      <Text c="dimmed" size="xs">GENNEMSNITLIG LATENCY</Text>
                      <Text fw={600}>{Math.round(mainServer.ping)}ms</Text>
                    </Box>
                    <Pulse size={30} />
                  </Group>
                  <Group spacing="xs">
                    <ArrowDown size={16} color="#10b981" />
                    <Text size="sm" c="green">5ms bedre end i går</Text>
                  </Group>
                </Card>
                
                <Card withBorder p="md" radius="md">
                  <Group position="apart" mb="md">
                    <Box>
                      <Text c="dimmed" size="xs">SERVER VERSION</Text>
                      <Text fw={600}>{mainServer.version}</Text>
                    </Box>
                    <Lightning size={30} />
                  </Group>
                  <Text size="sm">
                    Opdateret for 1 dag siden
                  </Text>
                </Card>
              </SimpleGrid>
              
              <Box mt="xl">
                <Group position="apart" mb="xs">
                  <Text fw={600}>Kommende Planlagte Genstarter</Text>
                </Group>
                
                <SimpleGrid cols={3}>
                  <Card withBorder p="sm" radius="md">
                    <Text fw={500} size="sm">Daglig Genstart</Text>
                    <Text size="xs" c="dimmed">06:00 hver dag</Text>
                  </Card>
                  <Card withBorder p="sm" radius="md">
                    <Text fw={500} size="sm">Vedligeholdelse</Text>
                    <Text size="xs" c="dimmed">Søndag, 30. Mar, 22:00</Text>
                  </Card>
                  <Card withBorder p="sm" radius="md">
                    <Text fw={500} size="sm">Ugentlig Genstart</Text>
                    <Text size="xs" c="dimmed">Mandag, 31. Mar, 06:00</Text>
                  </Card>
                </SimpleGrid>
              </Box>
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
    </MainLayout>
  );
}

// Temporary fix for potential CheckCircle import issue
const CheckCircle = (props: any) => (
  <svg 
    width={props.size || 24} 
    height={props.size || 24}
    viewBox="0 0 256 256"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M128,24A104,104,0,1,0,232,128,104.12,104.12,0,0,0,128,24Zm49.54,85.54-56,56a8,8,0,0,1-11.08,0l-24-24a8,8,0,0,1,11.08-11.08L116,149l50.46-50.46a8,8,0,0,1,11.08,11.08Z" 
      fill="currentColor"
    />
  </svg>
);