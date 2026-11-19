import { useEffect, useState } from 'react';
import { getDocumentPreview } from '../../api/api';
export default function RecordPreview({
  documentId,
  onClose
}) {
  const [preview, setPreview] = useState(null),
    [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setPreview(null);
    setError('');
    getDocumentPreview(documentId).then(result => {
      if (active) setPreview(result.data);
    }).catch(() => {
      if (active) setError('The preview could not be loaded. Your association is still saved.');
    });
    return () => {
      active = false;
    };
  }, [documentId]);
  return <section className="journey-panel item-intake" aria-label="Document preview"><div className="journey-actions"><h2>{preview?.name || 'Document preview'}</h2><button type="button" className="journey-link" onClick={onClose}>Close preview</button></div>{!preview && !error && <p role="status">Loading preview…</p>}{error && <p role="alert">{error}</p>}{preview?.preview_image?.startsWith('data:image/') && <img src={preview.preview_image} style={{
      maxWidth: '100%'
    }} alt={`Preview of ${preview.name}`} />}{preview?.preview_content && <p style={{
      whiteSpace: 'pre-wrap'
    }}>{preview.preview_content}</p>}<p className="journey-note">Preview may show only the first page or a text excerpt. A preview does not confirm the model match.</p></section>;
}
