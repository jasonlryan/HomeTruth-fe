import { useEffect, useRef, useState } from 'react';
import { findItemManual, getApplianceAgentResult, saveAgentManual } from '../../api/api';
const external = value => {
  try { const u=new URL(value); return u.protocol==='https:'&&!u.username&&!u.password ? u.href : null; } catch { return null; }
};
const activeStatus = value => ['running','importing'].includes(value?.status);
export default function ApplianceAgent({ homeId, itemId, onSaved }) {
  const [result,setResult]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[confirmed,setConfirmed]=useState({}),[retry,setRetry]=useState(0),[checking,setChecking]=useState(true);
  const alive=useRef(true), requestKey=useRef(null);
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
  useEffect(()=>{
    let cancelled=false,timer;
    setChecking(true);
    async function load(){
      try{const next=await getApplianceAgentResult(homeId,itemId);if(cancelled)return;setResult(next);setChecking(false);setError('');if(activeStatus(next))timer=setTimeout(load,2500);}
      catch{if(!cancelled){setChecking(true);setError('The previous agent result could not be loaded. Try loading it again before starting another lookup.');}}
    }
    load();return()=>{cancelled=true;clearTimeout(timer);};
  },[homeId,itemId,retry]);
  async function start(){
    setBusy(true);setError('');setConfirmed({});requestKey.current ||= crypto.randomUUID();
    try{const next=await findItemManual(homeId,itemId,requestKey.current);if(!alive.current)return;setResult(next);requestKey.current=null;if(activeStatus(next))setRetry(n=>n+1);}
    catch(e){if(alive.current)setError(e.response?.data?.message||'The lookup was interrupted. Reload the result to check whether it finished.');}
    finally{if(alive.current)setBusy(false);}
  }
  async function save(index){
    setBusy(true);setError('');
    try{const next=await saveAgentManual(homeId,itemId,result.id,index);if(!alive.current)return;setResult(next);onSaved();}
    catch(e){if(alive.current)setError(e.response?.data?.message||'The manual could not be saved. Open the source or reload the result before trying again.');}
    finally{if(alive.current)setBusy(false);}
  }
  return <div className="item-agent">
    <h3>Let HomeTruth find your manual</h3>
    <p>We’ll search official manufacturer sources using the confirmed make and model. Review what we find before adding it to this item.</p>
    <div className="journey-actions"><button type="button" className="journey-button" disabled={busy||checking||activeStatus(result)} onClick={start}>{result?'Search again':'Find my manual'}</button><button type="button" className="journey-link" disabled={busy} onClick={()=>setRetry(n=>n+1)}>Reload agent result</button></div>
    {(busy||activeStatus(result))&&<p role="status">{result?.status==='importing'?'Retrieving the PDF and checking its model…':'HomeTruth is looking for your manual…'}</p>}
    {error&&<p role="alert">{error}</p>}
    {result&&<div aria-live="polite"><p>{result.notice}</p>{result.status!=='saved'&&result.limitations&&<p className="journey-note">{result.limitations}</p>}<p className="journey-note">Model: {result.identity?.brand} {result.identity?.model}. Your confirmed item details are kept.</p><button type="button" className="journey-link" onClick={async()=>{try{await navigator.clipboard.writeText(result.identity?.model||'');}catch{setError('Select and copy the model number shown above.');}}}>Copy model number</button>
      {result.candidates?.map((candidate,index)=>(result.status!=='saved'||index===(result.savedCandidateIndex??0))&&external(candidate.url)&&<article className="journey-task" key={candidate.url}>
        <h3>{candidate.title}</h3><p className="journey-note">{new URL(candidate.url).hostname} · {candidate.kind==='pdf'?(result.status==='saved'?'Saved PDF':'PDF candidate'):'Manufacturer page'}</p><p className="journey-note">Suggested match: {candidate.quote}</p>
        <a href={external(candidate.url)} target="_blank" rel="noreferrer">Open manufacturer source ↗</a>
        {candidate.kind==='pdf'&&result.status==='needs_review'&&<><label className="item-check"><input type="checkbox" checked={!!confirmed[index]} onChange={e=>setConfirmed(v=>({...v,[index]:e.target.checked}))}/>I’ve checked the complete model — this is my manual</label><button type="button" className="journey-button" disabled={busy||!confirmed[index]} onClick={()=>save(index)}>Save this manual</button><p className="journey-note">HomeTruth checks the model inside the PDF before saving it privately with this item. Some files need to be downloaded and uploaded manually.</p></>}
      </article>)}
      {external(result.officialFinder)&&<p><a href={external(result.officialFinder)} target="_blank" rel="noreferrer">Open the manufacturer’s manual finder ↗</a></p>}
      {external(result.manualLibrarySearch)&&<p><a href={external(result.manualLibrarySearch)} target="_blank" rel="noreferrer">Search ManualsLib yourself ↗</a></p>}
      {external(result.searchLink)&&<p><a href={external(result.searchLink)} target="_blank" rel="noreferrer">Search for this exact model ↗</a></p>}
    </div>}
  </div>;
}
