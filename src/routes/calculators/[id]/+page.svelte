<script>
  import './+page.css';
  import { onMount } from 'svelte';

  import yaml from 'js-yaml';

  export let params;
  let calculatorConfig = null;
  let error = '';

  // List of calculator instances, each with: id, name, inputValues, results
  let instances = [];

  // Tracks carousel current index
  let currentIndex = 0;

  const MAX_INSTANCES = 10;

  let isLoading = true;

  onMount(async () => {
    try {
      const apiBase = import.meta.env.VITE_API_URL;
      const res = await fetch(`${apiBase}/api/calculators/${params.id}`);
      if (!res.ok) throw new Error('Failed to load calculator');
      const yamlText = await res.text();
      calculatorConfig = yaml.load(yamlText);

      if (calculatorConfig?.inputs) {
        const defaultInputValues = {};
        calculatorConfig.inputs.forEach(input => {
          defaultInputValues[input.name] = input.default ?? '';
        });
        instances = [{
          id: Date.now(),
          name: '',
          inputValues: { ...defaultInputValues },
          results: {}
        }];
      }
    } catch (e) {
      error = e.message;
    }
    isLoading = false;
  });

  // function safeEval(expr, context) {
  //   return Function(...Object.keys(context), 'return ' + expr)(...Object.values(context));
  // }

function safeEval(expr, context) {
  try {
    const args = Object.keys(context);
    const values = Object.values(context);
    const wrappedExpr = `
      "use strict";
      return (function() {
        ${expr}
      })();
    `;
    return Function(...args, wrappedExpr)(...values);
  } catch (err) {
    console.error("safeEval error:", err);
    return undefined;  // or "Error"
  }
}

//   function safeEval(expr, context) {
//   const args = Object.keys(context);
//   const values = Object.values(context);
//   const wrappedExpr = `
//     "use strict";
//     ${expr.trim()}
//   `;
//   return Function(...args, wrappedExpr)(...values);
// }


  $: if (calculatorConfig?.calculations) {
    for (let i = 0; i < instances.length; i++) {
      const instance = instances[i];
      try {
        if (calculatorConfig.inputs.every(input =>
          input.required ? instance.inputValues[input.name]?.toString().trim() !== '' : true
        )) {
          let context = {};
          calculatorConfig.inputs.forEach(input => {
            let val = instance.inputValues[input.name];
            if (val === '') val = undefined;
            else val = parseFloat(val);
            context[input.name] = (!input.required && (val === undefined || isNaN(val))) ? undefined : val;
          });

          let results = {};
          Object.entries(calculatorConfig.calculations).forEach(([key, formula]) => {
            try {
              console.log("Evaluating formula:", formula, "with context:", { ...context, ...results });

              results[key] = safeEval(formula, { ...context, ...results });
            } catch {
              results[key] = 'Error';
            }
          });
          instance.results = results;
        } else {
          instance.results = {};
        }
      } catch {
        instance.results = {};
      }
    }
  } else {
    instances.forEach(i => i.results = {});
  }

  function prev() {
    if (currentIndex > 0) currentIndex -= 1;
  }

  function next() {
    if (currentIndex < instances.length - 1) {
      currentIndex += 1;
    } else if (instances.length < MAX_INSTANCES) {
      addInstance();
      currentIndex += 1;
    } else {
      instances.shift();
      instances = [...instances];
      addInstance();
      currentIndex = instances.length - 1;
    }
  }

  function addInstance() {
    const defaultInputValues = {};
    calculatorConfig.inputs.forEach(input => {
      defaultInputValues[input.name] = input.default ?? '';
    });
    instances.push({
      id: Date.now(),
      name: '',
      inputValues: { ...defaultInputValues },
      results: {}
    });
    instances = [...instances];  // Important: reassign to trigger reactivity
  }

  function clearInstances() {
    if (calculatorConfig?.inputs) {
      const defaultInputValues = {};
      calculatorConfig.inputs.forEach(input => {
        defaultInputValues[input.name] = input.default ?? '';
      });
      instances = [{
        id: Date.now(),
        name: '',
        inputValues: { ...defaultInputValues },
        results: {}
      }];
      currentIndex = 0;
    }
  }

  function formatOutput(value, formatType = "number") {
    if (typeof value !== "number" || isNaN(value)) return value;
    switch (formatType) {
      case "currency":
        return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value);
      case "decimal":
        return value.toFixed(2);
      default:
        return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value);
    }
  }
</script>

{#if isLoading}
  <p class="loading">Loading...</p>
{:else if error}
  <p class="error">{error}</p>
{:else if calculatorConfig}
  <div class="home-button-container">
    <a href="/" class="home-button">🏠 Home</a>
  </div>

  <h1 class="title">{calculatorConfig.title}</h1>
  <p class="desc">{calculatorConfig.description}</p>

  <div class="carousel-controls">
    <button on:click={prev} disabled={currentIndex === 0} class="btn">‹ Prev</button>
    <button on:click={next} class="btn">Next ›</button>
    <button on:click={clearInstances} class="btn btn-clear">Clear All</button>
  </div>

  <div class="carousel-container">
    {#each instances as instance, i (instance.id)}
      {#if i === currentIndex}

          <div class="instance-header">
            <h2>Instance {i + 1}</h2>
            <input
              type="text"
              class="name-input"
              placeholder="Name (optional)"
              bind:value={instance.name}
              maxlength="50"
            />
          </div>

        <div class="calculator-card responsive-layout">
          
          <form autocomplete="off" on:submit|preventDefault>
            {#each calculatorConfig.inputs as input}
              <div class="form-group">
                <label for={`${input.name}-${instance.id}`}>{input.label}</label>
                <input
                  id={`${input.name}-${instance.id}`}
                  name={input.name}
                  type={input.type}
                  placeholder={input.placeholder}
                  bind:value={instance.inputValues[input.name]}
                  required={input.required}
                  min={input.min}
                  step={input.step}
                  autocomplete="off"
                  inputmode={input.type === 'number' ? 'decimal' : undefined}
                />
              </div>
            {/each}
          </form>

          {#if Object.keys(instance.results).length}
            <div class="result-box" style="text-align:left;">
              {#each calculatorConfig.outputs as output}
                <div class="result-row">
                  <strong>{output.label}:</strong>
                  {#if instance.results[output.value] !== undefined}
                    {formatOutput(instance.results[output.value], output.format)} {output.unit}
                  {:else}
                    N/A
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    {/each}
  </div>

  {#if instances.length > 0}
    <section class="comparison-section">
      <h3>Comparison Table</h3>
      <div class="comparison-wrapper">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Name/Instance</th>
              {#each calculatorConfig.inputs as input}
                <th>{input.label}</th>
              {/each}
              {#each calculatorConfig.outputs as output}
                <th>{output.label}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each instances as instance, i}
              <tr>
                <td>{instance.name || `Instance ${i + 1}`}</td>
                {#each calculatorConfig.inputs as input}
                  <td>{instance.inputValues[input.name]}</td>
                {/each}
                {#each calculatorConfig.outputs as output}
                  <td>{formatOutput(instance.results[output.value], output.format) || '-'}</td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>
  {/if}
{/if}

<!-- import from +page.css -->
<style>
  
</style>
