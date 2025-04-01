import { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { Container, Title, Text, Button, Paper, Box, TextInput, PasswordInput, Tabs } from '../components/mantine';
import { Navigate } from '@tanstack/react-router';
import { Mail, Lock } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { notifications } from '@mantine/notifications';
export default function LoginPage() {
	const { /* signInWithDiscord, */ signInWithEmail, signUpWithEmail, isAuthorized, isLoading } = useAuth();
	const [activeTab, setActiveTab] = useState<string | null>('login');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [processing, setProcessing] = useState(false);
	if (isAuthorized && !isLoading) {
		return <Navigate to='/' />;
	}
	const handleSignIn = async () => {
		if (!email || !password) {
			notifications.show({
				title: 'Missing Information',
				message: 'Please enter both email and password',
				color: 'red',
			});
			return;
		}
		setProcessing(true);
		try {
			await signInWithEmail(email, password);
		} catch (error) {
			console.error('Login error:', error);
			notifications.show({
				title: 'Login Failed',
				message: error instanceof Error ? error.message : 'Invalid credentials or account does not exist',
				color: 'red',
			});
		} finally {
			setProcessing(false);
		}
	};
	const handleSignUp = async () => {
		if (!email || !password) {
			notifications.show({
				title: 'Missing Information',
				message: 'Please enter both email and password',
				color: 'red',
			});
			return;
		}
		if (password !== confirmPassword) {
			notifications.show({
				title: 'Password Mismatch',
				message: 'Passwords do not match',
				color: 'red',
			});
			return;
		}
		setProcessing(true);
		try {
			await signUpWithEmail(email, password);
			notifications.show({
				title: 'Account Created',
				message: 'Your account has been created successfully. You can now sign in.',
				color: 'green',
			});
			setActiveTab('login');
		} catch (error) {
			console.error('Signup error:', error);
			notifications.show({
				title: 'Signup Failed',
				message: error instanceof Error ? error.message : 'Failed to create account',
				color: 'red',
			});
		} finally {
			setProcessing(false);
		}
	};
	return (
		<MainLayout requireAuth={false}>
			<Box
				style={{
					display: 'flex',
					flexDirection: 'column',
					minHeight: 'calc(100vh - 60px)',
					backgroundColor: '#111',
				}}
			>
				<Container size='xs' my='auto'>
					<Paper withBorder shadow='md' p='xl' radius='md'>
						<Tabs value={activeTab} onChange={setActiveTab}>
							<Tabs.List grow mb='md'>
								<Tabs.Tab value='login'>Login</Tabs.Tab>
								<Tabs.Tab value='signup'>Sign Up</Tabs.Tab>
							</Tabs.List>
							<Tabs.Panel value='login'>
								<Title order={2} ta='center' c='gray.0' fw={700} mb='md'>
									FiveM Logging System
								</Title>
								<TextInput label='Email' placeholder='your@email.com' required mb='md' leftSection={<Mail size={16} />} value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
								<PasswordInput label='Password' placeholder='Your password' required mb='xl' leftSection={<Lock size={16} />} value={password} onChange={(e) => setPassword(e.currentTarget.value)} />
								<Button fullWidth size='md' variant='gradient' gradient={{ from: 'indigo', to: 'blue' }} onClick={handleSignIn} loading={processing || isLoading}>
									Sign In
								</Button>
							</Tabs.Panel>
							<Tabs.Panel value='signup'>
								<Title order={2} ta='center' c='gray.0' fw={700} mb='md'>
									Create Account
								</Title>
								<TextInput label='Email' placeholder='your@email.com' required mb='md' leftSection={<Mail size={16} />} value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
								<PasswordInput label='Password' placeholder='Choose a password' required mb='md' leftSection={<Lock size={16} />} value={password} onChange={(e) => setPassword(e.currentTarget.value)} />
								<PasswordInput label='Confirm Password' placeholder='Confirm your password' required mb='xl' leftSection={<Lock size={16} />} value={confirmPassword} onChange={(e) => setConfirmPassword(e.currentTarget.value)} />
								<Button fullWidth size='md' variant='gradient' gradient={{ from: 'indigo', to: 'blue' }} onClick={handleSignUp} loading={processing || isLoading}>
									Create Account
								</Button>
							</Tabs.Panel>
						</Tabs>
						{/* Keep Discord login option commented out but preserved */}
						{/* <Divider label="Or continue with" labelPosition="center" my="lg" />
						<Button 
							fullWidth 
							leftSection={<DiscordLogo size={18} />} 
							size='md' 
							variant='gradient' 
							gradient={{ from: 'indigo', to: 'blue' }} 
							onClick={signInWithDiscord} 
							loading={isLoading}
						>
							Continue with Discord
						</Button> */}
						<Text size='xs' c='dimmed' ta='center' mt='md'>
							Only authorized users with appropriate permissions can access this system.
						</Text>
					</Paper>
				</Container>
			</Box>
		</MainLayout>
	);
}
