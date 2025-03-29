import { useState } from 'react';
import { Container, Title, Text, Box, Grid, Tabs, Group, Paper, Badge, Card, Avatar, Button, Modal, Divider, TextInput, Textarea, Stack, List, ThemeIcon, Accordion } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import MainLayout from '../layouts/MainLayout';
import { CheckCircle, FileText, ClockCounterClockwise, ShieldStar, Heartbeat, Users, Clock, ArrowRight } from '@phosphor-icons/react';
import { useAuth } from '../components/AuthProvider';

interface Question {
	id: string;
	label: string;
	type: 'text' | 'textarea';
}

interface Job {
	id: string;
	title: string;
	description: string;
	requirements: string[];
	isRecruiting: boolean;
	icon: React.ReactNode;
	color: string;
	members: number;
	questions: Question[];
}

interface JobApplication {
	id: string;
	jobId: string;
	jobTitle: string;
	status: 'pending' | 'accepted' | 'rejected';
	submittedAt: Date;
	answers: Record<string, string>;
	feedback?: string;
}

const availableJobs: Job[] = [
	{
		id: 'police',
		title: 'Politi',
		description: 'Beskyt og tjen borgerne i Los Santos. Oprethold lov og orden, efterforsk forbrydelser, og sørg for at byen er sikker for alle borgere.',
		requirements: ['18+ år', 'Minimum 25 timer på serveren', 'God mikrofon og kommunikation', 'Ingen aktive bans eller advarsler', 'Evne til at håndtere stressende situationer'],
		isRecruiting: true,
		icon: <ShieldStar size={36} weight='duotone' />,
		color: 'blue',
		members: 18,
		questions: [
			{ id: 'experience', label: 'Beskriv din erfaring med rollespil, særligt som betjent eller lignende roller', type: 'textarea' },
			{ id: 'motivation', label: 'Hvorfor ønsker du at blive betjent på OdessaRP?', type: 'textarea' },
			{ id: 'scenario', label: 'Hvordan ville du håndtere en situation med en bevæbnet bankrøver?', type: 'textarea' },
			{ id: 'availability', label: 'Hvor mange timer om ugen forventer du at kunne være online?', type: 'text' },
		],
	},
	{
		id: 'ems',
		title: 'EMS',
		description: 'Red liv som paramedic i Los Santos. Reagér på nødsituationer, behandl skader, og sørg for at patienter overlever, så de kan fortsætte deres rollespil.',
		requirements: ['18+ år', 'Minimum 15 timer på serveren', 'God mikrofon og kommunikation', 'Tålmodighed og evne til at håndtere stressende situationer', 'Villighed til at lære medicinske procedurer'],
		isRecruiting: true,
		icon: <Heartbeat size={36} weight='duotone' />,
		color: 'red',
		members: 12,
		questions: [
			{ id: 'experience', label: 'Har du tidligere erfaring som paramedic eller EMS i et rollespil?', type: 'textarea' },
			{ id: 'motivation', label: 'Hvorfor ønsker du at blive EMS på OdessaRP?', type: 'textarea' },
			{ id: 'medical', label: 'Har du kendskab til førstehjælp eller medicinsk procedurer (ikke et krav)?', type: 'textarea' },
			{ id: 'availability', label: 'Hvilke tidspunkter på dagen vil du typisk være tilgængelig?', type: 'text' },
		],
	},
];

const mockUserApplications: JobApplication[] = [
	{
		id: '1',
		jobId: 'police',
		jobTitle: 'Politi',
		status: 'pending',
		submittedAt: new Date(2025, 2, 15),
		answers: {
			experience: 'Jeg har 2 års erfaring som politibetjent på andre servere...',
			motivation: 'Jeg vil gerne blive betjent fordi...',
			scenario: 'I en situation med en bevæbnet bankrøver ville jeg...',
			availability: 'Omkring 20 timer om ugen',
		},
	},
];

