import { useEffect, useState } from 'react';
import { AppShell, useMantineTheme, Box, Container, Alert, Button, Center, Loader } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useAuth } from '../components/AuthProvider';
import { useNavigate, useRouter } from '@tanstack/react-router';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

interface MainLayoutProps {
	children: React.ReactNode;
	requireAuth?: boolean;
	requiredPermission?: 'admin' | 'staff' | 'content' | 'viewer';
}

export default function MainLayout({ children, requireAuth = true, requiredPermission = 'viewer' }: MainLayoutProps) {
	const theme = useMantineTheme();
	const [sidebarOpened, setSidebarOpened] = useState(false);
	const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
	const isTablet = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
	const { isAuthorized, isLoading, permissionLevel, hasPermission } = useAuth();
	const navigate = useNavigate();
	const router = useRouter();

	const isLogsPage = router.state.location.pathname.startsWith('/logs');
	const [hasPermissionState, setHasPermissionState] = useState<boolean | null>(null);
	const [checkingPermission, setCheckingPermission] = useState(true);

	useEffect(() => {
		setSidebarOpened(!isMobile);
	}, [isMobile]);

	useEffect(() => {
		if (requireAuth && !isLoading) {
			if (!isAuthorized) {
				navigate({ to: '/login' });
			} else if (requiredPermission) {
				setCheckingPermission(true);
				hasPermission(requiredPermission).then((result) => {
					setHasPermissionState(result);
					setCheckingPermission(false);
				});
			} else {
				setHasPermissionState(true);
				setCheckingPermission(false);
			}
		} else {
			setHasPermissionState(true);
			setCheckingPermission(false);
		}
	}, [requireAuth, isAuthorized, isLoading, navigate, requiredPermission, hasPermission]);

	useEffect(() => {
		document.body.style.backgroundColor = '#111';
		return () => {
			document.body.style.backgroundColor = '';
		};
	}, []);

	if (isLoading || checkingPermission) {
		return (
			<Center style={{ height: '100vh', width: '100%' }}>
				<Loader size='xl' />
			</Center>
		);
	}

	if (requireAuth && !isAuthorized) {
		return null;
	}

	if (requireAuth && requiredPermission && hasPermissionState === false) {
		return (
			<Box>
				<Box
					w='100%'
					style={{
						borderBottom: '1px solid #222',
						backgroundColor: '#111',
					}}
				>
					<Header />
				</Box>
				<Container size='md' style={{ marginTop: '100px' }}>
					<Alert title='Access Denied' color='red' variant='filled'>
						You do not have permission to access this page. This feature requires {requiredPermission} privileges.
						<Button variant='white' color='red' fullWidth mt='md' onClick={() => navigate({ to: '/' })}>
							Go back to homepage
						</Button>
					</Alert>
				</Container>
			</Box>
		);
	}

	const showSidebar = isAuthorized && isLogsPage && (permissionLevel === 'admin' || permissionLevel === 'staff');

	return (
		<Box>
			<Box
				w='100%'
				style={{
					borderBottom: '1px solid #222',
					backgroundColor: '#111',
				}}
			>
				<Header />
			</Box>

			<Box
				style={{
					maxWidth: '1920px',
					margin: '0 auto',
					marginTop: '60px',
				}}
			>
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
							left: 'auto',
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
			</Box>
		</Box>
	);
}
