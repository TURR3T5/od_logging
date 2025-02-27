import { useEffect, useState } from 'react';
import { AppShell, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from '@tanstack/react-router';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

interface MainLayoutProps {
	children: React.ReactNode;
	requireAuth?: boolean;
}

export default function MainLayout({ children, requireAuth = true }: MainLayoutProps) {
	const theme = useMantineTheme();
	const [sidebarOpened, setSidebarOpened] = useState(false);
	const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
	const { isAuthorized, isLoading } = useAuth();
	const navigate = useNavigate();

	// Close sidebar on mobile by default
	useEffect(() => {
		setSidebarOpened(!isMobile);
	}, [isMobile]);

	// Redirect to login if authentication is required but user is not authorized
	useEffect(() => {
		if (requireAuth && !isLoading && !isAuthorized) {
			navigate({ to: '/login' });
		}
	}, [requireAuth, isAuthorized, isLoading, navigate]);

	// If loading authentication state, show nothing yet
	if (isLoading) {
		return null;
	}

	// If auth is required and user is not authorized, don't render content
	if (requireAuth && !isAuthorized) {
		return null;
	}

	return (
		<AppShell
			padding='md'
			navbar={{
				width: 300,
				breakpoint: 'sm',
				collapsed: { mobile: !sidebarOpened },
			}}
			header={{ height: 60 }}
			styles={(theme) => ({
				main: {
					backgroundColor: theme.colors.dark[9],
					color: theme.colors.gray[0],
					minHeight: '100vh',
				},
			})}
		>
			<AppShell.Header>
				<Header />
			</AppShell.Header>

			{isAuthorized && (
				<AppShell.Navbar>
					<Sidebar opened={sidebarOpened} />
				</AppShell.Navbar>
			)}

			<AppShell.Main>{children}</AppShell.Main>
		</AppShell>
	);
}
