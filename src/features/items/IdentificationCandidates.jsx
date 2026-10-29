const normal = value => String(value || '').trim().toLowerCase();
export function existingMatches(candidate, items) {
  return items.filter(item => {
    const known = item.record.identity;
    return candidate.model && normal(known.model) === normal(candidate.model) && normal(known.brand) === normal(candidate.brand) || candidate.quote?.length > 8 && known.source === candidate.quote;
  });
}
export default function IdentificationCandidates({
  candidates,
  items,
  onChoose,
  onExisting
}) {
  return candidates.map((candidate, index) => {
    const existing = existingMatches(candidate, items);
    return <article className="journey-panel item-intake" key={index}><h2>{candidate.name}</h2><p>{[candidate.brand, candidate.model].filter(Boolean).join(' · ') || 'Exact model not established'}</p><blockquote>{candidate.quote}</blockquote>{candidate.fieldEvidence?.map((field, i) => <p className="journey-note" key={i}>{field.path.replaceAll('.', ' ')}: {field.quote}</p>)}{existing.length > 0 && <div className="journey-status"><p>This model or evidence is already recorded in this home. Open that record, or add another item if you own more than one.</p>{existing.map(item => <button type="button" className="journey-link item-spaced" key={item.id} onClick={() => onExisting(item.id)}>Open existing {item.record.name}</button>)}</div>}<button className="journey-button" onClick={() => onChoose(candidate)}>{existing.length ? 'Add another physical item' : 'Review and confirm this item'}</button></article>;
  });
}
