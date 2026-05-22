import type { MouseEvent } from 'react';
import type { Item } from '../types';

interface CardProps {
  item: Item;
  onSelectItem: (itemId: string) => void;
}

export function Card({ item, onSelectItem }: CardProps) {
  const handleDetailsClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onSelectItem(item.id);
  };

  return (
    <article>
      <h2>{item.name}</h2>
      <p>{item.description}</p>
      <button type="button" onClick={handleDetailsClick}>
        View details
      </button>
    </article>
  );
}
