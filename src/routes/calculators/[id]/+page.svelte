<script>
  import { onMount } from 'svelte';
  import yaml from 'js-yaml';

  export let params;
  let calculatorConfig = null;
  let error = '';
  let inputValues = {};
  let results = {};
  let isLoading = true;

  onMount(async () => {
    try {
      const apiBase = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiBase}/api/calculators/${params.id}`);
      if (!res.ok) throw new Error('Failed to load calculator');
      const yamlText = await res.text();
      calculatorConfig = yaml.load(yamlText);
      if (calculatorConfig?.inputs) {
        calculatorConfig.inputs.forEach(input => {
          // Use default if provided, else blank
          inputValues[input.name] = input.default ?? '';
        });
      }
    } catch (e) {
      error = e.message;
    }
    isLoading = false;
  });

  // Helper to evaluate an expression (simple eval for prototype, use a safe parser in production!)
  function safeEval(expr, context) {
    // Build context object for calculation
    return Function(...Object.keys(context), 'return ' + expr)(...Object.values(context));
  }

  // Auto-calculate all results from calculations when inputs change and required fields are set
  $: if (
    calculatorConfig?.inputs &&
    calculatorConfig?.calculations &&
    calculatorConfig.inputs.every(input => input.required ? inputValues[input.name]?.toString().trim() !== '' : true)
  ) {
    try {
      // Step 1: Prepare base values from input fields
      let context = {};
      calculatorConfig.inputs.forEach(input => {
        let value = inputValues[input.name] === '' ? undefined : parseFloat(inputValues[input.name]);
        // For optional fields, undefined if blank
        context[input.name] = (!input.required && (value === undefined || isNaN(value))) ? undefined : value;
      });

      // Step 2: Calculate all intermediate values
      results = {};
      // Compute calculations in order
      Object.entries(calculatorConfig.calculations).forEach(([key, formula]) => {
        try {
          results[key] = safeEval(formula, { ...context, ...results });
        } catch {
          results[key] = 'Error';
        }
      });
    } catch {
      results = {};
    }
  } else {
    results = {};
  }

  function formatOutput(value, formatType = "number") {
    if (typeof value !== "number" || isNaN(value)) return value;
    switch (formatType) {
      case "currency":
        // Format for Indian Rupees with commas
        return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value);
      case "decimal":
        return value.toFixed(2);
      default:
        // Default: add grouping, 2 decimal points
        return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value);
    }
  }
</script>

<style>
  .calculator-card {
    max-width: 390px;
    margin: 2rem auto;
    padding: 2rem 2rem 1.5rem 2rem;
    background: #f8fafc;
    border-radius: 14px;
    box-shadow: 0 3px 24px #ccd6dd55;
    border: 1px solid #c2c8d1;
  }
  h1 {
    font-size: 1.7rem;
    margin-bottom: 1rem;
    color: #2a3042;
    text-align: center;
  }
  form {
    margin-top: 1.1rem;
    display: flex;
    flex-direction: column;
    gap: 1.15rem;
  }
  label {
    font-weight: 500;
    color: #484e5e;
    margin-bottom: 2px;
    display: block;
  }
  input[type="number"], input[type="text"] {
    padding: 9px 12px;
    border: 1px solid #c2c8d1;
    border-radius: 7px;
    font-size: 1rem;
    width: 100%;
    box-sizing: border-box;
  }
  .result-box {
    margin: 1.25rem 0 0 0;
    padding: 1rem 1rem 1rem 1.1rem;
    border-radius: 8px;
    background: #e0ffe1;
    color: #174520;
    font-size: 1.18rem;
    font-weight: 600;
    box-shadow: 0 0 8px #80cbc016;
    border: 1px solid #ade4b2;
    text-align: center;
    letter-spacing: 0.01em;
  }
  .desc {
    text-align: center;
    margin-bottom: 1.2rem;
    color: #525967;
  }
  .error {
    color: #c0261e;
    text-align: center;
    margin: 1.5rem 0;
    font-weight: 600;
  }
  .loading {
    text-align: center;
    color: #24659b;
    margin-top: 2rem;
  }
</style>

{#if isLoading}
  <p class="loading">Loading...</p>
{:else if error}
  <p class="error">{error}</p>
{:else if calculatorConfig}
  <div class="calculator-card">
    <h1>{calculatorConfig.title}</h1>
    <p class="desc">{calculatorConfig.description}</p>
    <form autocomplete="off">
      {#each calculatorConfig.inputs as input}
        <div>
          <label for={input.name}>{input.label}</label>
          <input
            id={input.name}
            name={input.name}
            type={input.type}
            placeholder={input.placeholder}
            bind:value={inputValues[input.name]}
            required={input.required}
            min={input.min}
            step={input.step}
            autocomplete="off"
            inputmode={input.type === 'number' ? 'decimal' : undefined}
          />
        </div>
      {/each}
    </form>
    {#if Object.keys(results).length}
      <div class="result-box" style="text-align:left;">
       {#each calculatorConfig.outputs as output}
          <div style="margin-bottom:0.5em;">
            <strong>{output.label}:</strong>
            {#if results[output.value] !== undefined}
              {formatOutput(results[output.value], output.format)} {output.unit}
            {:else}
              N/A
            {/if}
          </div>
        {/each}

      </div>
    {/if}
  </div>
{/if}




