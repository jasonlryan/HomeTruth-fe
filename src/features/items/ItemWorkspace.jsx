import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { attachItemEvidence, askItemAI, createHomeItem, detachItemEvidence, findItemManual, getHomeItem, getHomeItems, getUserDocuments, identifyHomeItem, updateHomeItem, uploadDocument, getItemAnswers, saveItemAnswer, deleteItemAnswer, getItemEvidenceFile } from '../../api/api';
import './Items.css';
import CodeScanner from './CodeScanner';
import IdentificationCandidates from './IdentificationCandidates';
import RecordPreview from './RecordPreview';
import { itemDraftKey, readItemDraft, saveItemDraft, clearItemDraft } from './itemDraft';
const message = e => e.response?.data?.message || 'This could not be completed. Your saved record has not been changed.';
const blank = () => ({
  name: '',
  category: 'appliance',
  room: '',
  identity: {
    brand: '',
    model: '',
    serial: '',
    source: '',
    method: 'manual'
  },
  purchase: {},
  warranty: {},
  values: {},
  history: [],
  notes: ''
});
const today = () => new Date().toISOString().slice(0, 10);
const external = value => {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && !u.username && !u.password ? u.href : null;
  } catch {
    return null;
  }
};
function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  maxLength = 180
}) {
  return <label className="item-field">{label}<input type={type} step={type === 'number' ? 'any' : undefined} min={type === 'number' ? 0 : undefined} value={value ?? ''} onChange={e => onChange(e.target.value)} required={required} maxLength={maxLength} /></label>;
}
function Money({
  title,
  value,
  onChange
}) {
  const change = (key, v) => onChange({
    amount: 0,
    currency: 'GBP',
    date: today(),
    source: 'User estimate',
    ...value,
    [key]: v
  });
  return <fieldset className="item-money"><legend>{title}</legend><p className="journey-note">Leave unknown amounts blank. Supply a date and the receipt, quote or method behind each amount.</p><Field label={`${title} amount`} type="number" value={value?.amount} onChange={v => onChange(v === '' ? null : {
      currency: 'GBP',
      date: today(),
      source: 'User supplied',
      ...value,
      amount: Number(v)
    })} /><Field label={`${title} currency`} value={value?.currency} onChange={v => change('currency', v.toUpperCase())} maxLength={3} /><Field label={`${title} date`} type="date" value={value?.date} onChange={v => change('date', v)} /><Field label={`${title} source or method`} value={value?.source} onChange={v => change('source', v)} maxLength={1000} /></fieldset>;
}
export default function ItemWorkspace({
  homeId,
  homeLabel,
  canManage = false,
  askGeneral,
  rememberItem,
  owner = 'signed-in'
}) {
  const [params, setParams] = useSearchParams();
  const itemId = params.get('home') === String(homeId) && /^[1-9]\d*$/.test(params.get('item') || '') ? Number(params.get('item')) : null;
  const [items, setItems] = useState([]),
    [item, setItem] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [reload, setReload] = useState(0);
  const [mode, setMode] = useState('list'),
    [method, setMethod] = useState('photo'),
    [text, setText] = useState(''),
    [photo, setPhoto] = useState(null),
    [proposals, setProposals] = useState(null),
    [draft, setDraft] = useState(blank),
    [editSection, setEditSection] = useState('identity');
  const [documents, setDocuments] = useState([]),
    [docId, setDocId] = useState(''),
    [role, setRole] = useState('manual'),
    [match, setMatch] = useState('unreviewed');
  const [question, setQuestion] = useState(''),
    [selectedEvidence, setSelectedEvidence] = useState([]),
    [answer, setAnswer] = useState(null),
    [manuals, setManuals] = useState(null);
  const [intakeDocumentId, setIntakeDocumentId] = useState(null),
    [keepIntake, setKeepIntake] = useState(true),
    [intakeRole, setIntakeRole] = useState('other'),
    [notice, setNotice] = useState('');
  const [savedAnswers, setSavedAnswers] = useState([]),
    [answersError, setAnswersError] = useState(''),
    [previewId, setPreviewId] = useState(null),
    [resume, setResume] = useState(null);
  const draftKey = itemDraftKey(owner, homeId, itemId);
  const requestKey = useRef(null),
    generation = useRef(0),
    draftScope = useRef(null);
  useEffect(() => {
    setResume(readItemDraft(draftKey));
    setPreviewId(null);
    setSavedAnswers([]);
  }, [draftKey, homeId, itemId]);
  useEffect(() => {
    if (draftScope.current === draftKey && ['identify', 'confirm', 'edit'].includes(mode)) saveItemDraft(draftKey, {
      mode,
      method,
      text,
      draft,
      editSection,
      version: item?.version,
      intakeDocumentId,
      keepIntake,
      intakeRole,
      docId,
      requestKey: requestKey.current
    });
  }, [draftKey, mode, method, text, draft, editSection, item?.version, intakeDocumentId, keepIntake, intakeRole, docId]);
  useEffect(() => {
    let active = true;
    draftScope.current = null;
    setLoading(true);
    setError('');
    setItem(null);
    setItems([]);
    setAnswer(null);
    setSelectedEvidence([]);
    setManuals(null);
    setMode('list');
    const load = itemId ? getHomeItem(homeId, itemId) : getHomeItems(homeId);
    load.then(result => {
      if (active) itemId ? setItem(result) : setItems(result);
    }).catch(e => {
      if (active) setError(message(e));
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [homeId, itemId, reload]);
  useEffect(() => {
    let active = true;
    setAnswer(null);
    setSelectedEvidence([]);
    if (item?.evidence) getItemAnswers(homeId, itemId).then(rows => {
      if (active) {
        setSavedAnswers(rows);
        setAnswersError('');
      }
    }).catch(() => {
      if (active) setAnswersError('Your saved answers could not be loaded. Reload this item to try again.');
    });
    return () => {
      active = false;
    };
  }, [homeId, itemId, item?.evidence]);
  useEffect(() => {
    setBusy(false);
    return () => {
      generation.current += 1;
    };
  }, [homeId, itemId]);
  const run = async action => {
    const current = generation.current;
    setBusy(true);
    setError('');
    try {
      await action(() => current === generation.current);
    } catch (e) {
      if (current === generation.current) setError(message(e));
    } finally {
      if (current === generation.current) setBusy(false);
    }
  };
  const loadDocuments = () => run(async current => {
    const result = await getUserDocuments({
      limit: 100
    });
    if (current()) setDocuments(result.data?.documents || []);
  });
  const start = () => {
    draftScope.current = draftKey;
    setNotice('');
    setIntakeDocumentId(null);
    setKeepIntake(true);
    setIntakeRole('other');
    setMode('identify');
    setMethod('photo');
    setText('');
    setPhoto(null);
    setProposals(null);
    setError('');
    requestKey.current = null;
  };
  const choose = c => {
    setIntakeDocumentId(c.method === 'document' ? Number(docId) : null);
    setKeepIntake(true);
    draftScope.current = draftKey;
    setDraft({
      ...blank(),
      purchase: c.purchase || {},
      warranty: c.warranty || {},
      name: c.name,
      identity: {
        ...blank().identity,
        brand: c.brand || '',
        model: c.model || '',
        source: [c.quote, external(c.sourceUrl)].filter(Boolean).join(' · '),
        method: c.method || method
      }
    });
    requestKey.current = null;
    setMode('confirm');
  };
  const identify = e => {
    e.preventDefault();
    run(async current => {
      const form = new FormData();
      form.append('method', method);
      if (method === 'photo' && photo) form.append('photo', photo);else if (method === 'document') form.append('documentId', docId);else form.append('text', text);
      try {
        const result = await identifyHomeItem(homeId, form);
        if (current()) setProposals(result);
      } catch (e) {
        if (method !== 'online' || ![502, 503].includes(e.response?.status)) throw e;
        if (current()) setProposals({
          candidates: [],
          notes: 'Use the model search below, or try a label photo or selected receipt to identify the item here.',
          sources: [{
            title: 'Search manufacturer and model information',
            url: `https://www.google.com/search?q=${encodeURIComponent(text + ' manufacturer model')}`
          }]
        });
      }
    });
  };
  const save = e => {
    e.preventDefault();
    run(async current => {
      requestKey.current ||= crypto.randomUUID();
      const result = item ? await updateHomeItem(homeId, item.id, {
        version: item.version,
        record: draft
      }) : await createHomeItem(homeId, {
        requestKey: requestKey.current,
        record: draft
      });
      if (current() && !item && intakeDocumentId && keepIntake) {
        try {
          await attachItemEvidence(homeId, result.id, {
            documentId: intakeDocumentId,
            role: intakeRole,
            matchStatus: 'unreviewed'
          });
        } catch (e) {
          if (current()) setNotice(`The item is saved. The selected document was not attached: ${message(e)}`);
        }
      }
      if (current()) {
        clearItemDraft(draftKey);
        setResume(null);
        setParams({
          item: String(result.id),
          home: String(homeId)
        });
        setMode('list');
        setReload(n => n + 1);
      }
    });
  };
  const edit = section => {
    draftScope.current = draftKey;
    setDraft(JSON.parse(JSON.stringify(item.record)));
    setEditSection(section);
    setMode('edit');
  };
  const set = (key, value) => setDraft(d => ({
    ...d,
    [key]: value
  }));
  const setNested = (group, key, value) => setDraft(d => ({
    ...d,
    [group]: {
      ...d[group],
      [key]: value
    }
  }));
  const attach = e => {
    e.preventDefault();
    run(async current => {
      const result = await attachItemEvidence(homeId, item.id, {
        documentId: Number(docId),
        role,
        matchStatus: match
      });
      if (current()) {
        setItem(result);
        setMode('list');
      }
    });
  };
  const upload = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    run(async current => {
      const form = new FormData();
      form.append('documents', file);
      const result = await uploadDocument(form);
      if (!result.success) throw new Error('Upload failed');
      if (current()) {
        const list = await getUserDocuments({
          limit: 100
        });
        if (current()) setDocuments(list.data?.documents || []);
      }
    });
  };
  const record = item?.record;
  const identityFields = <><Field label="Name for this item" value={draft.name} onChange={v => set('name', v)} required /><label className="item-field">Type<select value={draft.category} onChange={e => set('category', e.target.value)}><option value="appliance">Appliance</option><option value="device">Device</option><option value="system">System</option><option value="other">Other equipment</option></select></label><Field label="Room or location" value={draft.room} onChange={v => set('room', v)} maxLength={120} /><Field label="Brand" value={draft.identity.brand} onChange={v => setNested('identity', 'brand', v)} maxLength={120} /><Field label="Full model or variant" value={draft.identity.model} onChange={v => setNested('identity', 'model', v)} /><Field label="Serial number (optional)" value={draft.identity.serial} onChange={v => setNested('identity', 'serial', v)} /><Field label="Identity source or correction notes" value={draft.identity.source} onChange={v => setNested('identity', 'source', v)} maxLength={2000} /><p className="journey-note">A missing model is fine. You can keep a useful record and identify it later. Confirming these details records your choice; it does not verify ownership.</p></>;
  if (!homeId) return <><h1>Appliances, devices and systems.</h1><p>Keep the manual, warranty, purchase details and history for each item together.</p><p>Select or add a home above to keep its equipment in the right place.</p><button className="journey-link" onClick={() => askGeneral('How can I find the right manual for my appliance?')}>Ask about my appliance</button></>;
  return <div className="items-workspace">
    <p className="journey-note">Equipment for {homeLabel}</p>
    <h1>{item ? record.name : 'Appliances, devices and systems.'}</h1>
    <p>{item ? 'Your instructions, evidence and history, in one place.' : 'Find the information you need, understand it with AskAI and keep it with the right item.'}</p>
    {notice && <p role="status" className="journey-status">{notice}</p>}
    {error && <div role="alert" className="journey-status"><p>{error}</p>{mode === 'list' && <button className="journey-link" onClick={() => setReload(n => n + 1)}>Reload records</button>}</div>}
    {loading && <p role="status">Loading your equipment…</p>}
    {resume && !loading && mode === 'list' && <div className="journey-status"><p>You have unfinished item details in this tab.</p><div className="journey-actions"><button className="journey-link" onClick={() => {
          if (resume.mode === 'edit' && resume.version !== item?.version) {
            setError('The saved record changed. Start a new edit so newer details are preserved.');
            return;
          }
          draftScope.current = draftKey;
          setMode(resume.mode);
          setMethod(resume.method);
          setText(resume.text || '');
          setDocId(resume.docId || '');
          setIntakeDocumentId(resume.intakeDocumentId || null);
          setKeepIntake(resume.keepIntake !== false);
          setIntakeRole(resume.intakeRole || 'other');
          setDraft(resume.draft || blank());
          setEditSection(resume.editSection || 'identity');
          requestKey.current = resume.requestKey;
          setResume(null);
        }}>Resume item setup</button><button className="journey-link" onClick={() => {
          clearItemDraft(draftKey);
          setResume(null);
        }}>Discard unfinished details</button></div><p className="journey-note">Photos must be selected again after leaving the page. Unfinished details are kept in this tab for up to 24 hours.</p></div>}
    {!canManage && !loading && <p className="journey-note">You can view this home’s equipment. A person with manage permission can change its records.</p>}
    <fieldset disabled={busy || loading} className="item-controls">
    {!loading && !itemId && mode === 'list' && <>
      {!error && !items.length && <div className="journey-panel"><h2>Your first item is a useful place to start.</h2><p>Bring a label photo, selected receipt or warranty. HomeTruth will suggest the item for you to confirm.</p></div>}
      <div className="journey-actions">{canManage && <button className="journey-button" onClick={start}>Add an item</button>}<button className="journey-link" onClick={() => askGeneral('Help me understand the information I have for an appliance or device.')}>Ask about my equipment</button></div>
      <div className="journey-grid">{items.map(row => <article className="journey-panel" key={row.id}><h2>{row.record.name}</h2><p>{[row.record.identity.brand, row.record.identity.model, row.record.room].filter(Boolean).join(' · ') || 'Identity details can be added later.'}</p><button className="journey-link" onClick={() => setParams({
              item: String(row.id),
              home: String(homeId)
            })}>Open item →</button></article>)}</div>
    </>}
    {mode === 'identify' && <><h2>Let’s find your item.</h2><p>Choose a source. You’ll review the suggested match before anything is saved.</p>
      <div className="journey-actions" role="group" aria-label="Identify from">{[['photo', 'Label photo'], ['code', 'QR or barcode'], ['text', 'Receipt, email or warranty text'], ['document', 'A saved document'], ['online', 'Find online']].map(([value, label]) => <button key={value} className={`journey-button ${method === value ? '' : 'journey-secondary'}`} aria-pressed={method === value} onClick={() => {
            setMethod(value);
            setProposals(null);
            if (value === 'document') loadDocuments();
          }}>{label}</button>)}</div>
      {method === 'code' && <CodeScanner onCode={value => {
          setText(value);
          setProposals(null);
        }} />}
      <form onSubmit={identify} className="journey-panel item-intake">
        {method === 'photo' ? <><label className="item-field">Photograph the rating label<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" required onChange={e => setPhoto(e.target.files?.[0] || null)} /></label><p className="journey-note">Use the printed label with brand and model, rather than the appliance’s appearance. Maximum 5 MB. This selected image is sent to HomeTruth’s AI service for analysis.</p></> : method === 'document' ? <><label className="item-field">Choose your document<select value={docId} required onChange={e => setDocId(e.target.value)}><option value="">Choose a document</option>{documents.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label><p className="journey-note">Only this selected document’s readable text is analysed. No inbox access is requested.</p></> : <><label className="item-field">{method === 'code' ? 'Code or QR content' : method === 'online' ? 'Product link or description' : 'Paste the relevant receipt, email or warranty text'}<textarea required maxLength={method === 'online' ? 300 : 24000} value={text} onChange={e => setText(e.target.value)} /></label><p className="journey-note">{method === 'code' ? 'Review the decoded content or paste a code. A registration URL may not identify an exact model.' : method === 'online' ? 'Use a product description or public product link. Leave out personal details and serial numbers. Results need your review.' : 'Select just the relevant content. HomeTruth analyses this text; it does not read your inbox.'}</p></>}
        <button className="journey-button" type="submit">Find my item</button>
      </form>
      {proposals && <div aria-live="polite"><h2>{proposals.candidates?.length ? 'Review the suggested match.' : 'We haven’t established a match yet.'}</h2><p>{proposals.notes}</p><IdentificationCandidates candidates={proposals.candidates || []} items={items} onChoose={choose} onExisting={id => {
            clearItemDraft(draftKey);
            setParams({
              item: String(id),
              home: String(homeId)
            });
          }} />{proposals.sources?.map((s, i) => external(s.url) && <p key={i}><a href={external(s.url)} target="_blank" rel="noreferrer">{s.title} ↗</a></p>)}<p>Try another source above, or keep a draft while you find more information.</p></div>}
      <div className="journey-actions"><button className="journey-link" onClick={() => choose({
            name: '',
            method: 'manual'
          })}>I can’t identify it — enter what I know</button><button className="journey-link" onClick={() => setMode('list')}>Return to equipment</button></div>
    </>}
    {(mode === 'confirm' || mode === 'edit') && <form onSubmit={save} className="journey-panel item-intake"><h2>{mode === 'confirm' ? 'Confirm what you know.' : `Update ${editSection === 'identity' ? 'item details' : editSection}.`}</h2>
      {(mode === 'confirm' || editSection === 'identity') && identityFields}
      {mode === 'confirm' && <div className="journey-status"><h2>Details found in your evidence</h2><p>Review and correct the suggestions before saving. Missing terms or dates remain unknown.</p><Field label="Suggested purchase date" type="date" value={draft.purchase?.date} onChange={v => setNested('purchase', 'date', v)} /><Field label="Suggested retailer" value={draft.purchase?.retailer} onChange={v => setNested('purchase', 'retailer', v)} />{draft.purchase?.price && <Money title="Suggested purchase price" value={draft.purchase.price} onChange={v => setNested('purchase', 'price', v)} />}{[['provider', 'Suggested warranty provider'], ['startDate', 'Suggested warranty start'], ['endDate', 'Suggested warranty end'], ['terms', 'Suggested warranty terms']].map(([key, label]) => <Field key={key} label={label} type={key.endsWith('Date') ? 'date' : 'text'} maxLength={key === 'terms' ? 4000 : 180} value={draft.warranty?.[key]} onChange={v => setNested('warranty', key, v)} />)}</div>}
      {mode === 'confirm' && intakeDocumentId && <div className="journey-status"><label className="item-check"><input type="checkbox" checked={keepIntake} onChange={e => setKeepIntake(e.target.checked)} />Keep the selected document with this item</label>{keepIntake && <label className="item-field">Selected document type<select value={intakeRole} onChange={e => setIntakeRole(e.target.value)}>{['manual', 'receipt', 'warranty', 'installation', 'service', 'other'].map(r => <option key={r}>{r}</option>)}</select></label>}<p className="journey-note">The association is saved as unreviewed. You can confirm or correct the match on the item page.</p></div>}
      {mode === 'edit' && editSection === 'purchase' && <><Field label="Purchase date" type="date" value={draft.purchase?.date} onChange={v => setNested('purchase', 'date', v)} /><Field label="Retailer or supplier" value={draft.purchase?.retailer} onChange={v => setNested('purchase', 'retailer', v)} /><Money title="Purchase price" value={draft.purchase?.price} onChange={v => setNested('purchase', 'price', v)} /></>}
      {mode === 'edit' && editSection === 'warranty' && <><p>Record the terms you have. A receipt alone does not establish cover.</p>{[['provider', 'Warranty provider', 180], ['claimRoute', 'How to enquire or claim', 1000], ['terms', 'Terms or limits', 4000], ['source', 'Source for these terms', 2000]].map(([key, label, max]) => <Field key={key} label={label} maxLength={max} value={draft.warranty?.[key]} onChange={v => setNested('warranty', key, v)} />)}{[['startDate', 'Warranty start date'], ['endDate', 'Warranty end date']].map(([key, label]) => <Field key={key} label={label} type="date" value={draft.warranty?.[key]} onChange={v => setNested('warranty', key, v)} />)}</>}
      {mode === 'edit' && editSection === 'values' && <><Money title="Estimated current value" value={draft.values?.current} onChange={v => setNested('values', 'current', v)} /><Money title="Replacement cost estimate" value={draft.values?.replacement} onChange={v => setNested('values', 'replacement', v)} /><p className="journey-note">These are your supplied estimates, with their sources. No automatic valuation is calculated.</p></>}
      {mode === 'edit' && editSection === 'history' && <>{(draft.history || []).map((event, i) => <fieldset className="journey-panel item-intake" key={i}><legend>Event {i + 1}</legend><Field label={`Event ${i + 1} date`} type="date" value={event.date} required onChange={v => set('history', draft.history.map((e, n) => n === i ? {
              ...e,
              date: v
            } : e))} /><label className="item-field">Event type<select value={event.type} onChange={e => set('history', draft.history.map((v, n) => n === i ? {
                ...v,
                type: e.target.value
              } : v))}>{['installation', 'service', 'repair', 'care'].map(t => <option key={t}>{t}</option>)}</select></label>{[['description', 'What happened', 2000], ['provider', 'Provider', 180]].map(([key, label, max]) => <Field key={key} label={`Event ${i + 1} ${label}`} maxLength={max} value={event[key]} required={key === 'description'} onChange={v => set('history', draft.history.map((e, n) => n === i ? {
              ...e,
              [key]: v
            } : e))} />)}<Money title={`Event ${i + 1} cost`} value={event.cost} onChange={v => set('history', draft.history.map((e, n) => n === i ? {
              ...e,
              cost: v
            } : e))} /><Field label={`Event ${i + 1} next date (only if confirmed)`} type="date" value={event.nextDate} onChange={v => set('history', draft.history.map((e, n) => n === i ? {
              ...e,
              nextDate: v
            } : e))} /><button type="button" className="journey-link" onClick={() => set('history', draft.history.filter((_, n) => n !== i))}>Remove event {i + 1}</button></fieldset>)}<button type="button" className="journey-link" onClick={() => set('history', [...(draft.history || []), {
            date: today(),
            type: 'service',
            description: ''
          }])}>Add a service or repair event</button></>}
      <div className="journey-actions"><button className="journey-button" type="submit">{mode === 'confirm' ? 'Confirm and save item' : 'Save changes'}</button><button type="button" className="journey-link" onClick={() => setMode(item ? 'list' : 'identify')}>Cancel</button></div>
    </form>}
    {item && mode === 'list' && <>
      <div className="journey-actions"><button className="journey-link" onClick={() => setParams({})}>← All equipment</button>{canManage && <button className="journey-link" onClick={() => edit('identity')}>Edit item details</button>}</div>
      <div className="journey-panel item-intake"><h2>Item details</h2><p>{[record.identity.brand, record.identity.model, record.room].filter(Boolean).join(' · ') || 'Exact identity not recorded yet'}</p>{record.identity.serial && <p>Serial number: {record.identity.serial}</p>}<p className="journey-note">Identity source: {record.identity.source || 'User supplied; no source recorded'}. You confirmed the saved details.</p></div>
      <div className="journey-grid">{[['purchase', 'Purchase', record.purchase?.retailer || 'No retailer recorded'], ['warranty', 'Warranty', record.warranty?.endDate ? `Recorded end date: ${record.warranty.endDate}${record.warranty.endDate < today() ? ' — date has passed' : ''}` : 'Terms and expiry unknown'], ['values', 'Costs and value', 'Keep purchase price and later estimates separate.'], ['history', 'Service and repair history', `${record.history?.length || 0} recorded events`]].map(([key, title, description]) => <article className="journey-panel" key={key}><h2>{title}</h2><p>{description}</p>{key === 'purchase' && record.purchase?.date && <p>Purchased: {record.purchase.date}</p>}{key === 'warranty' && <>{record.warranty?.provider && <p>{record.warranty.provider}</p>}{record.warranty?.terms && <p>{record.warranty.terms}</p>}{record.warranty?.claimRoute && <p>Enquiries: {record.warranty.claimRoute}</p>}</>}{(key === 'purchase' ? [['Purchase price', record.purchase?.price]] : key === 'values' ? [['Estimated current value', record.values?.current], ['Replacement cost estimate', record.values?.replacement]] : []).map(([label, v]) => <p key={label}>{label}: {v ? `${v.currency} ${v.amount} · ${v.date} · ${v.source}` : 'Unknown'}</p>)}{key === 'history' && [...(record.history || [])].sort((a, b) => b.date.localeCompare(a.date)).map((e, i) => <p key={i}>{e.date} · {e.type}: {e.description}{e.provider ? ` · ${e.provider}` : ''}{e.cost ? ` · ${e.cost.currency} ${e.cost.amount}` : ''}{e.nextDate ? ` · Next confirmed date: ${e.nextDate}` : ''}</p>)}{canManage && <button className="journey-link" onClick={() => edit(key)}>Update {title.toLowerCase()}</button>}</article>)}</div>
      <section className="journey-panel"><h2>Manuals and related records</h2><p>Attach the evidence you have. Check the model before treating a manual as the right one.</p>{item.evidence?.map(e => <article className="journey-task" key={e.id}><p>{e.name} · {e.role} · {e.matchStatus.replaceAll('_', ' ')} · {e.hasText ? 'Readable text available' : 'No readable text yet'}</p><button type="button" className="journey-link" onClick={() => setPreviewId(e.documentId)}>Preview record</button>{canManage && <button type="button" className="journey-link item-spaced" onClick={() => {
              setDocId(String(e.documentId));
              setRole(e.role);
              setMatch(e.matchStatus);
              setMode('evidence');
              loadDocuments();
            }}>Review association</button>}<button type="button" className="journey-link item-spaced" onClick={() => run(async current => {
              const file = await getItemEvidenceFile(homeId, item.id, e.id);
              if (!current()) return;
              const url = URL.createObjectURL(file),
                link = document.createElement('a');
              link.href = url;
              link.download = e.name;
              link.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            })}>Download original</button><Link className="item-spaced" to="/documents" onClick={rememberItem}>Open document library</Link>{canManage && <button className="journey-link item-spaced" onClick={() => run(async current => {
              const result = await detachItemEvidence(homeId, item.id, e.id);
              if (current()) setItem(result);
            })}>Remove association</button>}</article>)}<div className="journey-actions"><button className="journey-button" onClick={() => run(async current => {
              const result = await findItemManual(homeId, item.id);
              if (current()) setManuals(result);
            })}>Find my manual</button>{canManage && <button className="journey-link" onClick={() => {
              setMode('evidence');
              setDocId('');
              loadDocuments();
            }}>I have a manual or related record</button>}</div>{manuals && <div aria-live="polite"><p>{manuals.notice}</p><p>Model to match: {manuals.brand} {manuals.model}</p><button type="button" className="journey-link" onClick={()=>run(async()=>{if(!navigator.clipboard)throw new Error('Select the model number above to copy it.');await navigator.clipboard.writeText(manuals.model);setNotice('Model number copied. Paste it into the manufacturer finder.');})}>Copy model number</button>{external(manuals.officialFinder) && <p><a href={external(manuals.officialFinder)} target="_blank" rel="noreferrer">Open the official manufacturer finder ↗</a></p>}{external(manuals.manualLibrarySearch) && <p><a href={external(manuals.manualLibrarySearch)} target="_blank" rel="noreferrer">Search ManualsLib for this model ↗</a></p>}{external(manuals.searchLink) && <p><a href={external(manuals.searchLink)} target="_blank" rel="noreferrer">Search for this exact model ↗</a></p>}{!manuals.sources?.length && <p>No candidates returned. Try the manufacturer’s manual finder or attach your own manual.</p>}{manuals.sources?.map((s, i) => external(s.url) && <p key={i}><a href={external(s.url)} target="_blank" rel="noreferrer">{s.title} ↗</a></p>)}</div>}</section>
      {previewId && <RecordPreview documentId={previewId} onClose={() => setPreviewId(null)} />}
      <section className="journey-panel item-intake"><h2>AskAI about this item</h2><p>Choose the confirmed records you want included. An online manual link has not been read or attached.</p><form onSubmit={e => {
            e.preventDefault();
            run(async current => {
              const result = await askItemAI(homeId, item.id, {
                question,
                evidenceIds: selectedEvidence
              });
              if (current()) setAnswer(result);
            });
          }}>{item.evidence?.filter(e => e.matchStatus === 'user_confirmed' && e.hasText).map(e => <label className="item-check" key={e.id}><input type="checkbox" checked={selectedEvidence.includes(e.id)} onChange={v => {
                setAnswer(null);
                setSelectedEvidence(v.target.checked ? [...selectedEvidence, e.id] : selectedEvidence.filter(id => id !== e.id));
              }} />{e.name}</label>)}<label className="item-field">Your question<textarea required maxLength={4000} value={question} onChange={e => {
                setQuestion(e.target.value);
                setAnswer(null);
              }} /></label><div className="journey-actions"><button className="journey-button" disabled={!selectedEvidence.length} type="submit">Send question</button><button type="button" className="journey-link" onClick={() => askGeneral(`I have a question about my ${record.name}.`)}>Ask a general question</button></div></form>{answer && <div aria-live="polite">{!answer.statements?.length && <p>No supported answer was found in the selected evidence.</p>}{answer.statements?.map((s, i) => <article key={i}><p>{s.answer}</p><blockquote>{s.quote}</blockquote><p className="journey-note">Source: {item.evidence.find(e => e.id === s.sourceId)?.name || 'Selected document'}</p></article>)}<p>{answer.limitations}</p><p className="journey-note">Only the selected readable excerpts were considered. {answer.saved ? 'This answer is saved in your private item answers.' : 'Choose Save answer to keep it with this item.'}</p>{answer.saveToken && !answer.saved && <button type="button" className="journey-link" onClick={() => run(async current => {
              await saveItemAnswer(homeId, item.id, answer.saveToken);
              const rows = await getItemAnswers(homeId, item.id);
              if (current()) {
                setSavedAnswers(rows);
                setAnswer({
                  ...answer,
                  saved: true
                });
              }
            })}>Save answer</button>}</div>}</section>
      <section className="journey-panel item-intake"><h2>Your saved answers</h2><p>Private to your account. Sources are checked again when you return.</p>{answersError && <p role="alert">{answersError}</p>}{!answersError && !savedAnswers.length && <p>No saved answers for this item yet.</p>}{savedAnswers.map(saved => <article className="journey-task" key={saved.id}><h2>{saved.question}</h2>{saved.sourceUnavailable ? <p>The supporting evidence changed or is no longer available. Ask again using the current records.</p> : saved.answer?.statements.map((s, i) => <div key={i}><p>{s.answer}</p><blockquote>{s.quote}</blockquote><p className="journey-note">Source: {saved.sources.find(source => source.id === s.sourceId)?.name || 'Selected evidence'}</p></div>)}<button className="journey-link" onClick={() => run(async current => {
              await deleteItemAnswer(homeId, item.id, saved.id);
              if (current()) setSavedAnswers(rows => rows.filter(r => r.id !== saved.id));
            })}>Remove saved answer</button></article>)}</section>
      {canManage && <details className="item-intake"><summary>Archive this item</summary><p>The record will leave this home’s active inventory. Original documents are kept.</p><button className="journey-link" onClick={() => run(async current => {
            await updateHomeItem(homeId, item.id, {
              version: item.version,
              archived: true
            });
            if (current()) {
              setParams({});
              setReload(n => n + 1);
            }
          })}>Confirm archive</button></details>}
    </>}
    {item && mode === 'evidence' && <form className="journey-panel item-intake" onSubmit={attach}><h2>Add a record to {record.name}</h2><label className="item-field">Upload a manual, receipt or related record<input type="file" accept=".pdf,.docx,.jpg,.jpeg,.png" onChange={upload} /></label><p className="journey-note">Files enter your private document library. Choose the uploaded file below once it appears; processing may take time.</p><label className="item-field">Your document<select required value={docId} onChange={e => setDocId(e.target.value)}><option value="">Choose a document</option>{documents.map(d => <option key={d.id} value={d.id}>{d.name} ({d.status})</option>)}</select></label><label className="item-field">Record type<select value={role} onChange={e => setRole(e.target.value)}>{['manual', 'receipt', 'warranty', 'installation', 'service', 'other'].map(v => <option key={v}>{v}</option>)}</select></label><label className="item-field">Does it match this item?<select value={match} onChange={e => setMatch(e.target.value)}><option value="unreviewed">I haven’t checked yet</option><option value="user_confirmed">I have checked — it matches</option><option value="different_model">Different model — keep as reference</option></select></label><div className="journey-actions"><button className="journey-button" type="submit">Attach to this item</button><button type="button" className="journey-link" onClick={() => setMode('list')}>Return to item</button></div></form>}
    </fieldset>{busy && <p role="status">Working on your request…</p>}
  </div>;
}
