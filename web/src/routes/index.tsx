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

// Create routes organized by log category
const inventoryLogsRoute = createRoute({
	getParentRoute: () => logsRoute,
	path: '/inventory',
	component: LogsPage,
});

const playersLogsRoute = createRoute({
	getParentRoute: () => logsRoute,
	path: '/players',
	component: LogsPage,
});

const vehiclesLogsRoute = createRoute({
	getParentRoute: () => logsRoute,
	path: '/vehicles',
	component: LogsPage,
});

const adminLogsRoute = createRoute({
	getParentRoute: () => logsRoute,
	path: '/admin',
	component: LogsPage,
});

// Build the route tree with all defined routes
const routeTree = rootRoute.addChildren([homeRoute, loginRoute, authCallbackRoute, logsRoute.addChildren([inventoryLogsRoute, playersLogsRoute, vehiclesLogsRoute, adminLogsRoute])]);

// Create the router instance
export const router = createRouter({ routeTree });

// Type augmentation for router types
declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router;
	}
}
