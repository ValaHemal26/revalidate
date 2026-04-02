const API_URL = "http://localhost:5000/api/v1/user";

export async function searchBuses(source: string, destination: string, date: string) {
  const res = await fetch(
    API_URL + "/search-buses?source=" + source + "&destination=" + destination + "&date=" + date
  );

  const data = await res.json();

  return {
    success: res.ok,
    data,
  };
}

export async function fetchBuses() {
  
  const res = await fetch(API_URL + "/buses",{
    method: "GET",
   
  });
  if (!res.ok) throw new Error("Failed to fetch buses");
  return res.json();
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

export async function sendOtp(email: string, journey: any) {
  const res = await fetch(API_URL + "/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, journey }),
  });

  const data = await res.json();

  return { success: res.ok, data };
}
export async function verifyOtp(email: string, otp: string) {
  const res = await fetch(API_URL + "/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  const data = await res.json();

  return {
    success: res.ok,
    data,
  };
}

export async function setSendTicketOTP(type,value){
  const res = await fetch(API_URL + "/track-ticket-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        type === "email"
          ? { email: value }
          : { phone: value }
      ),
    });
  
  const data = await res.json();
  
  return data;
}

export async function verifyTicketOtp(user,otp) {
  console.log(user.userEmail);
  const res = await fetch(API_URL + "/track-ticket-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.userEmail,
          otp: otp,
        }),
      });
   
   return await res.json();

}


