import { Link } from '@/i18n/navigation';
import type { Item } from '@/types';

interface CharacterCardProps {
  currentPage: number;
  item: Item;
  searchTerm: string;
  viewDetailsLabel: string;
}

export function CharacterCard({
  currentPage,
  item,
  searchTerm,
  viewDetailsLabel,
}: CharacterCardProps) {
  return (
    <article className="result-card">
      <h2>{item.name}</h2>
      <p>{item.description}</p>
      <Link
        className="result-card__action"
        href={{
          pathname: '/',
          query: {
            details: item.detailsId,
            page: currentPage,
            ...(searchTerm ? { query: searchTerm } : {}),
          },
        }}
      >
        {viewDetailsLabel}
      </Link>
    </article>
  );
}
