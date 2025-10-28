<script>
  export let data;
  let { calculators = [], error = '' } = data;

  let search = '';
  $: filteredCalculators = calculators.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
    || c.description?.toLowerCase().includes(search.toLowerCase())
  );
</script>

<h1>Calculators</h1>

{#if error}
  <p style="color:#c0261e; font-weight:500;">{error}</p>
{:else}
  <input
    class="search"
    type="text"
    placeholder="Search calculators..."
    bind:value={search}
    autocomplete="off"
  />

  <div class="grid">
    {#each filteredCalculators as calc}
      <a class="tile" href={`/calculators/${calc.id}`}>
        <h2>{calc.title}</h2>
        <p>{calc.description}</p>
      </a>
    {/each}
    {#if filteredCalculators.length === 0}
      <div class="empty-search">No calculators found.</div>
    {/if}
  </div>
{/if}

<style>
  h1 {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 1.4rem;
    color: #17496c;
  }
  .search {
    display: block;
    margin: 0 auto 2rem auto;
    padding: 0.7rem 1.1rem;
    font-size: 1.09rem;
    border-radius: 7px;
    border: 1px solid #c2c8d1;
    width: 100%;
    max-width: 400px;
    background: #f8fafc;
    margin-bottom: 2.2rem;
    box-sizing: border-box;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(255px, 1fr));
    gap: 1.4rem;
    margin: 0 auto;
    padding: 0 1.5rem;
    max-width: 1080px;
  }
  .tile {
    background: #f3f6fa;
    padding: 1.8rem 1.2rem 1.3rem 1.2rem;
    border-radius: 12px;
    text-decoration: none;
    color: #21262c;
    box-shadow: 0px 2px 14px #d3e0ef55;
    transition: background 0.18s, transform 0.14s;
    border: 1.5px solid #dbe6ef;
    display: flex;
    flex-direction: column;
    min-height: 115px;
    justify-content: flex-start;
  }
  .tile h2 {
    font-size: 1.18rem;
    margin-bottom: 0.55rem;
    margin-top: 0;
    color: #184c88;
    font-weight: 600;
    line-height: 1.2;
  }
  .tile p {
    font-size: 0.99rem;
    color: #465366;
    margin: 0;
    flex: 1 1 auto;
  }
  .tile:hover {
    background: #eaf4ff;
    border-color: #a2cafe;
    box-shadow: 0px 5px 24px #99bad622;
    transform: translateY(-2px) scale(1.03);
  }
  .empty-search {
    grid-column: 1 / -1;
    text-align: center;
    color: #7b8696;
    font-size: 1.14rem;
    padding: 2rem 0 1rem 0;
  }
</style>
