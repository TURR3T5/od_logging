import { useEffect } from 'react';
import { AppShell } from '@mantine/core';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from '@tanstack/react-router';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

interface MainLayoutProps {
	children: React.ReactNode;
	requireAuth?: boolean;
}

export default function MainLayout({ children, requireAuth = true }: MainLayoutProps) {
	const { isAuthorized, isLoading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (requireAuth && !isLoading && !isAuthorized) {
			navigate({ to: '/login' });
		}
	}, [requireAuth, isAuthorized, isLoading, navigate]);

	if (isLoading) {
		return null;
	}

	if (requireAuth && !isAuthorized) {
		return null;
	}

	return (
		<AppShell
			padding='md'
			navbar={{
				width: 300,
				breakpoint: 'sm',
				collapsed: { desktop: false, mobile: !isAuthorized },
			}}
			header={{ height: 60 }}
			styles={(theme) => ({
				root: {
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					backgroundColor: '#111',
					position: 'relative',
					overflow: 'hidden',
				},
				main: {
					backgroundColor: '#111',
					color: theme.colors.gray[0],
					minHeight: '100vh',
					width: '100%',
					maxWidth: '1920px',
					margin: '0 auto',
					paddingTop: '80px',
					paddingLeft: isAuthorized ? '320px' : '20px',
					transition: 'padding-left 0.3s ease',
					'@media (max-width: 768px)': {
						paddingLeft: '20px',
					},
				},
				navbar: {
					backgroundColor: '#111',
					width: '300px',
					position: 'fixed',
					left: 'calc(50% - 960px)',
					top: '60px',
					bottom: 0,
					zIndex: 90,
					'@media (max-width: 1920px)': {
						left: '0px',
					},
				},
				header: {
					backgroundColor: '#111',
					borderBottom: `1px solid ${theme.colors.dark[7]}`,
					position: 'fixed',
					width: '100%',
					zIndex: 100,
					maxWidth: '1920px',
					left: '50%',
					transform: 'translateX(-50%)',
				},
			})}
		>
			<AppShell.Header>
				<Header />
			</AppShell.Header>

			{isAuthorized && (
				<AppShell.Navbar>
					<Sidebar />
				</AppShell.Navbar>
			)}

			<AppShell.Main>{children}</AppShell.Main>
		</AppShell>
	);
}
