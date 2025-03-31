import { memo, useMemo } from 'react';
import { ContentCard } from './ContentCard';
import { ContentItem } from '../../lib/NewsEventsService';

interface MemoizedContentCardProps {
	item: ContentItem;
	viewMode?: 'list' | 'grid';
	onView: (item: ContentItem) => void;
	onPin?: (id: string) => void;
	onEdit?: (item: ContentItem) => void;
	onDelete?: (id: string) => void;
	isAuthorized?: boolean;
}

export const MemoizedContentCard = memo(function MemoizedContentCard(props: MemoizedContentCardProps) {
	const { item, viewMode, onView, onPin, onEdit, onDelete, isAuthorized } = props;

	const handleView = useMemo(() => () => onView(item), [item, onView]);
	const handlePin = useMemo(() => (onPin ? () => onPin(item.id) : undefined), [item.id, onPin]);
	const handleEdit = useMemo(() => (onEdit ? () => onEdit(item) : undefined), [item, onEdit]);
	const handleDelete = useMemo(() => (onDelete ? () => onDelete(item.id) : undefined), [item.id, onDelete]);

	return <ContentCard item={item} viewMode={viewMode} onView={handleView} onPin={handlePin} onEdit={handleEdit} onDelete={handleDelete} isAuthorized={isAuthorized} />;
});
