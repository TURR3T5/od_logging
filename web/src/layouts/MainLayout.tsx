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

	useEffect(() => {
		document.body.style.backgroundColor = '#111';
		return () => {
			document.body.style.backgroundColor = '';
		};
	}, []);

	if (isLoading) {
		return null;
	}

	if (requireAuth && !isAuthorized) {
		return null;
	}

	const showSidebar = isAuthorized && isLogsPage;

	return (
		<div className='app-root'>
			<div className='header-container' style={{ width: '100%', borderBottom: '1px solid #222', backgroundColor: '#111' }}>
				<Header />
			</div>

			<div className='content-container' style={{ maxWidth: '1920px', margin: '0 auto', marginTop: '60px' }}>
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
					styles={(theme) => ({
						main: {
							backgroundColor: '#111',
							color: theme.colors.gray[0],
							minHeight: 'calc(100vh - 60px)',
							paddingLeft: showSidebar ? (isTablet ? '250px' : '300px') : undefined,
							transition: 'padding-left 0.2s ease',
						},
						navbar: {
							backgroundColor: '#111',
							borderRight: `1px solid ${theme.colors.dark[4]}`,
							position: 'static',
							height: 'auto',
							top: 'auto',
							zIndex: 'auto',
							width: isTablet ? '250px' : '300px',
							float: 'left',
						},
					})}
					layout='default'
					withBorder={false}
					header={{ height: 0 }}
				>
					{showSidebar && (
						<AppShell.Navbar>
							<Sidebar />
						</AppShell.Navbar>
					)}
					<AppShell.Main>{children}</AppShell.Main>
				</AppShell>
			</div>
		</div>
	);
}
