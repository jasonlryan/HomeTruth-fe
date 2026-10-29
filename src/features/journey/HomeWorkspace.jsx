import { useEffect, useState } from 'react';
import { Link, NavLink, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getPropertyRecords, getPropertyTasks } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { HOME_DESTINATIONS, journeyOwner, readJourney, writeJourney } from './context';
import './Journey.css';

const CAPABILITIES = {
  items: { title: 'Appliances, devices and systems', lead: 'One record for each physical item, with its identity, instructions, warranty and history.', status: 'Item records and identification are being built.', body: 'The planned setup finds the item from a QR code, label photo, selected receipt or warranty, or online information. You confirm the match; typing a model is a last resort. Today you can keep the documents you have and ask about a selected document in the library.', question: 'How can I find the right manual and warranty information for an appliance?', action: 'Keep your documents', to: '/documents' },
  'connected-devices': { title: 'Connected devices', lead: 'Equipment that can supply information about your home.', status: 'No device integration is available here yet.', body: 'A connected thermostat, leak sensor or appliance will use the same physical item record as the main inventory. Its supported readings and update time will appear with that record. No devices have been discovered or authorised through this page.', question: 'What information would be useful to keep about my connected devices?', action: 'View items and systems', to: '/my-home/items' },
  value: { title: 'Costs and value', lead: 'Keep what you paid, estimated current value and replacement cost distinct.', status: 'Item cost and value records are being built.', body: 'Keep receipts and dated quotes in Documents for now. They can support different amounts; a purchase price is not a current valuation or evidence of insurance cover. No automatic values or savings are calculated here.', question: 'What is the difference between purchase price, current value and replacement cost?', action: 'Keep receipts and quotes', to: '/documents' },
  performance: { title: 'Home performance', lead: 'Understand your home’s energy use, running costs and changes that may need attention.', status: 'No live performance analysis is available here yet.', body: 'You can bring a bill or supplied record to the document library and ask about its contents. Device feeds and period comparisons require their own supported sources. This page does not infer faults, monitor the home or promise savings.', question: 'What should I look for when reviewing my home energy bills?', action: 'Review your bills and records', to: '/documents' },
  connections: { title: 'Connections', lead: 'Manage authorised links that supply information.', status: 'No external source connection is available here yet.', body: 'A connection links a permitted provider account or feed to the right home and items. It is separate from the physical equipment and from optional agent setup. Uploading a document does not give access to your mailbox or provider accounts.', question: 'What is the difference between a home record and a connected account?', action: 'Use your documents', to: '/documents' },
  agents: { title: 'Agents', lead: 'Optional task support using only the information you authorise.', status: 'Own-agent and HomeTruth-agent setup is not available here yet.', body: 'These will be optional choices with their own supported tasks and permissions. AskAI, your records and home-management features work independently. There is no permission grant or background monitoring on this page.', question: 'How can AskAI help me understand my home records?', action: 'Open AskAI', to: '/ask-ai' },
};
const labelFor = record => record?.currentAddress?.addressLine1 || `Home ${record?.property?.id}`;

