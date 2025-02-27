import { AuthProvider } from './components/AuthProvider';
import { Outlet } from '@tanstack/react-router';
import { MantineProvider } from '@mantine/core';

export default function App() {
	return (
		<MantineProvider defaultColorScheme='dark'>
			<AuthProvider>
				<Outlet />
			</AuthProvider>
		</MantineProvider>
	);
}
