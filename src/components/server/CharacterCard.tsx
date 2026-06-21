import { Link } from '@/i18n/navigation';
import { SelectionControl } from '@/components/SelectionControl';
import type { Item } from '@/types';

interface CharacterCardProps {
  currentPage: number;
  item: Item;
  locale: string;
  searchTerm: string;
  selectLabel: string;
  viewDetailsLabel: string;
}

export function CharacterCard({
  currentPage,
  item,
  locale,
  searchTerm,
  selectLabel,
  viewDetailsLabel,
}: CharacterCardProps) {
  const detailsUrl = `/${locale}?page=${currentPage}&details=${encodeURIComponent(item.detailsId)}${searchTerm ? `&query=${encodeURIComponent(searchTerm)}` : ''}`;

  return (
    <article className="result-card">
      <SelectionControl
        item={{
          ...item,
          detailsUrl,
        }}
        label={`${selectLabel} ${item.name}`}
      />
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