export default function HomeWorkspace({ intent: routeIntent = 'manage', settings = null }) {
  const { user } = useAuth();
  const owner = journeyOwner(user);
  const intent = settings ? readJourney(owner)?.intent || 'manage' : routeIntent;
  const { section: routeSection } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const section = settings || routeSection || 'overview';
  const [records, setRecords] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState('');
  const selected = records.find(r => r.property?.id === selectedId) || null;

  useEffect(() => {
    let current = true;
    setRecords([]); setSelectedId(null); setError(''); setLoading(true);
    const draft = readJourney(owner);
    getPropertyRecords().then(result => {
      if (!current) return;
      const list = Array.isArray(result) ? result : [];
      setRecords(list);
      const previous = list.find(r => r.property?.id === draft?.propertyId);
      const id = previous?.property.id || (intent === 'manage' ? list[0]?.property?.id : null) || null;
      setSelectedId(id);
      writeJourney(owner, { intent, propertyId: id, returnTo: location.pathname });
    }).catch(() => { if (current) setError('Your home records could not be loaded. Retry or ask a general question.'); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
    // Fetch again for account changes, not navigation between the same home's tasks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, intent, reload]);

  useEffect(() => {
    let current = true;
    setTasks([]); setTasksError(''); setTasksLoading(false);
    if (section !== 'maintenance' || !selectedId || !selected) return undefined;
    setTasksLoading(true);
    getPropertyTasks(selectedId).then(result => { if (current) setTasks(Array.isArray(result) ? result : []); })
      .catch(() => { if (current) setTasksError('The recorded actions could not be loaded.'); })
      .finally(() => { if (current) setTasksLoading(false); });
    return () => { current = false; };
  }, [section, selectedId, selected]);

  const chooseHome = event => {
    const raw = Number(event.target.value);
    const id = records.some(r => r.property?.id === raw) ? raw : null;
    setSelectedId(id);
    writeJourney(owner, { intent, propertyId: id, question: '', returnTo: location.pathname });
  };
  const ask = question => {
    writeJourney(owner, { intent, propertyId: selected?.property.id || null, question, returnTo: location.pathname });
    navigate('/ask-ai', { state: selected ? { propertyId: selected.property.id, propertyLabel: labelFor(selected) } : {} });
  };
  const openDetails = () => {
    writeJourney(owner, { intent, propertyId: selected?.property.id || null, returnTo: location.pathname });
    navigate('/property-profile', { state: selected ? { propertyId: selected.property.id } : {} });
  };
  if (!['overview', 'details', 'maintenance', ...Object.keys(CAPABILITIES)].includes(section)) return <Navigate to="/my-home" replace />;
  const capability = CAPABILITIES[section];
  const heading = intent === 'buy' ? 'Your buying workspace.' : intent === 'sell' ? 'Your selling workspace.' : 'Your home, easier to keep track of.';
  return <section className="journey">
    <div className="journey-homebar"><Link to="/start">Change my goal</Link><label>Home context <select aria-label="Selected home" value={selectedId || ''} onChange={chooseHome} disabled={loading}><option value="">No home selected</option>{records.map(record => <option key={record.property.id} value={record.property.id}>{labelFor(record)}</option>)}</select></label></div>
    <nav className="journey-tabs" aria-label="Home management"><NavLink to="/my-home" end>Home overview</NavLink>{HOME_DESTINATIONS.map(d => <NavLink key={d.path} to={d.path} onClick={d.path === "/ask-ai" ? e => { e.preventDefault(); ask(''); } : undefined}>{d.label}</NavLink>)}<NavLink to="/settings/connections">Connections</NavLink><NavLink to="/settings/agents">Agents</NavLink></nav>
    {loading && <p role="status">Loading your home records…</p>}
    {error && <div role="alert" className="journey-status"><p>{error}</p><button className="journey-link" onClick={() => setReload(n => n + 1)}>Retry</button></div>}
    {section === 'overview' && <><h1>{heading}</h1><p>{intent === 'buy' ? 'Keep questions and survey information together. You can ask about buying without having a property.' : intent === 'sell' ? 'Upload your documents, review the information and keep useful follow-ups with your sale preparation.' : 'Choose what you want help with. Documents, equipment, maintenance and other information belong to the same home record.'}</p>
      {intent !== 'manage' && <div className="journey-actions"><Link className="journey-button" to="/documents">{intent === 'buy' ? 'Upload a survey' : 'Upload your documents'}</Link><button className="journey-link" onClick={() => ask(intent === 'buy' ? 'How can HomeTruth help me understand a survey?' : 'What information should I gather when preparing to sell?')}>Ask about {intent === 'buy' ? 'buying' : 'selling'}</button></div>}
      {!loading && !error && !records.length && <div className="journey-status"><p>No saved home yet. You can ask for advice now and add a home when it helps.</p><button className="journey-link" onClick={openDetails}>Add home details</button></div>}
      <div className="journey-grid">{HOME_DESTINATIONS.map(d => <article key={d.path} className="journey-panel journey-card"><h2>{d.label}</h2><p>{d.description}</p><Link to={d.path} onClick={d.path === "/ask-ai" ? e => { e.preventDefault(); ask(''); } : undefined}>{d.label === 'AskAI' ? 'Ask about my home' : `Open ${d.label.toLowerCase()}`} →</Link></article>)}</div>
    </>}
    {section === 'details' && <><h1>Home details.</h1><p>See the context and evidence behind the selected home. The full home record also includes its documents, equipment and history.</p><div className="journey-panel"><h2>{selected ? labelFor(selected) : 'Add or choose a home when it helps.'}</h2><p>{selected ? `Relationship: ${selected.relationship?.relationshipType || 'not supplied'}. This is not a verification of ownership.` : 'General advice remains available without a home record.'}</p><button className="journey-button" onClick={openDetails}>{selected ? 'Review home details' : 'Add home details'}</button></div></>}
    {section === 'maintenance' && <><h1>Maintenance and repairs.</h1><p>Review actions based on recorded property information. No work or due date is inferred from the presence of a document.</p>{tasksLoading && <p role="status">Loading recorded actions…</p>}{tasksError && <p role="alert">{tasksError}</p>}<div className="journey-panel">{!tasksLoading && !tasksError && !tasks.length && <p>{selected ? 'No actions returned for this home.' : 'Select a home to see its recorded actions, or ask a general maintenance question.'}</p>}{tasks.map(task => <article key={task.id} className="journey-task"><h2>{task.title}</h2><p>{task.description}</p><p>Status: {task.status || 'not supplied'} · {task.dueDate ? `Recorded date: ${new Date(task.dueDate).toLocaleDateString('en-GB')}` : 'No due date recorded'}</p></article>)}<div className="journey-actions"><button className="journey-button" onClick={openDetails}>Manage recorded actions</button><button className="journey-link" onClick={() => ask('Help me understand the maintenance information I have for my home.')}>Ask about maintenance</button></div></div></>}
    {capability && <><h1>{capability.title}.</h1><p>{capability.lead}</p><div className="journey-panel"><h2>{capability.status}</h2><p>{capability.body}</p><div className="journey-actions"><Link className="journey-button" to={capability.to} onClick={capability.to === "/ask-ai" ? e => { e.preventDefault(); ask(''); } : undefined}>{capability.action}</Link><button className="journey-link" onClick={() => ask(capability.question)}>AskAI for help</button></div></div></>}
    <div className="journey-actions"><Link to={intent === 'buy' ? '/buying' : intent === 'sell' ? '/selling' : '/my-home'}>Return to {intent === 'buy' ? 'buying workspace' : intent === 'sell' ? 'selling workspace' : 'home overview'}</Link><Link to="/saved-notes">Your saved notes</Link></div>
    <p className="journey-note mt-6">Documents shows your authorised account library. Selecting a home here does not automatically filter or attach its files.</p>
  </section>;
}
