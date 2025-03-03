import { AuthProvider } from './components/AuthProvider';
import { Outlet } from '@tanstack/react-router';
import { MantineProvider } from '@mantine/core';

export default function App() {
	return (
		<MantineProvider defaultColorScheme='dark'>
			<div className='app-container'>
				<AuthProvider>
					<Outlet />
				</AuthProvider>
			</div>
		</MantineProvider>
	);
}
