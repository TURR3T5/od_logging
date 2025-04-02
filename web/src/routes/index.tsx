import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import App from '../App';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';

const HomePage = lazy(() => import(/* webpackChunkName: "home-page" */ '../pages/Home'));
const LoginPage = lazy(() => import(/* webpackChunkName: "login-page" */ '../pages/Login'));
const LogsPage = lazy(() => import(/* webpackChunkName: "logs-page" */ '../pages/Logs'));
const AuthCallbackPage = lazy(() => import(/* webpackChunkName: "auth-callback-page" */ '../pages/AuthCallback'));
const RulesPage = lazy(() => import(/* webpackChunkName: "rules-page" */ '../pages/Rules'));
const NewsAndEventsPage = lazy(() => import(/* webpackChunkName: "news-and-events-page" */ '../pages/NewsAndEventsPage'));
const WhitelistApplicationPage = lazy(() => import(/* webpackChunkName: "whitelist-application-page" */ '../pages/WhitelistPortal'));
const ProfilePage = lazy(() => import(/* webpackChunkName: "profile-page" */ '../pages/ProfilePage'));
const RoleManagementPage = lazy(() => import(/* webpackChunkName: "role-management-page" */ '../pages/RoleManagement'));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => <Suspense fallback={<LoadingState fullPage />}>{children}</Suspense>;

const rootRoute = createRootRoute({
	component: App,
	errorComponent: () => (
		<SuspenseWrapper>
			<ErrorState />
		</SuspenseWrapper>
	),
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
