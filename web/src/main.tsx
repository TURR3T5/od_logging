import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { MantineProvider, Notifications } from '../src/components/mantine';
import { router } from './routes';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import './styles/index.css';
import { appTheme } from './styles/theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<MantineProvider defaultColorScheme='dark' theme={appTheme}>
			<Notifications />
			<RouterProvider router={router} />
		</MantineProvider>
	</StrictMode>
);
