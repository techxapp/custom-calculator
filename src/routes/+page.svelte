<script>
  export let data;
  let { calculators = [], error = '' } = data;

  let search = '';
  $: filteredCalculators = (() => {
    const q = search.trim().toLowerCase();
    if (!q) return calculators;

    const tokens = q.split(/\s+/).filter(Boolean);
    return calculators.filter(c => {
      const hay = `${c.title} ${c.description ?? ''}`.toLowerCase();
      // require every token to appear somewhere in title or description
      return tokens.every(t => hay.includes(t));
    });
  })();
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
</svelte:head>

<main class="app">
  <header class="topbar">
    <div class="brand">
      <div class="logo">D</div>
      <div>
        <h1>Droplee Calculator</h1>
        <p class="tag">Smart, fast, and beautiful calculation tools</p>
      </div>
    </div>
    <div class="meta">
      <div class="count">{calculators.length} calculators</div>
    </div>
  </header>

  {#if error}
    <p class="error">{error}</p>
  {:else}
    <div class="controls">
      <label class="search-wrapper" aria-label="Search calculators">
        <svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <input
          class="search"
          type="text"
          placeholder="Search calculators..."
          bind:value={search}
          autocomplete="off"
        />
      </label>
    </div>

    <div class="grid">
      {#each filteredCalculators as calc}
        <a class="tile" href={`/calculators/${calc.id}`}>
          <div class="tile-head">
            <!-- <div class="tile-badge">{calc.type ?? 'Pro'}</div> -->
            <h2>{calc.title}</h2>
          </div>
          <p class="desc">{calc.description}</p>
          <!-- <div class="tile-foot">
            <span class="muted">Open</span>
          </div> -->
        </a>
      {/each}

      {#if filteredCalculators.length === 0}
        <div class="empty-search">No calculators found.</div>
      {/if}
    </div>
  {/if}
</main>

<style>
  :root{
    --bg-1: #f6fbff;
    --bg-2: #eef6ff;
    --card: rgba(255,255,255,0.7);
    --muted: #6b7380;
    --accent: #1e72d7;
    --glass-border: rgba(255,255,255,0.6);
    --shadow: 0 6px 30px rgba(20,50,80,0.08);
    --radius-lg: 14px;
  }

  :global(html, body) {
    height: 100%;
    margin: 0;
    font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    background: linear-gradient(180deg, var(--bg-1) 0%, var(--bg-2) 100%);
    -webkit-font-smoothing:antialiased;
    -moz-osx-font-smoothing:grayscale;
    color: #0f1724;
  }

  .app{
    max-width: 1100px;
    margin: 36px auto;
    padding: 28px;
    box-sizing: border-box;
    backdrop-filter: blur(6px);
  }

  .topbar{
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:16px;
    margin-bottom: 22px;
  }

  .brand{
    display:flex;
    align-items:center;
    gap:14px;
  }

  .logo{
    width:56px;
    height:56px;
    border-radius:12px;
    background:linear-gradient(135deg,#1e72d7,#6eb0ff);
    color:white;
    display:flex;
    align-items:center;
    justify-content:center;
    font-weight:700;
    font-size:1.25rem;
    box-shadow: 0 6px 20px rgba(30,114,215,0.22);
  }

  h1{
    margin:0;
    font-size:1.12rem;
    color: #072547;
    letter-spacing: -0.2px;
  }

  .tag{
    margin:0;
    color:var(--muted);
    font-size:0.87rem;
    margin-top:3px;
  }

  .meta .count{
    font-size:0.95rem;
    color:var(--muted);
    padding:6px 10px;
    border-radius:10px;
    background:rgba(255,255,255,0.6);
    border:1px solid rgba(130,150,180,0.06);
    box-shadow:var(--shadow);
  }

  .error{
    color:#c0261e;
    font-weight:600;
    background: rgba(255,230,230,0.6);
    padding:10px 14px;
    border-radius:10px;
    border:1px solid #f5c2c2;
  }

  .controls{
    display:flex;
    justify-content:center;
    margin-bottom:22px;
    padding: 0 12px;
  }

  .search-wrapper{
    display:flex;
    align-items:center;
    width:100%;
    max-width:560px;
    background: linear-gradient(180deg, rgba(255,255,255,0.85), rgba(250,252,255,0.75));
    padding:10px 12px;
    border-radius:12px;
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow);
    gap:10px;
  }

  .search-wrapper .icon{
    width:18px;
    height:18px;
    color:var(--muted);
    flex: 0 0 auto;
  }

  .search{
    border: none;
    outline: none;
    font-size:1rem;
    padding:6px 0;
    background:transparent;
    width:100%;
    color:#072547;
  }

  .grid{
    display:grid;
    grid-template-columns: repeat(auto-fit, minmax(260px,1fr));
    gap:18px;
  }

  .tile{
    display:flex;
    flex-direction:column;
    gap:10px;
    padding:18px;
    text-decoration:none;
    color:inherit;
    border-radius:var(--radius-lg);
    background: linear-gradient(180deg, rgba(255,255,255,0.75), rgba(245,250,255,0.65));
    border: 1px solid rgba(30,114,215,0.06);
    box-shadow: 0 8px 30px rgba(16, 41, 77, 0.06);
    transition: transform .18s ease, box-shadow .18s ease, border-color .18s;
    min-height:128px;
    position:relative;
    overflow:hidden;
  }

  .tile::after{
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(120deg, rgba(255,255,255,0.02), rgba(255,255,255,0.06));
    pointer-events:none;
  }

  .tile:hover{
    transform: translateY(-6px);
    box-shadow: 0 20px 50px rgba(16,41,77,0.12);
    border-color: rgba(30,114,215,0.14);
  }

  .tile-head{
    display:flex;
    align-items:center; /* center vertically and allow title to center horizontally */
    gap:12px;
  }

  .tile-badge{
    background: linear-gradient(90deg,#e6f3ff,#f0fbff);
    color: #155e9a;
    padding:6px 8px;
    border-radius:8px;
    font-weight:600;
    font-size:0.78rem;
    border:1px solid rgba(30,114,215,0.06);
    flex:0 0 auto;
  }

  .tile h2{
    margin:0;
    font-size:1.06rem;
    color:#072547;
    line-height:1.15;
    font-weight:700;
    flex: 1 1 auto; /* take available space so text-align centers it */
    text-align: center;
  }

  .desc{
    margin:0;
    color:var(--muted);
    font-size:0.95rem;
    flex:1 1 auto;
  }

  .tile-foot{
    display:flex;
    justify-content:flex-end;
    align-items:center;
  }

  .muted{
    color:var(--muted);
    font-size:0.88rem;
    font-weight:600;
  }

  .empty-search{
    grid-column:1 / -1;
    text-align:center;
    color:var(--muted);
    font-size:1.03rem;
    padding:2rem 0;
  }

  @media (max-width:640px){
    .topbar{ flex-direction:column; align-items:flex-start; gap:12px; }
    .brand h1{ font-size:1rem; }
    .logo{ width:48px; height:48px; font-size:1rem; }
    .app{ margin:18px; padding:18px; }
  }
</style>
