import { Navigate } from '@tanstack/react-router';
import { useAuth } from '../components/AuthProvider';
import { Center, Loader } from '@mantine/core';

export default function HomePage() {
	const { isAuthorized, isLoading } = useAuth();

	if (isLoading) {
		return (
			<Center h='100vh'>
				<Loader size='xl' />
			</Center>
		);
	}

	if (isAuthorized) {
		return <Navigate to='/logs' />;
	}

	return <Navigate to='/login' />;
}
