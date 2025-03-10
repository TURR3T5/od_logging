import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { MantineProvider } from '@mantine/core';
import { router } from './routes';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<MantineProvider defaultColorScheme='dark'>
			<RouterProvider router={router} />
		</MantineProvider>
	</React.StrictMode>
);
