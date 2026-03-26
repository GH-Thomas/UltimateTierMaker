import type { Item as TierItemModel } from '../domain/tierList';

interface ItemProps {
	item: TierItemModel;
	size?: number;
	onClick?: (item: TierItemModel) => void;
}

function Item({ item, size = 72, onClick }: ItemProps) {
	const handleClick = () => {
		if (onClick) {
			onClick(item);
		}
	};

	return (
		<button
			className="tier-item"
			onClick={handleClick}
			type="button"
			title={item.label}
			style={{ width: `${size}px`, height: `${size}px` }}
		>
			<img
				className="tier-item-image"
				src={item.imageUrl ?? `https://picsum.photos/seed/${item.id}/144`}
				alt={item.label}
				loading="lazy"
			/>
		</button>
	);
}

export default Item;
