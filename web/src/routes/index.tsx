import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import App from '../App';
import HomePage from '../pages/Home';
import LoginPage from '../pages/Login';
import LogsPage from '../pages/Logs';
import AuthCallbackPage from '../pages/AuthCallback';

const rootRoute = createRootRoute({
	component: App,
});

const homeRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/',
	component: HomePage,
});

const loginRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/login',
	component: LoginPage,
});

const authCallbackRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/auth/callback',
	component: AuthCallbackPage,
});

const logsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/logs',
	component: LogsPage,
});

const routeTree = rootRoute.addChildren([homeRoute, loginRoute, authCallbackRoute, logsRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}
