const demoItems = [
  { label: 'Blue mug', detail: 'Quantity 1 · blue' },
  { label: 'Chocolate bar', detail: 'Quantity 1' },
  { label: 'Greeting card', detail: 'Text: “Happy Birthday Ayesha”' }
];

export function App() {
  return (
    <main>
      <nav aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="ParcelProof home">
          <span className="brandMark" aria-hidden="true">P</span>
          ParcelProof
        </a>
        <span className="pilot">AWS hackathon build</span>
      </nav>

      <section className="hero" id="top">
        <div className="heroCopy">
          <p className="eyebrow">Visual packing checks for small sellers</p>
          <h1>Catch the wrong item before the parcel leaves the table.</h1>
          <p className="lede">
            ParcelProof compares an order with a packing photo, blocks visible mistakes,
            and verifies the corrected parcel before shipment.
          </p>
          <div className="actions">
            <button className="primary" type="button">Run the demo order <span aria-hidden="true">→</span></button>
            <button className="secondary" type="button">Create a custom order</button>
          </div>
          <p className="note">No account needed · Photos stay private · Visible items only</p>
        </div>

        <aside className="orderCard" aria-label="Demo order preview">
          <div className="cardTop">
            <div>
              <p className="cardLabel">DEMO ORDER</p>
              <h2>Order #PP-1001</h2>
            </div>
            <span className="readyDot">Ready to inspect</span>
          </div>
          <p className="customer">For Ayesha · Birthday gift box</p>
          <div className="itemList">
            {demoItems.map((item, index) => (
              <div className="item" key={item.label}>
                <span className="itemNumber">{index + 1}</span>
                <span><strong>{item.label}</strong><small>{item.detail}</small></span>
              </div>
            ))}
          </div>
          <div className="trustLine">
            <span aria-hidden="true">◇</span>
            <p><strong>The model observes. Policy decides.</strong><br />Uncertainty always becomes human review.</p>
          </div>
        </aside>
      </section>

      <section className="steps" aria-labelledby="how-it-works">
        <p className="eyebrow">A safer twenty-second check</p>
        <h2 id="how-it-works">From packed to proven.</h2>
        <div className="stepGrid">
          <article><span>01</span><h3>Load the order</h3><p>Define the items, variants, quantities, and exact personalisation that should be visible.</p></article>
          <article><span>02</span><h3>Photograph the parcel</h3><p>Upload one clear packing photo through a short-lived private link.</p></article>
          <article><span>03</span><h3>Ship with evidence</h3><p>See each match and mismatch, correct mistakes, and keep the full inspection history.</p></article>
        </div>
      </section>

      <footer>
        <p>Built for small personalised-order teams.</p>
        <p>ParcelProof verifies only what is visible. It cannot prove hidden items are present.</p>
      </footer>
    </main>
  );
}

