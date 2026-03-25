import { error } from "node:console";

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

export async function fetchDashboard(token) {
  if(!token) throw new Error ("Please Provide Authentication Token");
  const res = await fetch(`${API_URl}/admin/dashboard`,{
      method: 'GET',
      headers: {
        'Authorization': "Bearer " + token, 
        'Content-Type': 'application/json' 
      }
    }
  );
  if (!res.ok) throw new Error("Failed to fetch dashboard");
  return res.json();
}

export async function fetchBuses(token) {
  if(!token) throw new Error ("Please Provide Authentication Token");
  const res = await fetch(API_URl + "/admin/buses",{
    method: "GET",
    headers:{
      'Authorization': "Bearer " + token
    }
  });
  if (!res.ok) throw new Error("Failed to fetch buses");
  return res.json();
}

export async function addBus(data: any,token) {
  if(!token) throw new Error ("Please Provide Authentication Token");
  const res = await fetch(API_URl +"/addBus", {
    method: "POST",
    headers: { "Content-Type": "application/json",
      'Authorization': "Bearer " + token
     },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Add bus failed");
  return res.json();
}

export async function editBus(id: string, data: any,token) {
  if(!token) throw new Error ("Please Provide Authentication Token");
  const res = await fetch(`${API_URl}/editBus/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json",'Authorization': "Bearer " + token },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Edit bus failed");
  return res.json();
}

export async function deleteBus(id: string,token) {
  if(!token) throw new Error ("Please Provide Authentication Token");
  const res = await fetch(API_URl + "/deleteBus/" + id, { 
    method: "DELETE",
    headers:{
      'Authorization': "Bearer " + token
    } 
  });
  if (!res.ok) throw new Error((await res.json()).message || "Delete bus failed");
  return res.json();
}

export async function fetchBookings(token) {
  if(!token) throw new Error ("Please Provide Authentication Token");
  const res = await fetch(API_URl + "/admin/bookings",{
    method:"GET",
    headers:{
      'Authorization': "Bearer " + token
    }
  });
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
}

export async function cancelBooking(id: string,token) {
  if(!token) throw new Error ("Please Provide Authentication Token");
  const res = await fetch(`${API_URl}/admin/cancelBooking/${id}`, { method: "PUT",
    headers:{
      'Authorization': "Bearer " + token
    }
   });
  if (!res.ok) throw new Error((await res.json()).message || "Cancel failed");
  return res.json();
}

export async function getBusById  (id: string,token)  {
  if(!token) throw new Error ("Please Provide Authentication Token");
  const res = await fetch(`${API_URl}/admin/bus/${id}`,{
    method:"GET",
    headers:{
      'Authorization': "Bearer " + token
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch bus");
  }

  return data;
}

export async function updateBus (id: string, payload: any,token) {
  if(!token) throw new Error ("Please Provide Authentication Token");
  const res = await fetch(API_URl + "/editBus/" + id, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      'Authorization': "Bearer " + token
     },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Update failed");
  }

  return data;
}