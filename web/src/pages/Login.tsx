import { useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { Container, Title, Text, Button, Paper, Box, TextInput, PasswordInput, Tabs } from '@mantine/core';
import { Navigate } from '@tanstack/react-router';
import { Mail, Lock } from 'lucide-react';
import MainLayout from '../layouts/MainLayout';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';

export default function LoginPage() {
	const { signInWithEmail, signUpWithEmail, isAuthorized, isLoading } = useAuth();
	const [activeTab, setActiveTab] = useState<string | null>('login');
	const [processing, setProcessing] = useState(false);

	const loginForm = useForm({
		mode: 'uncontrolled',
		initialValues: {
			email: '',
			password: '',
		},
		validate: {
			email: (value) => (!value ? 'Email is required' : null),
			password: (value) => (!value ? 'Password is required' : null),
		},
	});

	const signupForm = useForm({
		mode: 'uncontrolled',
		initialValues: {
			email: '',
			password: '',
			confirmPassword: '',
		},
		validate: {
			email: (value) => (!value ? 'Email is required' : null),
			password: (value) => (!value ? 'Password is required' : null),
			confirmPassword: (value, values) => (value !== values.password ? 'Passwords do not match' : null),
		},
	});

	if (isAuthorized && !isLoading) {
		return <Navigate to='/' />;
	}

	const handleSignIn = async (values: typeof loginForm.values) => {
		setProcessing(true);
		try {
			await signInWithEmail(values.email, values.password);
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

	const handleSignUp = async (values: typeof signupForm.values) => {
		setProcessing(true);
		try {
			await signUpWithEmail(values.email, values.password);
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
								<Box component='form' onSubmit={loginForm.onSubmit(handleSignIn)}>
									<Title order={2} ta='center' c='gray.0' fw={700} mb='md'>
										FiveM Logging System
									</Title>
									<TextInput label='Email' placeholder='your@email.com' required mb='md' leftSection={<Mail size={16} />} key={loginForm.key('email')} {...loginForm.getInputProps('email')} autoComplete='username email' type='email' />
									<PasswordInput label='Password' placeholder='Your password' required mb='xl' leftSection={<Lock size={16} />} key={loginForm.key('password')} {...loginForm.getInputProps('password')} autoComplete='current-password' />
									<Button fullWidth size='md' variant='gradient' gradient={{ from: 'indigo', to: 'blue' }} type='submit' loading={processing || isLoading}>
										Sign In
									</Button>
								</Box>
							</Tabs.Panel>

							<Tabs.Panel value='signup'>
								<Box component='form' onSubmit={signupForm.onSubmit(handleSignUp)}>
									<Title order={2} ta='center' c='gray.0' fw={700} mb='md'>
										Create Account
									</Title>
									<TextInput label='Email' placeholder='your@email.com' required mb='md' leftSection={<Mail size={16} />} key={signupForm.key('email')} {...signupForm.getInputProps('email')} autoComplete='username email' type='email' />
									<PasswordInput label='Password' placeholder='Choose a password' required mb='md' leftSection={<Lock size={16} />} key={signupForm.key('password')} {...signupForm.getInputProps('password')} autoComplete='new-password' />
									<PasswordInput label='Confirm Password' placeholder='Confirm your password' required mb='xl' leftSection={<Lock size={16} />} key={signupForm.key('confirmPassword')} {...signupForm.getInputProps('confirmPassword')} autoComplete='new-password' />
									<Button fullWidth size='md' variant='gradient' gradient={{ from: 'indigo', to: 'blue' }} type='submit' loading={processing || isLoading}>
										Create Account
									</Button>
								</Box>
							</Tabs.Panel>
						</Tabs>

						<Text size='xs' c='dimmed' ta='center' mt='md'>
							Only authorized users with appropriate permissions can access this system.
						</Text>
					</Paper>
				</Container>
			</Box>
		</MainLayout>
	);
}
