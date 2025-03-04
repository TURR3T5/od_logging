import { useEffect, useState } from 'react';
import { AppShell, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useAuth } from '../components/AuthProvider';
import { useNavigate, useRouter } from '@tanstack/react-router';
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
	const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
	const { isAuthorized, isLoading } = useAuth();
	const navigate = useNavigate();
	const router = useRouter();

	const isLogsPage = router.state.location.pathname.startsWith('/logs');

	useEffect(() => {
		setSidebarOpened(!isMobile);
	}, [isMobile]);

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

	const showSidebar = isAuthorized && isLogsPage;

	return (
		<AppShell
			padding={isMobile ? 'xs' : 'md'}
			navbar={
				showSidebar
					? {
							width: isTablet ? 250 : 300,
							breakpoint: 'sm',
							collapsed: { mobile: !sidebarOpened },
					  }
					: undefined
			}
			header={{ height: 60 }}
			styles={(theme) => ({
				main: {
					backgroundColor: '#111',
					color: theme.colors.gray[0],
					minHeight: '100vh',
					maxWidth: '1920px',
					margin: '0 auto',
				},
			})}
			withBorder={false}
		>
			<AppShell.Header>
				<Header />
			</AppShell.Header>

			{showSidebar && (
				<AppShell.Navbar>
					<Sidebar />
				</AppShell.Navbar>
			)}

			<AppShell.Main>{children}</AppShell.Main>
		</AppShell>
	);
}
