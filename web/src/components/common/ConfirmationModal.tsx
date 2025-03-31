import { Modal, Text, Button, Group, Stack, Alert, ThemeIcon } from '@mantine/core';
import { Warning, Check } from '../icons';
import { ReactNode } from 'react';

export type ConfirmationVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmationModalProps {
	opened: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string | ReactNode;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: ConfirmationVariant;
	isLoading?: boolean;
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function ConfirmationModal({ opened, onClose, onConfirm, title, message, confirmLabel = 'Bekræft', cancelLabel = 'Annuller', variant = 'danger', isLoading = false, size = 'sm' }: ConfirmationModalProps) {
	const getVariantDetails = () => {
		switch (variant) {
			case 'danger':
				return {
					color: 'red',
					icon: <Warning size={20} />,
					confirmButtonColor: 'red',
					confirmButtonVariant: 'filled' as const,
				};
			case 'warning':
				return {
					color: 'yellow',
					icon: <Warning size={20} />,
					confirmButtonColor: 'yellow',
					confirmButtonVariant: 'filled' as const,
				};
			case 'success':
				return {
					color: 'green',
					icon: <Check size={20} />,
					confirmButtonColor: 'green',
					confirmButtonVariant: 'filled' as const,
				};
			case 'info':
			default:
				return {
					color: 'blue',
					icon: <Warning size={20} />,
					confirmButtonColor: 'blue',
					confirmButtonVariant: 'filled' as const,
				};
		}
	};

	const variantDetails = getVariantDetails();

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={
				<Group gap='xs'>
					<ThemeIcon variant='light' color={variantDetails.color} size='md'>
						{variantDetails.icon}
					</ThemeIcon>
					<Text fw={600}>{title}</Text>
				</Group>
			}
			size={size}
			centered
		>
			<Stack gap='md'>
				<Alert color={variantDetails.color} variant='light' icon={variantDetails.icon}>
					{typeof message === 'string' ? <Text>{message}</Text> : message}
				</Alert>

				<Group justify='flex-end' mt='md'>
					<Button variant='subtle' onClick={onClose} disabled={isLoading}>
						{cancelLabel}
					</Button>
					<Button color={variantDetails.confirmButtonColor} variant={variantDetails.confirmButtonVariant} onClick={onConfirm} loading={isLoading}>
						{confirmLabel}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
