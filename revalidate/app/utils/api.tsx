// utils/api.ts
export const API_BASE = "http://localhost:5000";

export async function fetchBuses() {
  try {
    const res = await fetch(`${API_BASE}/admin/buses`);
    if (!res.ok) throw new Error("Failed to fetch buses");
    return await res.json();
  } catch (err: any) {
    throw new Error(err.message || "Unknown error fetching buses");
  }
}


export async function bookSeat(data: any) {
  try {
    const res = await fetch(`${API_BASE}/bookSeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to book seat");
    return await res.json();
  } catch (err: any) {
    throw new Error(err.message || "Unknown error booking seat");
  }
}

export const getBus = async (id: string) => {
  
  const res = await fetch(`${API_BASE}/bus/${id}`);
  const data = await res.json();
    console.log(res);
  if (!res.ok) throw new Error(data.message);

  return data;
};