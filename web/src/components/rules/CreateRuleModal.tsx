import { useEffect, useState } from 'react';
import { Box, Group, TextInput, Tabs, Textarea, MultiSelect, Switch, Button, Text, Paper, Modal, SegmentedControl } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Pencil, Eye } from '@phosphor-icons/react';
import RuleApiService from '../../lib/RuleApiService';

interface CreateRuleModalProps {
	opened: boolean;
	onClose: () => void;
	onRuleCreated: () => void;
}

interface NewRule {
	badge: string;
	title: string;
	content: string;
	category: 'community' | 'roleplay';
	tags: string[];
	is_pinned: boolean;
}

export default function CreateRuleModal({ opened, onClose, onRuleCreated }: CreateRuleModalProps) {
	const [newRule, setNewRule] = useState<NewRule>({
		badge: '',
		title: '',
		content: '',
		category: 'community',
		tags: [],
		is_pinned: false,
	});

	const [isCreating, setIsCreating] = useState(false);

	const handleOpened = () => {
		setNewRule({
			badge: '',
			title: '',
			content: '',
			category: 'community',
			tags: [],
			is_pinned: false,
		});
	};

	const handleCreateRule = async () => {
		if (!newRule.badge || !newRule.title || !newRule.content) {
			notifications.show({
				title: 'Manglende information',
				message: 'Venligst udfyld alle påkrævede felter',
				color: 'red',
			});
			return;
		}

		setIsCreating(true);
		try {
			await RuleApiService.createRule({
				badge: newRule.badge,
				title: newRule.title,
				content: newRule.content,
				category: newRule.category,
				tags: newRule.tags,
				is_pinned: newRule.is_pinned,
			});

			notifications.show({
				title: 'Regel oprettet',
				message: 'Den nye regel er blevet oprettet med succes',
				color: 'green',
			});

			onRuleCreated();
			onClose();
		} catch (error) {
			console.error('Error creating rule:', error);
			notifications.show({
				title: 'Fejl',
				message: 'Der opstod en fejl under oprettelse af reglen',
				color: 'red',
			});
		} finally {
			setIsCreating(false);
		}
	};

	const updateNewRule = (key: keyof NewRule, value: any) => {
		setNewRule((prev) => ({
			...prev,
			[key]: value,
		}));
	};

    useEffect(() => {
        if (opened) {
            handleOpened();
        }
    }, [opened]);

	return (
		<Modal opened={opened} onClose={onClose} title={<Text fw={700}>Opret Ny Regel</Text>} size='lg'>
			<Box>
				<Group grow mb='md'>
					<TextInput label='Badge' placeholder='F.eks. C1 eller §8' value={newRule.badge} onChange={(e) => updateNewRule('badge', e.target.value)} required />
					<TextInput label='Titel' placeholder='Regel titel' value={newRule.title} onChange={(e) => updateNewRule('title', e.target.value)} required />
				</Group>

				<SegmentedControl
					mb='md'
					fullWidth
					value={newRule.category}
					onChange={(value) => updateNewRule('category', value as 'community' | 'roleplay')}
					data={[
						{ label: 'Community Regel', value: 'community' },
						{ label: 'Rollespils Regel', value: 'roleplay' },
					]}
				/>

				<Tabs defaultValue='edit'>
					<Tabs.List mb='xs'>
						<Tabs.Tab value='edit' leftSection={<Pencil size={14} />}>
							Rediger
						</Tabs.Tab>
						<Tabs.Tab value='preview' leftSection={<Eye size={14} />}>
							Forhåndsvisning
						</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value='edit' pt='xs'>
						<Textarea label='Indhold' placeholder='Regelens indhold' value={newRule.content} onChange={(e) => updateNewRule('content', e.target.value)} minRows={10} mb='md' required />
					</Tabs.Panel>

					<Tabs.Panel value='preview' pt='xs'>
						<Paper withBorder p='md' style={{ minHeight: '200px' }}>
							{newRule.content}
						</Paper>
					</Tabs.Panel>
				</Tabs>

				<MultiSelect
					label='Tags'
					data={[
						{ value: 'behavior', label: 'Opførsel' },
						{ value: 'combat', label: 'Kamp' },
						{ value: 'roleplay', label: 'Rollespil' },
						{ value: 'ooc', label: 'OOC' },
						{ value: 'fear', label: 'Fear RP' },
						{ value: 'rdm', label: 'RDM' },
						{ value: 'vdm', label: 'VDM' },
						{ value: 'metagaming', label: 'Metagaming' },
						{ value: 'powergaming', label: 'Powergaming' },
						{ value: 'nlr', label: 'NLR' },
						{ value: 'support', label: 'Support' },
						{ value: 'staff', label: 'Staff' },
						{ value: 'discord', label: 'Discord' },
					]}
					value={newRule.tags}
					onChange={(value) => updateNewRule('tags', value)}
					mb='md'
					searchable
				/>

				<Switch label='Fastgør til Hurtigt Overblik' checked={newRule.is_pinned} onChange={(e) => updateNewRule('is_pinned', e.currentTarget.checked)} mb='lg' />

				<Group justify='right'>
					<Button variant='outline' onClick={onClose}>
						Annuller
					</Button>
					<Button onClick={handleCreateRule} loading={isCreating}>
						Opret Regel
					</Button>
				</Group>
			</Box>
		</Modal>
	);
}
