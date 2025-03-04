import { AuthProvider } from './components/AuthProvider';
import { Outlet } from '@tanstack/react-router';

export default function App() {
	return (
		<div className='app-container'>
			<AuthProvider>
				<Outlet />
			</AuthProvider>
		</div>
	);
}
