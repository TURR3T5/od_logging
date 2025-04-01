import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import App from '../App';
import { LoadingState } from '../components/common/LoadingState';

const HomePage = lazy(() => import('../pages/Home'));
const LoginPage = lazy(() => import('../pages/Login'));
const LogsPage = lazy(() => import('../pages/Logs'));
const AuthCallbackPage = lazy(() => import('../pages/AuthCallback'));
const RulesPage = lazy(() => import('../pages/Rules'));
const NewsAndEventsPage = lazy(() => import('../pages/NewsAndEventsPage'));
const WhitelistApplicationPage = lazy(() => import('../pages/WhitelistPortal'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const RoleManagementPage = lazy(() => import('../pages/RoleManagement'));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => <Suspense fallback={<LoadingState fullPage />}>{children}</Suspense>;

const rootRoute = createRootRoute({
	component: App,
});

const homeRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/',
	component: () => (
		<SuspenseWrapper>
			<HomePage />
		</SuspenseWrapper>
	),
});

const loginRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/login',
	component: () => (
		<SuspenseWrapper>
			<LoginPage />
		</SuspenseWrapper>
	),
});

const rulesRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/rules',
	component: () => (
		<SuspenseWrapper>
			<RulesPage />
		</SuspenseWrapper>
	),
});

const authCallbackRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/auth/callback',
	component: () => (
		<SuspenseWrapper>
			<AuthCallbackPage />
		</SuspenseWrapper>
	),
});

const logsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/logs',
	component: () => (
		<SuspenseWrapper>
			<LogsPage />
		</SuspenseWrapper>
	),
});

const eventsCalendarRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/events',
	component: () => (
		<SuspenseWrapper>
			<NewsAndEventsPage />
		</SuspenseWrapper>
	),
});

const whitelistApplicationRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/whitelist',
	component: () => (
		<SuspenseWrapper>
			<WhitelistApplicationPage />
		</SuspenseWrapper>
	),
});

const profileRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/profile',
	component: () => (
		<SuspenseWrapper>
			<ProfilePage />
		</SuspenseWrapper>
	),
});

const roleManagementRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/admin/roles',
	component: () => (
		<SuspenseWrapper>
			<RoleManagementPage />
		</SuspenseWrapper>
	),
});

const routeTree = rootRoute.addChildren([homeRoute, loginRoute, authCallbackRoute, logsRoute, rulesRoute, eventsCalendarRoute, whitelistApplicationRoute, profileRoute, roleManagementRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}
