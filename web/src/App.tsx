import { AuthProvider } from './components/AuthProvider';
import { Outlet } from '@tanstack/react-router';

export default function App() {
	return (
		<div className='app-root' style={{ backgroundColor: '#111', minHeight: '100vh' }}>
			<AuthProvider>
				<Outlet />
			</AuthProvider>
		</div>
	);
}
