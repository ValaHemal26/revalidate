const API_URl = "http://localhost:5000";
/*
Email: admin@example.com
Password: admin123
*/
export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${API_URl}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Login failed");
  return res.json();
}

export async function fetchDashboard() {
  const res = await fetch(`${API_URl}/admin/dashboard`);
  if (!res.ok) throw new Error("Failed to fetch dashboard");
  return res.json();
}

export async function fetchBuses() {
  const res = await fetch(`${API_URl}/admin/buses`);
  if (!res.ok) throw new Error("Failed to fetch buses");
  return res.json();
}

export async function addBus(data: any) {
  const res = await fetch(`${API_URl}/addBus`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Add bus failed");
  return res.json();
}

export async function editBus(id: string, data: any) {
  const res = await fetch(`${API_URl}/editBus/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Edit bus failed");
  return res.json();
}

export async function deleteBus(id: string) {
  const res = await fetch(`${API_URl}/deleteBus/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error((await res.json()).message || "Delete bus failed");
  return res.json();
}

export async function fetchBookings(filters?: { busId?: string; date?: string }) {
  const query = new URLSearchParams(filters as any).toString();
  const res = await fetch(`${API_URl}/admin/bookings?${query}`);
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
}

export async function cancelBooking(id: string) {
  const res = await fetch(`${API_URl}/admin/cancelBooking/${id}`, { method: "PUT" });
  if (!res.ok) throw new Error((await res.json()).message || "Cancel failed");
  return res.json();
}

export async function getBusById  (id: string)  {
  const res = await fetch(`${API_URl}/admin/bus/${id}`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch bus");
  }

  return data;
}

export async function updateBusApi (id: string, payload: any) {
  const res = await fetch(`${API_URl}/editBus/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Update failed");
  }

  return data;
}