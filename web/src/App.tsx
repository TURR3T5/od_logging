import { AuthProvider } from './components/AuthProvider';
import { Outlet } from '@tanstack/react-router';
import { Box } from '@mantine/core';

export default function App() {
	return (
		<Box w='100%' bg='#111' mih='100vh'>
			<AuthProvider>
				<Outlet />
			</AuthProvider>
		</Box>
	);
}
