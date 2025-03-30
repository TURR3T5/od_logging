import { Box, Title, Text, Group, Button, ActionIcon, Divider, Paper } from '@mantine/core';
import { ArrowLeft, DotsThree } from '@phosphor-icons/react';
import { ReactNode } from 'react';

interface Action {
	label: string;
	onClick: () => void;
	icon?: ReactNode;
	variant?: 'filled' | 'outline' | 'light' | 'gradient' | 'subtle';
	color?: string;
}

interface PageHeaderProps {
	title: string;
	description?: string;
	primaryAction?: Action;
	secondaryActions?: Action[];
	backButton?: {
		onClick: () => void;
		label?: string;
	};
	children?: ReactNode;
	withDivider?: boolean;
	withPaper?: boolean;
}

export function PageHeader({ title, description, primaryAction, secondaryActions = [], backButton, children, withDivider = true, withPaper = false }: PageHeaderProps) {
	const headerContent = (
		<>
			<Group justify='space-between' wrap='nowrap' mb={description ? 'xs' : 0}>
				<Group wrap='nowrap' gap='md'>
					{backButton && (
						<ActionIcon variant='subtle' size='lg' onClick={backButton.onClick} title={backButton.label || 'Tilbage'}>
							<ArrowLeft size={20} />
						</ActionIcon>
					)}

					<Title order={2}>{title}</Title>
				</Group>

				<Group gap='sm' wrap='nowrap'>
					{secondaryActions.length > 0 && (
						<>
							{/* Mobile view: dropdown menu */}
							<Box hiddenFrom='sm'>
								<ActionIcon variant='subtle'>
									<DotsThree size={24} />
								</ActionIcon>
							</Box>

							{/* Desktop view: buttons */}
							<Group gap='xs' visibleFrom='sm'>
								{secondaryActions.map((action, index) => (
									<Button key={index} variant={action.variant || 'subtle'} color={action.color} onClick={action.onClick} leftSection={action.icon}>
										{action.label}
									</Button>
								))}
							</Group>
						</>
					)}

					{primaryAction && (
						<Button variant={primaryAction.variant || 'filled'} color={primaryAction.color} onClick={primaryAction.onClick} leftSection={primaryAction.icon}>
							{primaryAction.label}
						</Button>
					)}
				</Group>
			</Group>

			{description && (
				<Text c='dimmed' size='sm'>
					{description}
				</Text>
			)}

			{children}

			{withDivider && <Divider my='md' />}
		</>
	);

	if (withPaper) {
		return (
			<Paper withBorder p='md' radius='md' mb='md'>
				{headerContent}
			</Paper>
		);
	}

	return <Box mb='md'>{headerContent}</Box>;
}