function JobCard({ job, onApply }: { job: Job; onApply: () => void }) {
	return (
		<Card withBorder shadow='sm' padding='lg' radius='md'>
			<Card.Section withBorder inheritPadding py='md'>
				<Group gap='md'>
					<ThemeIcon size={48} radius='md' color={job.color} variant='light'>
						{job.icon}
					</ThemeIcon>
					<Box>
						<Group mb={4}>
							<Title order={3}>{job.title}</Title>
							<Badge color={job.isRecruiting ? 'green' : 'red'} variant='light'>
								{job.isRecruiting ? 'Rekrutterer' : 'Lukket for ansøgninger'}
							</Badge>
						</Group>
						<Group>
							<Group gap='xs'>
								<Users size={16} />
								<Text size='sm'>{job.members} medlemmer</Text>
							</Group>
						</Group>
					</Box>
				</Group>
			</Card.Section>

			<Text mt='md' size='sm' c='dimmed'>
				{job.description}
			</Text>

			<Box mt='md'>
				<Text fw={600} size='sm' mb='xs'>
					Krav:
				</Text>
				<List size='sm' spacing='xs'>
					{job.requirements.map((req, index) => (
						<List.Item
							key={index}
							icon={
								<ThemeIcon color={job.color} size={20} radius='xl'>
									<CheckCircle size={12} />
								</ThemeIcon>
							}
						>
							{req}
						</List.Item>
					))}
				</List>
			</Box>

			<Button fullWidth mt='xl' color={job.color} variant={job.isRecruiting ? 'filled' : 'light'} disabled={!job.isRecruiting} rightSection={<ArrowRight size={16} />} onClick={onApply}>
				{job.isRecruiting ? 'Ansøg nu' : 'Lukket for ansøgninger'}
			</Button>
		</Card>
	);
}

function ApplicationModal({ isOpen, onClose, job, onSubmit }: { isOpen: boolean; onClose: () => void; job: Job | null; onSubmit: (data: any) => void }) {
	const [formData, setFormData] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { user } = useAuth();

	const handleSubmit = () => {
		if (!job) return;

		const allFilled = job.questions.every((q) => formData[q.id]?.trim());
		if (!allFilled) {
			notifications.show({
				title: 'Manglende information',
				message: 'Udfyld venligst alle felter i ansøgningen',
				color: 'red',
			});
			return;
		}

		setIsSubmitting(true);

		setTimeout(() => {
			onSubmit({
				jobId: job.id,
				jobTitle: job.title,
				status: 'pending',
				submittedAt: new Date(),
				answers: formData,
			});

			setIsSubmitting(false);
			setFormData({});
			onClose();

			notifications.show({
				title: 'Ansøgning indsendt',
				message: `Din ansøgning til ${job.title} er blevet sendt og vil blive gennemgået af vores team.`,
				color: 'green',
			});
		}, 1000);
	};

	if (!job) return null;

	return (
		<Modal opened={isOpen} onClose={onClose} title={<Text fw={700}>Ansøgning: {job?.title}</Text>} size='lg'>
			<Text size='sm' c='dimmed' mb='md'>
				Udfyld venligst alle felter nedenfor. Din ansøgning vil blive gennemgået af vores administratorer, og du vil modtage svar inden for 7 dage.
			</Text>

			{!user ? (
				<Paper p='md' withBorder mb='md' bg='rgba(255, 0, 0, 0.05)'>
					<Text ta='center' fw={500}>
						Du skal være logget ind for at kunne ansøge
					</Text>
				</Paper>
			) : (
				<Paper withBorder p='sm' mb='lg'>
					<Group>
						<Avatar src={user.avatar_url} radius='xl' />
						<Box>
							<Text fw={500}>{user.global_name || user.username}</Text>
							<Text size='xs' c='dimmed'>
								Discord ID: {user.provider_id || user.sub}
							</Text>
						</Box>
					</Group>
				</Paper>
			)}

			<Stack>
				{job.questions.map((question) => (
					<Box key={question.id}>{question.type === 'textarea' ? <Textarea label={question.label} placeholder='Dit svar her...' minRows={3} value={formData[question.id] || ''} onChange={(e) => setFormData((prev) => ({ ...prev, [question.id]: e.target.value }))} required /> : <TextInput label={question.label} placeholder='Dit svar her...' value={formData[question.id] || ''} onChange={(e) => setFormData((prev) => ({ ...prev, [question.id]: e.target.value }))} required />}</Box>
				))}
			</Stack>

			<Group justify='flex-end' mt='xl'>
				<Button variant='outline' onClick={onClose}>
					Annuller
				</Button>
				<Button onClick={handleSubmit} loading={isSubmitting} disabled={!user}>
					Indsend ansøgning
				</Button>
			</Group>
		</Modal>
	);
}

