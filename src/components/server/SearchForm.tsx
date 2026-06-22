import { searchCharacters } from '@/app/[locale]/actions';

interface SearchFormProps {
  detailsId: string;
  locale: string;
  searchTerm: string;
  translations: {
    inputLabel: string;
    submit: string;
  };
}

export function SearchForm({
  detailsId,
  locale,
  searchTerm,
  translations,
}: SearchFormProps) {
  const searchAction = searchCharacters.bind(null, locale);

  return (
    <section className="search-section">
      <form className="search-form" action={searchAction}>
        {detailsId && <input name="details" type="hidden" value={detailsId} />}
        <input
          aria-label={translations.inputLabel}
          defaultValue={searchTerm}
          name="query"
          type="search"
        />
        <button type="submit">{translations.submit}</button>
      </form>
    </section>
  );
}
