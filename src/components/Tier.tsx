import type { Item as TierItemModel, Tier as TierModel } from '../domain/tierList';
import Item from './Item';

interface TierProps {
	tier: TierModel;
	color: string;
	isSelected?: boolean;
	onSelect?: () => void;
	onItemClick?: (item: TierItemModel) => void;
}

function Tier({ tier, color, isSelected = false, onSelect, onItemClick }: TierProps) {
	return (
		<section className={isSelected ? 'tier-row tier-row-selected' : 'tier-row'}>
			<button
				className="tier-label"
				onClick={onSelect}
				type="button"
				style={{ backgroundColor: color }}
				aria-label={`Select ${tier.name} tier`}
			>
				{tier.name}
			</button>

			<div className="tier-items" onClick={onSelect} role="presentation">
				{tier.items.length > 0 ? (
					tier.items.map((item) => (
						<Item key={item.id} item={item} onClick={onItemClick} />
					))
				) : (
					<p className="tier-empty">No items in this tier yet</p>
				)}
			</div>
		</section>
	);
}

export default Tier;