function getQuestionText(jobId: string, questionId: string): string {
	const job = availableJobs.find((j) => j.id === jobId);
	if (!job) return questionId;

	const question = job.questions.find((q) => q.id === questionId);
	return question?.label || questionId;
}

function ApplicationsList({ applications, isAdmin = false, onUpdateStatus }: { applications: JobApplication[]; isAdmin?: boolean; onUpdateStatus?: (appId: string, status: 'accepted' | 'rejected', feedback?: string) => void }) {
	const [feedbackText, setFeedbackText] = useState<Record<string, string>>({});

	if (applications.length === 0) {
		return (
			<Paper p='xl' withBorder ta='center'>
				<Text c='dimmed'>{isAdmin ? 'Ingen ansøgninger at vise' : 'Du har ingen aktive ansøgninger'}</Text>
			</Paper>
		);
	}

	return (
		<Stack>
			{applications.map((app) => (
				<Paper key={app.id} withBorder p='md'>
					<Group justify='space-between' mb='md'>
						<Group>
							<Text fw={600}>{app.jobTitle}</Text>
							<Badge color={app.status === 'accepted' ? 'green' : app.status === 'rejected' ? 'red' : 'yellow'}>{app.status === 'accepted' ? 'Godkendt' : app.status === 'rejected' ? 'Afvist' : 'Under behandling'}</Badge>
						</Group>
						<Group gap='xs'>
							<Clock size={14} />
							<Text size='sm' c='dimmed'>
								Indsendt: {app.submittedAt.toLocaleDateString()}
							</Text>
						</Group>
					</Group>

					<Accordion>
						<Accordion.Item value='details'>
							<Accordion.Control>
								<Text size='sm'>Vis svar og detaljer</Text>
							</Accordion.Control>
							<Accordion.Panel>
								<Stack>
									{Object.entries(app.answers).map(([key, value]) => (
										<Box key={key}>
											<Text size='sm' fw={500}>
												{getQuestionText(app.jobId, key)}:
											</Text>
											<Text size='sm'>{value}</Text>
										</Box>
									))}

									{app.feedback && (
										<Box>
											<Text fw={500} size='sm'>
												Feedback:
											</Text>
											<Paper p='sm' withBorder bg='rgba(0,0,0,0.03)'>
												<Text size='sm'>{app.feedback}</Text>
											</Paper>
										</Box>
									)}

									{app.status === 'accepted' && (
										<Box p='sm' bg='rgba(0,255,0,0.05)' style={{ borderRadius: '8px' }}>
											<Text fw={500} c='green' ta='center'>
												Tillykke! Din ansøgning er blevet godkendt.
											</Text>
											<Text size='sm' ta='center'>
												En administrator vil kontakte dig på Discord med yderligere information.
											</Text>
										</Box>
									)}

									{isAdmin && app.status === 'pending' && onUpdateStatus && (
										<Box mt='md'>
											<Divider label='Administratorfunktioner' labelPosition='center' mb='md' />
											<Textarea label='Feedback til ansøger' placeholder='Skriv din feedback her...' minRows={3} mb='md' value={feedbackText[app.id] || ''} onChange={(e) => setFeedbackText((prev) => ({ ...prev, [app.id]: e.target.value }))} />

											<Group justify='flex-end'>
												<Button color='red' variant='outline' onClick={() => onUpdateStatus(app.id, 'rejected', feedbackText[app.id])}>
													Afvis ansøgning
												</Button>
												<Button color='green' onClick={() => onUpdateStatus(app.id, 'accepted', feedbackText[app.id])}>
													Godkend ansøgning
												</Button>
											</Group>
										</Box>
									)}
								</Stack>
							</Accordion.Panel>
						</Accordion.Item>
					</Accordion>
				</Paper>
			))}
		</Stack>
	);
}

