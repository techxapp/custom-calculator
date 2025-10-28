export async function load({ fetch }) {
  try {
    const apiBase = import.meta.env.VITE_API_URL;

    const res = await fetch(`${apiBase}/api/calculators`);

    if (!res.ok) {
      return { calculators: [], error: 'Failed to load calculators' };
    }
    const calculators = await res.json();
    return { calculators };
  } catch (error) {
    return { calculators: [], error: 'Backend unreachable: ' + error.message };
  }
}
