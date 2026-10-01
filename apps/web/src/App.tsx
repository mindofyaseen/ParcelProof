import { useEffect, useRef, useState } from 'react';

type Status = 'PASS' | 'REVIEW' | 'BLOCK';
type Order = { orderId: string; displayNumber: string; customerAlias: string; requirements: Array<{ item: string; quantity: number; variant?: string; personalization?: string }> };
type Check = { kind: string; requirement: string; expected: string; observed: string; result: 'MATCH' | 'MISMATCH' | 'MISSING' | 'UNCERTAIN'; confidence?: number; evidence: string };
type Inspection = { inspectionId: string; status: Status; comparison: { checks: Check[]; reasons: string[] }; latencyMs: number; createdAt: string };

const demoPayload = { customerAlias: 'Ayesha', requirements: [{ item: 'mug', quantity: 1, variant: 'blue' }, { item: 'chocolate bar', quantity: 1 }, { item: 'greeting card', quantity: 1, personalization: 'Happy Birthday Ayesha' }] };

async function getApiUrl() {
  const response = await fetch('/config.json', { cache: 'no-store' });
  if (!response.ok) throw new Error('App configuration is unavailable');
  return (await response.json() as { apiUrl: string }).apiUrl;
}

export function App() {
  const [apiUrl, setApiUrl] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [history, setHistory] = useState<Inspection[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const workflowRef = useRef<HTMLElement>(null);

  useEffect(() => { getApiUrl().then(setApiUrl).catch((cause: Error) => setError(cause.message)); }, []);

  async function api<T>(path: string, init?: RequestInit): Promise<T> {
    const baseUrl = apiUrl || await getApiUrl();
    if (!apiUrl) setApiUrl(baseUrl);
    const response = await fetch(`${baseUrl}${path}`, { ...init, headers: { 'content-type': 'application/json', ...init?.headers } });
    const value = await response.json();
    if (!response.ok) throw new Error(value.message ?? 'Request failed');
    return value as T;
  }

  async function startDemo() {
    setBusy(true); setError(''); setInspection(null); setHistory([]); setFile(null);
    try {
      const created = await api<Order>('/orders', { method: 'POST', body: JSON.stringify(demoPayload) });
      setOrder(created);
      setTimeout(() => workflowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not create the demo order'); }
    finally { setBusy(false); }
  }

  async function inspect() {
    if (!order || !file) return;
    if (file.size > 8 * 1024 * 1024) { setError('That photo is larger than 8 MB. Choose a smaller JPG, PNG, or WebP.'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError('Choose a JPG, PNG, or WebP packing photo.'); return; }
    setBusy(true); setError('');
    try {
      const upload = await api<{ uploadUrl: string; objectKey: string }>(`/orders/${order.orderId}/upload-url`, { method: 'POST', body: JSON.stringify({ contentType: file.type, size: file.size }) });
      const uploaded = await fetch(upload.uploadUrl, { method: 'PUT', body: file, headers: { 'content-type': file.type } });
      if (!uploaded.ok) throw new Error('Private photo upload failed. Please retry.');
      const result = await api<Inspection>(`/orders/${order.orderId}/inspections`, { method: 'POST', body: JSON.stringify({ objectKey: upload.objectKey }) });
      setInspection(result); setHistory((current) => [result, ...current]); setFile(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Inspection failed safely'); }
    finally { setBusy(false); }
  }

  const statusCopy = inspection ? { PASS: ['Ready to ship', 'Every visible requirement was confidently satisfied.'], BLOCK: ['Shipment blocked', 'A visible mismatch must be corrected before shipment.'], REVIEW: ['Needs human review', 'The photo or model response could not establish a safe result.'] }[inspection.status] : null;

  return <main>
    <nav aria-label="Primary navigation"><a className="brand" href="#top"><span className="brandMark">P</span><span>ParcelProof<small>Visual dispatch control</small></span></a><div className="navLinks"><a href="#how">How it works</a><a href="#trust">Trust model</a><span className="livePill"><i /> Live on AWS</span></div></nav>

    <section className="hero" id="top"><div className="heroCopy"><p className="eyebrow"><span>For personalised sellers</span> · One photo before dispatch</p><h1>Wrong parcel?<br /><em>Catch it here.</em></h1><p className="lede">ParcelProof checks the items, variants, quantities, and exact personalised text that barcode systems miss—before a packing mistake becomes a refund.</p><div className="actions"><button className="primary" onClick={startDemo} disabled={busy}>{busy && !order ? 'Preparing demo…' : 'Run the judge demo'} <span>→</span></button><a className="secondary" href="#how">See how it works</a></div><div className="proofRow"><span>◆ Private S3 uploads</span><span>◆ Deterministic policy</span><span>◆ No sign-in</span></div></div>
      <div className="heroVisual" aria-label="Example ParcelProof inspection"><div className="scanFrame"><span className="corner tl"/><span className="corner tr"/><span className="corner bl"/><span className="corner br"/><div className="parcelScene"><div className="mug"><span /></div><div className="card">Happy Birthday<br/><strong>Alisha</strong></div><div className="chocolate">CHOCOLATE</div></div><div className="finding wrong"><b>Variant mismatch</b><span>Expected blue · saw red</span></div><div className="finding textFinding"><b>Name mismatch</b><span>Ayesha ≠ Alisha</span></div></div><div className="verdictCard"><span className="verdictIcon">!</span><div><small>PARCEL STATUS</small><strong>Shipment blocked</strong></div><b>2 issues</b></div><div className="floatNote">AI observes<br/><strong>Policy decides</strong></div></div></section>

    <section className="impactStrip"><p><strong>Built for the awkward orders.</strong> Colours, handwritten cards, printed names, mixed hampers, and one-off products.</p><div><span><b>3</b> outcomes</span><span><b>0</b> silent guesses</span><span><b>1</b> correction trail</span></div></section>

    {error && !order && <div className="errorBanner globalError"><b>Couldn’t connect safely.</b><span>{error}</span><button onClick={() => setError('')}>Dismiss</button></div>}

    {order && <section className="workflow" ref={workflowRef} aria-live="polite"><div className="workflowHeader"><div><p className="eyebrow">Live judge workflow</p><h2>{order.displayNumber}</h2><p>Birthday gift box for {order.customerAlias}</p></div><button className="resetButton" onClick={startDemo} disabled={busy}>Reset demo</button></div><div className="workspaceGrid"><div className="requirementsPanel"><div className="panelTitle"><span>01</span><div><h3>What should be packed</h3><p>Exact requirements from the order</p></div></div><div className="requirements">{order.requirements.map((req) => <div className="requirement" key={req.item}><span className="checkMark">✓</span><div><strong>{req.item}</strong><small>{req.variant ? `${req.variant} · ` : ''}Quantity {req.quantity}{req.personalization ? ` · “${req.personalization}”` : ''}</small></div></div>)}</div><div className="privacyNote"><span>⌁</span><p><strong>Private by design</strong><br/>The browser uploads directly to encrypted S3 using a five-minute link.</p></div></div>
      <div className="uploadPanel"><div className="panelTitle"><span>02</span><div><h3>Show us the packed order</h3><p>JPG, PNG, or WebP · maximum 8 MB</p></div></div><label className={`dropZone ${dragging ? 'dragging' : ''} ${file ? 'hasFile' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); setFile(event.dataTransfer.files[0] ?? null); }}><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /><span className="uploadIcon">↑</span><strong>{file ? file.name : 'Drop a clear packing photo here'}</strong><small>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · ready to inspect` : 'or click to choose a photo'}</small></label><button className="inspectButton" disabled={!file || busy} onClick={inspect}>{busy ? 'Inspecting visible evidence…' : inspection ? 'Inspect corrected parcel' : 'Inspect this parcel'} <span>→</span></button><p className="limitText">Only visible evidence is checked. Hidden, sealed, or obscured items require human review.</p></div></div>
      {error && <div className="errorBanner"><b>Couldn’t complete that safely.</b><span>{error}</span><button onClick={() => setError('')}>Dismiss</button></div>}
      {inspection && statusCopy && <section className={`resultPanel status-${inspection.status.toLowerCase()}`}><div className="resultHero"><span className="resultIcon">{inspection.status === 'PASS' ? '✓' : inspection.status === 'BLOCK' ? '!' : '?'}</span><div><p>INSPECTION RESULT</p><h2>{statusCopy[0]}</h2><span>{statusCopy[1]}</span></div><div className="latency">{(inspection.latencyMs / 1000).toFixed(1)}s<small>inspection</small></div></div>{inspection.comparison.reasons.length > 0 && <div className="reasonList">{inspection.comparison.reasons.map((reason) => <p key={reason}>• {reason}</p>)}</div>}{inspection.comparison.checks.length > 0 && <div className="resultTable"><div className="resultRow head"><span>Requirement</span><span>Expected</span><span>Observed</span><span>Result</span></div>{inspection.comparison.checks.map((check, index) => <div className="resultRow" key={`${check.kind}-${index}`}><span><b>{check.requirement}</b><small>{check.kind.toLowerCase()}</small></span><span>{check.expected}</span><span>{check.observed}</span><span><i className={`chip ${check.result.toLowerCase()}`}>{check.result}</i>{check.confidence !== undefined && <small>{Math.round(check.confidence * 100)}% confidence</small>}</span></div>)}</div>}{inspection.status !== 'PASS' && <div className="correctAction"><div><strong>Correct the parcel, then inspect again.</strong><p>The next inspection stays linked to this order so judges can see the full recovery trail.</p></div><button onClick={() => document.querySelector<HTMLInputElement>('.dropZone input')?.click()}>Choose corrected photo</button></div>}</section>}
      {history.length > 0 && <section className="historyPanel"><div><p className="eyebrow">Evidence trail</p><h3>Inspection history</h3></div><div className="timeline">{history.map((item, index) => <div className="historyItem" key={item.inspectionId}><span>{history.length - index}</span><div><strong>{item.status === 'PASS' ? 'Ready to ship' : item.status === 'BLOCK' ? 'Shipment blocked' : 'Human review needed'}</strong><small>{new Date(item.createdAt).toLocaleString()} · {(item.latencyMs / 1000).toFixed(1)}s</small></div><i className={`chip ${item.status.toLowerCase()}`}>{item.status}</i></div>)}</div></section>}</section>}

    <section className="how" id="how"><div className="sectionIntro"><p className="eyebrow">A twenty-second control point</p><h2>From packed to proven.</h2><p>Designed around one decision a small seller makes dozens of times a day: is this exact parcel safe to ship?</p></div><div className="stepGrid"><article><span>01</span><div className="stepIcon">≡</div><h3>Load the truth</h3><p>Items, quantities, variants, and exact personalised text form the order contract.</p></article><article><span>02</span><div className="stepIcon">◎</div><h3>Observe the parcel</h3><p>Amazon Bedrock extracts visible evidence from one private packing photo.</p></article><article><span>03</span><div className="stepIcon">◇</div><h3>Decide safely</h3><p>Deterministic TypeScript policy returns PASS, BLOCK, or REVIEW—never a model hunch.</p></article></div></section>
    <section className="trust" id="trust"><div><p className="eyebrow light">Trust is a product feature</p><h2>The model never gets the final word.</h2><p>Computer vision is powerful, but shipping decisions need predictable rules. ParcelProof separates observation from authority.</p></div><div className="trustGrid"><div><span>1</span><strong>Model observes</strong><p>Objects, visible text, confidence, image quality, and uncertainty.</p></div><div><span>2</span><strong>Schema validates</strong><p>Malformed or partial output cannot quietly become a pass.</p></div><div><span>3</span><strong>Policy decides</strong><p>Exact names remain exact. Low confidence always becomes review.</p></div></div><div className="limitations"><strong>Honest limitations</strong><span>Cannot see through packaging</span><span>Cannot test product function</span><span>Does not replace human review</span></div></section>
    <footer><div className="brand"><span className="brandMark">P</span><span>ParcelProof<small>Catch it before it ships.</small></span></div><p>Built on AWS for Zero to Shipped · #commercial-potential · #startups</p><a href="#top">Back to top ↑</a></footer>
  </main>;
}
