import { AuthProvider } from './components/AuthProvider';
import { Outlet, useRouter, useNavigate } from '@tanstack/react-router';
import { useAuth } from './components/AuthProvider';
import { useEffect } from 'react';

const AuthWrapper = () => {
	const { isAuthorized, isLoading } = useAuth();
	const navigate = useNavigate();
	const { state } = useRouter();

	useEffect(() => {
		if (!isLoading && !isAuthorized && state.location.pathname.startsWith('/logs')) {
			navigate({ to: '/login' });
		}
	}, [isAuthorized, isLoading, state.location.pathname, navigate]);

	return <Outlet />;
};

export default function App() {
	return (
		<AuthProvider>
			<AuthWrapper />
		</AuthProvider>
	);
}
