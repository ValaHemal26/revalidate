const API_URL = "http://localhost:5000/api/v1/user";
import Cookies from "js-cookie";
const refreshtoken = Cookies.get("userRefreshToken");

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
}

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

export async function getMyBookings(token, page = 1, limit = 5) {
 
  try {
    if (!token) {
      const refreshRes = await getNewAccessToken();

      if (!refreshRes.success) {
        return refreshRes;
      }

      token = refreshRes.token;
    }
    const res = await fetch(
      API_URL + "/my-bookings?page=" + page + "&limit=" + limit,
      {
        method: "GET",
        headers: {
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      return {
        success: false,
        message: "Failed to fetch bookings",
        status: res.status,
      };
    }

    return await res.json();

  } catch (error) {
      return {
        success: false,
        message: error.message || "Something went wrong. Please try again.",
      };
  }
}

export async function checkSeatAvailability(booking,date) {
  try {
        const res = await fetch(API_URL + "/seatAvailability?busId="+ booking.busId +"&travelDate="+ 
          date + "&startStop=" + booking.startStop + "&endStop=" + booking.endStop
        );
       const data = await res.json();
       return data;
    } catch (err) {
       return {
        success: false,
        err
       }
    }
}

async function getNewAccessToken() {
  try {
    if (!refreshtoken) {
      throw new Error("Refresh Token Not found");
    }

    const res = await fetch(API_URL + "/refresh-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: refreshtoken,
      }),
    });

    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        message: "Failed to refresh token",
      };
    }

    const data = await res.json();

    // ✅ Set cookie with 15 min expiry
    document.cookie = `userToken=${data.accessToken}; max-age=900; path=/`;

    return {
      success: true,
      token: data.accessToken,
    };

  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}


export async function updateBooking(token, updatedData) {
   if (!token) {
    
    const refreshRes = await getNewAccessToken();

    if (!refreshRes.success) {
      return refreshRes;
    }

    token = refreshRes.token;
  }
  const res = await fetch(API_URL + "/update-booking", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update booking");
  }

  return data;
}

export async function cancelBooking(token, bookingId) {
  const res = await fetch(API_URL +"/cancel-booking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ bookingId }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Cancel failed");
  }

  return data;
}