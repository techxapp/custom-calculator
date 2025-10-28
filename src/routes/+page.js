export async function load({ fetch }) {
  try {

    // add sleep of 1 second
    const apiBase = import.meta.env.VITE_API_URL;

    const res = await fetch(`${apiBase}/api/calculators`);

    if (!res.ok) {
      return { calculators: [], error: 'Failed to load calculators' };
    }
    const calculators = await res.json();
    return { calculators };
  } catch (error) {
    // await new Promise(resolve => setTimeout(resolve, 2000));
    return { calculators: [], error: 'Backend unreachable: ' + error.message };
  }
}