const mockAllApplications: JobApplication[] = [
	...mockUserApplications,
	{
		id: '2',
		jobId: 'police',
		jobTitle: 'Politi',
		status: 'pending',
		submittedAt: new Date(2025, 2, 20),
		answers: {
			experience: 'Jeg har tidligere spillet politibetjent på flere andre servere i over 3 år.',
			motivation: "Jeg vil gerne blive en del af OdessaRP's politistyrke fordi jeg elsker at være en del af samfundet og hjælpe borgerne.",
			scenario: 'I en situation med en bevæbnet bankrøver ville jeg først sikre civile, derefter etablere en perimeter og forsøge at kommunikere med gerningsmanden.',
			availability: 'Jeg kan være online 15-20 timer om ugen, primært aftenerne.',
		},
	},
	{
		id: '3',
		jobId: 'ems',
		jobTitle: 'EMS',
		status: 'accepted',
		submittedAt: new Date(2025, 2, 10),
		answers: {
			experience: 'Jeg har været EMS på to andre servere, og har god erfaring med medicinsk rollespil.',
			motivation: 'Jeg ønsker at være EMS fordi jeg nyder at hjælpe andre spillere og sikre at alle får en god oplevelse.',
			medical: 'Jeg er sygeplejerskestuderende i virkeligheden, så jeg har god forståelse for medicinske procedurer.',
			availability: 'Jeg er typisk online om aftenen mellem 18-23 i hverdagene og mere i weekenden.',
		},
		feedback: 'Fremragende ansøgning med god erfaring og relevant baggrund. Velkommen til teamet!',
	},
	{
		id: '4',
		jobId: 'ems',
		jobTitle: 'EMS',
		status: 'rejected',
		submittedAt: new Date(2025, 2, 5),
		answers: {
			experience: 'Jeg har ikke tidligere erfaring som EMS, men jeg lærer hurtigt.',
			motivation: 'Jeg vil gerne arbejde som EMS fordi jeg synes det virker sjovt at køre rundt i ambulance.',
			medical: 'Nej, men jeg kan se videoer på YouTube om førstehjælp.',
			availability: 'Jeg spiller mest om natten, efter kl. 23.',
		},
		feedback: 'Tak for din ansøgning. Desværre mangler du relevant erfaring og din motivation virker ikke tilstrækkelig seriøs. Vi opfordrer dig til at få mere erfaring på serveren og søge igen senere.',
	},
];

