export const API_URL = "http://localhost:5000";

export async function fetchBuses() {
  try {
    const res = await fetch(API_URL + "/admin/buses");
    if (!res.ok) throw new Error("Failed to fetch buses");
    return await res.json();
  } catch (err: any) {
    throw new Error(err.message || "Unknown error fetching buses");
  }
}


export async function bookSeat(data: any) {

  try {
    const res = await fetch(API_URL + "/bookSeat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      return{
        success: false,
        data: await res.json(),
        status: 400
      }
    }
    return {
      success: true,
      data: await res.json(),
      status: 200
    }
  } catch (err: any) {
    return {
      success: false,
      message: err.message,
      status: 500
    }
  }
}

export async function getBus (id: string)  {
  
  const res = await fetch(API_URL + "/bus/" + id);
  const data = await res.json();
   
  if (!res.ok) throw new Error(data.message);

  return data;
};