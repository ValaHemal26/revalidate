const API_URL = "http://localhost:5000/api/v1";
const LOCATION_API = `${API_URL}/locations`;
const ADMIN_API = `${API_URL}/admin`;
const FLEET_API = `${API_URL}/fleet`;

/*
Email: admin@example.com
Password: admin123
*/

// ==================== AUTH ====================
export async function adminLogin(email: string, password: string) {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Login failed");
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ==================== DASHBOARD ====================
export async function fetchDashboard(token: string) {
  try {
    if (!token) throw new Error("Please Provide Authentication Token");
    const res = await fetch(`${ADMIN_API}/dashboard`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch dashboard");
    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ==================== BUS MANAGEMENT ====================
export async function fetchBuses(token: string) {
  try {
    if (!token) throw new Error("Please Provide Authentication Token");
    const res = await fetch(`${ADMIN_API}/buses`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch buses");
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function getBusById(id: string, token: string) {
  try {
    if (!token) throw new Error("Please Provide Authentication Token");
    const res = await fetch(`${ADMIN_API}/buses/${id}`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch bus");
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export async function addBus(data: any, token: string) {
  try {
    if (!token) throw new Error("Please Provide Authentication Token");
    const res = await fetch(`${ADMIN_API}/buses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Add bus failed");
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function editBus(id: string, data: any, token: string) {
  try {
    if (!token) throw new Error("Please Provide Authentication Token");
    const res = await fetch(`${ADMIN_API}/buses/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Edit bus failed");
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function updateBus(id: string, payload: any, token: string) {
  try {
    if (!token) throw new Error("Please Provide Authentication Token");
    const res = await fetch(`${ADMIN_API}/buses/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Update failed");
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export async function deleteBus(id: string, token: string) {
  try {
    if (!token) throw new Error("Please Provide Authentication Token");
    const res = await fetch(`${ADMIN_API}/buses/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + token,
      },
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Delete bus failed");
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ==================== BOOKINGS ====================
export async function fetchBookings(token: string) {
  try {
    if (!token) throw new Error("Please Provide Authentication Token");
    const res = await fetch(`${ADMIN_API}/bookings`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch bookings");
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function cancelBooking(id: string, token: string) {
  try {
    if (!token) throw new Error("Please Provide Authentication Token");
    const res = await fetch(`${ADMIN_API}/bookings/${id}/cancel`, {
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + token,
      },
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Cancel failed");
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ==================== OPERATORS ====================
export async function fetchOperators(token: string) {
  try {
    if (!token) throw new Error("Please Provide Authentication Token");
    const res = await fetch(`${ADMIN_API}/operators`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch operators");
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function approveOperator(id: string, action: string, token: string) {
  try {
    if (!token) throw new Error("Please Provide Authentication Token");
    const res = await fetch(`${ADMIN_API}/operators/${id}/approve`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `Failed to ${action} operator`);
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ==================== USERS ====================
export async function fetchUsers(token: string) {
  try {
    if (!token) throw new Error("Please Provide Authentication Token");
    const res = await fetch(`${ADMIN_API}/users`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function blockUser(id: string, token: string) {
  try {
    if (!token) throw new Error("Please Provide Authentication Token");
    const res = await fetch(`${ADMIN_API}/users/${id}/block`, {
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + token,
      },
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to block user");
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function unblockUser(id: string, token: string) {
  try {
    if (!token) throw new Error("Please Provide Authentication Token");
    const res = await fetch(`${ADMIN_API}/users/${id}/unblock`, {
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + token,
      },
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to unblock user");
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ==================== ADMIN PROFILE ====================
export async function getAdminProfile(token: string) {
  try {
    if (!token) throw new Error("Please Provide Authentication Token");
    const res = await fetch(`${ADMIN_API}/profile`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch profile");
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function updateAdminProfile(data: any, token: string) {
  try {
    if (!token) throw new Error("Please Provide Authentication Token");
    const res = await fetch(`${ADMIN_API}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Update failed");
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ==================== PENDING LOCATIONS ====================
export async function getPendingLocations(token: string) {
  try {
    if (!token) throw new Error("Please Provide Authentication Token");
    const res = await fetch(`${ADMIN_API}/pending-locations`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch pending locations");
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function approveLocation(id: string, type: string, action: string, token: string) {
  try {
    if (!token) throw new Error("Please Provide Authentication Token");
    const res = await fetch(`${ADMIN_API}/locations/${id}/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
      body: JSON.stringify({ type, action }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to approve location");
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
}


export async function searchCities(query: string) {
  try {
    const res = await fetch(`${LOCATION_API}/cities?search=${query}`);
    if (!res.ok) throw new Error("Failed to search cities");
    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ==================== LOCATIONS - CITIES ====================
export async function fetchAllCities() {
  try {
    const res = await fetch(`${LOCATION_API}/cities`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Failed to fetch cities");
    return await res.json();
  } catch (error) {
    throw error;
  }
}


export async function fetchCitiesWithPoints() {
  try {
    const res = await fetch(`${LOCATION_API}/cities-with-points`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Failed to fetch cities with points");
    return await res.json();
  } catch (error) {
    throw error;
  }
}

// ==================== LOCATIONS - POINTS ====================
export async function fetchPointsByCity(cityId: string) {
  try {
    if (!cityId) throw new Error("City ID is required");
    const res = await fetch(`${LOCATION_API}/cities/${cityId}/points`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Failed to fetch points");
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function getPointById(id: string, token: string) {
  try {
    if (!token) throw new Error("Please Provide Authentication Token");
    const res = await fetch(`${LOCATION_API}/points/${id}`, {
      headers: {
        "Authorization": "Bearer " + token,
      },
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to fetch point");
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function requestCity(name: string, state: string, token: string) {
  try {
    if (!token) throw new Error("Please Provide Authentication Token");
    const res = await fetch(`${LOCATION_API}/city`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
      body: JSON.stringify({ name, state }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Request city failed");
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
}