export default function WhitelistApplicationPage() {
	const { isAuthorized } = useAuth();
	const [applications, setApplications] = useState<JobApplication[]>(isAuthorized ? mockAllApplications : mockUserApplications);
	const [userApplications, setUserApplications] = useState<JobApplication[]>(mockUserApplications);
	const [selectedJob, setSelectedJob] = useState<Job | null>(null);
	const [activeTab, setActiveTab] = useState<string | null>('jobs');
	const [opened, { open, close }] = useDisclosure(false);

	const handleOpenApplication = (job: Job) => {
		setSelectedJob(job);
		open();
	};

	const handleSubmitApplication = (application: Omit<JobApplication, 'id'>) => {
		const newApplication = {
			...application,
			id: Date.now().toString(),
		} as JobApplication;

		setUserApplications((prev) => [...prev, newApplication]);

		if (isAuthorized) {
			setApplications((prev) => [...prev, newApplication]);
		}

		setActiveTab('applications');
	};

	const handleUpdateApplicationStatus = (appId: string, status: 'accepted' | 'rejected', feedback?: string) => {
		const updatedApplications = applications.map((app) => (app.id === appId ? { ...app, status, feedback: feedback || app.feedback } : app));

		setApplications(updatedApplications);

		const updatedUserApplications = userApplications.map((app) => (app.id === appId ? { ...app, status, feedback: feedback || app.feedback } : app));

		setUserApplications(updatedUserApplications);

		notifications.show({
			title: `Ansøgning ${status === 'accepted' ? 'godkendt' : 'afvist'}`,
			message: `Du har ${status === 'accepted' ? 'godkendt' : 'afvist'} ansøgningen.`,
			color: status === 'accepted' ? 'green' : 'red',
		});
	};

	return (
		<MainLayout requireAuth={true} requiredPermission='admin'>
			<Container size='xl' py='xl'>
				<Title order={1} mb='md'>
					Ansøgninger
				</Title>
				<Text c='dimmed' mb='xl'>
					Ansøg om at blive en del af de whitelistede jobs på OdessaRP serveren
				</Text>

				<Paper withBorder p='md' radius='md' mb='xl'>
					<Group mb='md'>
						<Box style={{ width: '4px', height: '24px', backgroundColor: '#228be6', borderRadius: '2px' }} />
						<Title order={4}>Vigtig Information</Title>
					</Group>
					<Text>For at blive en del af vores whitelistede jobs skal du gennemgå en ansøgningsproces. Alle ansøgninger bliver gennemgået af vores administratorer, og svartiden er typisk inden for 7 dage. Bemærk at hvert job har specifikke krav til erfaring og aktivitet på serveren.</Text>
				</Paper>

				<Tabs value={activeTab} onChange={setActiveTab} mb='xl'>
					<Tabs.List>
						<Tabs.Tab value='jobs' leftSection={<FileText size={16} />}>
							Tilgængelige jobs
						</Tabs.Tab>
						<Tabs.Tab value='applications' leftSection={<ClockCounterClockwise size={16} />}>
							{isAuthorized ? 'Alle ansøgninger' : 'Dine ansøgninger'}
						</Tabs.Tab>
						{isAuthorized && (
							<Tabs.Tab value='your-applications' leftSection={<ClockCounterClockwise size={16} />}>
								Dine ansøgninger
							</Tabs.Tab>
						)}
					</Tabs.List>

					<Tabs.Panel value='jobs' pt='xl'>
						<Grid>
							{availableJobs.map((job) => (
								<Grid.Col span={{ base: 12, md: 6 }} key={job.id}>
									<JobCard job={job} onApply={() => handleOpenApplication(job)} />
								</Grid.Col>
							))}
						</Grid>
					</Tabs.Panel>

					<Tabs.Panel value='applications' pt='xl'>
						{isAuthorized ? (
							<>
								<Paper withBorder p='md' mb='xl' bg='rgba(0, 0, 0, 0.03)'>
									<Group gap='sm'>
										<ShieldStar size={24} />
										<Text fw={500}>Administrator Panel</Text>
									</Group>
									<Text size='sm'>Som administrator kan du gennemgå og håndtere alle jobansøgninger her.</Text>
								</Paper>
								<ApplicationsList applications={applications} isAdmin={true} onUpdateStatus={handleUpdateApplicationStatus} />
							</>
						) : (
							<ApplicationsList applications={userApplications} />
						)}
					</Tabs.Panel>

					{isAuthorized && (
						<Tabs.Panel value='your-applications' pt='xl'>
							<ApplicationsList applications={userApplications} />
						</Tabs.Panel>
					)}
				</Tabs>

				<ApplicationModal isOpen={opened} onClose={close} job={selectedJob} onSubmit={handleSubmitApplication} />
			</Container>
		</MainLayout>
	);
}
