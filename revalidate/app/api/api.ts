const API_BASE_URL = "http://localhost:5000/api/v1";

const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

const getHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

export const api = {
 
  searchCities: async (queryString: string) => {
    const res = await fetch(`${API_BASE_URL}/locations/cities?q=${encodeURIComponent(queryString)}`);
    return res.json();
  },
  
  requestCity: async (name: string, state: string) => {
    const res = await fetch(`${API_BASE_URL}/locations/city`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ name, state })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to request city");
    return data;
  },

  getPendingLocations: async () => {
    const res = await fetch(`${API_BASE_URL}/locations/pending`, { headers: getHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  approveLocation: async (id: string, type: 'CITY' | 'POINT', action: 'APPROVE' | 'REJECT') => {
    const res = await fetch(`${API_BASE_URL}/locations/approve`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ id, type, action })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  // --- AUTH ---
  sendOtp: async (email: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  verifyOtp: async (email: string, otp: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  // --- BOOKING ---
  lockSeat: async (payload: any) => {
    const res = await fetch(`${API_BASE_URL}/bookings/lock`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  verifyBookingOtp: async (bookingId: string, otp: string) => {
    const res = await fetch(`${API_BASE_URL}/bookings/verify`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ bookingId, otp })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  // --- FLEET / BUS SEARCH ---
  searchBuses: async (source: string, destination: string, date: string) => {
    const res = await fetch(`${API_BASE_URL}/buses/search?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  },

  getBusById: async (busId: string) => {
    const res = await fetch(`${API_BASE_URL}/buses/${busId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    return data;
  }
};
