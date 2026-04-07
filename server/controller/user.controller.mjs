import sendOTP from "../models/sendMail.js";
import Bus from "../models/bus.js";
import Booking from "../models/booking.js";
import jwt from "jsonwebtoken";

export async function SearchBuses (req, res)  {
  try {
    const { source, destination, date } = req.query;
   
    if (!source || !destination || !date) {
      return res.status(400).json({ message: "Missing search params" });
    }

    const buses = await Bus.find();
    const result = [];

    const selectedDate = new Date(date);
    const dayName = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
  
    for (let bus of buses) {
    
      const stops = bus.routeStops;
      const startIndex = stops.findIndex(
        (stop) => stop.toLowerCase() === source.toLowerCase()
      );

      const endIndex = stops.findIndex(
        (stop) => stop.toLowerCase() === destination.toLowerCase()
      );
      
      if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
        continue;
      }
      let status = "AVAILABLE";
      let reason = "";

      if (bus.disabledDates.includes(date)) {
        status = "NOT_RUNNING";
        reason = "Bus not available on this date";
      }

      else if (
        bus.scheduleType === "SpecificDays" &&
        !bus.daysOfWeek.includes(dayName)
      ) {
        status = "NOT_RUNNING";
        reason = `Runs only on ${bus.daysOfWeek.join(", ")}`;
      }
      else if (
        bus.scheduleType === "SpecificDates" &&
        !bus.specificDates.includes(date)
      ) {
        status = "NOT_RUNNING";
        reason = "Not scheduled on this date";
      }

      let availableSeats = 0;

      if (status === "AVAILABLE") {
        const bookings = await Booking.find({
          busId: bus._id,
          date,
          status: "Booked",
        });

        for (let seat = 1; seat <= bus.totalSeats; seat++) {
          let isBooked = false;

          for (let booking of bookings) {
            const existingStart = stops.indexOf(booking.startStop);
            const existingEnd = stops.indexOf(booking.endStop);

            const conflict =
              startIndex < existingEnd &&
              endIndex > existingStart;

            if (booking.seatNumber === seat && conflict) {
              isBooked = true;
              break;
            }
          }

          if (!isBooked) availableSeats++;
        }

        if (availableSeats === 0) {
          status = "FULL";
          reason = "No seats available";
        }
      }

      result.push({
        ...bus.toObject(),
        status,
        reason,
        availableSeats,

        scheduleInfo: {
          type: bus.scheduleType,
          days: bus.daysOfWeek,
          dates: bus.specificDates,
        },
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({
      message: "Search failed",
      error: err.message,
    });
  }
}

export async function BookSeat (req, res)  {
  try {
    const {
      name,
      email,
      phone,
      busId,
      startStop,
      endStop,
      seatNumber,
      date
    } = req.body;

    
    if (
      !name || !email || !phone ||
      !busId || !startStop || !endStop ||
      !seatNumber || !date
    ) {
      console.log(req.body);
      return res.status(400).json({ message: "All fields are required" });
    }

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    const stops = bus.routeStops;

    const startIndex = stops.findIndex(
      (stop) => stop.toLowerCase() === startStop.toLowerCase()
    );

    const endIndex = stops.findIndex(
      (stop) => stop.toLowerCase() === endStop.toLowerCase()
    );

    if (startIndex === -1 || endIndex === -1) {
      return res.status(400).json({ message: "Invalid stops selected" });
    }

    if (startIndex >= endIndex) {
      return res.status(400).json({
        message: "End stop must come after start stop"
      });
    }


    const selectedDate = new Date(date);
    const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" });
  
    if (bus.disabledDates.includes(date)) {
      return res.status(400).json({
        message: "Bus not available on this date"
      });
    }

    if (bus.scheduleType === "SpecificDays") {
      if (!bus.daysOfWeek.includes(dayName)) {
        return res.status(400).json({
             message: "Bus does not run on " + dayName +  ". It runs every " + bus.daysOfWeek + "."
        });
      }
    }

    if (bus.scheduleType === "SpecificDates") {
      if (!bus.specificDates.includes(date)) {
        return res.status(400).json({
          message: "Bus not scheduled on this date"
        });
      }
    }

    if (seatNumber < 1 || seatNumber > bus.totalSeats) {
      return res.status(400).json({
        message: "Invalid seat number"
      });
    }


    const existingBookings = await Booking.find({
      busId,
      travelDate:date,
      seatNumber,
      status: "Booked"
    });
   
     for (let booking of existingBookings) {
     
      const existingStartIndex = stops.findIndex(
        s => s.trim().toLowerCase() === booking.startStop.trim().toLowerCase()
      );

      const existingEndIndex = stops.findIndex(
        s => s.trim().toLowerCase() === booking.endStop.trim().toLowerCase()
      );
      const isConflict =
        (startIndex < existingEndIndex) &&
        (endIndex > existingStartIndex);

      if (isConflict) {
        return res.status(400).json({
          message: `Seat ${seatNumber} already booked for selected segment`
        });
      }
    }

    const totalStops = stops.length - 1;
    const segmentDistance = endIndex - startIndex;

    const price = Math.round(
      (segmentDistance / totalStops) * bus.basePrice
    );

    const booking = new Booking({
      name,
      email,
      phone,
      busId,
      startStop,
      endStop,
      seatNumber,
       travelDate: date,
      price
    });

    await booking.save();

    res.status(201).json({
      message: "Booking successful",
      booking
    });

  } catch (error) {
    res.status(500).json({
      message: "Booking failed",
      error: error.message
    });
  }
}

export async function CheckSeatAvailability (req, res)  {
  try {
    const { busId, travelDate, startStop, endStop } = req.query;

    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    const stops = bus.routeStops;

    const startIndex = stops.indexOf(startStop);
    const endIndex = stops.indexOf(endStop);

    const bookings = await Booking.find({
      busId,
      travelDate,
      status: "Booked"
    });

    let bookedSeats = [];

    for (let booking of bookings) {
      const existingStart = stops.indexOf(booking.startStop);
      const existingEnd = stops.indexOf(booking.endStop);

      const isConflict =
        (startIndex < existingEnd) &&
        (endIndex > existingStart);

      if (isConflict) {
        bookedSeats.push(booking.seatNumber);
      }
    }

    res.json({
      totalSeats: bus.totalSeats,
      bookedSeats
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch seats",
      error: error.message
    });
  }
}

export async function GetBusByID (req, res) {
  try {
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({ message: "Bus not found" });
    }

    res.json(bus);

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch bus",
      error: error.message
    });
  }
}

const otpStore = {};
export async function SendOtp(req, res)  {
  
  const { email,journey } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(otp);
  otpStore[email] = {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  };

  try {
    await sendOTP(email, otp,journey,"BOOKING");

    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
}

export async function VerifyOtp (req, res)  {
  const { email, otp } = req.body;
  
  const record = otpStore[email];
  
  if (!record) {
    return res.status(400).json({ message: "OTP not found" });
  }

  if (Date.now() > record.expiresAt) {
    return res.status(400).json({ message: "OTP expired" });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  delete otpStore[email];

  res.json({ success: true });
}

export async function GetAllBuses (req, res){
  try {
    const response = await fetch("https://api.kosontechnology.com/country-state-city.php?country=IN&state=GJ&city=all");
    const data = await response.json();
    res.status(200).json(data);


  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch buses",
      error: error.message
    });
  }
}

export async function TrackTicketSendOTP (req, res) {
  try {
    const { email, phone } = req.body;

    let userEmail = email;
    let lastBooking = null;

    if (phone) {
      lastBooking = await Booking.findOne({ phone })
        .sort({ createdAt: -1 });

      if (!lastBooking) {
        return res.status(404).json({
          message: "No booking found with this phone number"
        });
      }

      userEmail = lastBooking.email;
    }else{
      lastBooking = await Booking.findOne({ email })
        .sort({ createdAt: -1 })
        
      if (!lastBooking) {
        return res.status(404).json({
          message: "No booking found with this Email"
        });
      }
    }

    if (!userEmail) {
      
      return res.status(400).json({
        message: "Email or Phone is required"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(otp);
    otpStore[userEmail] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    const journey = lastBooking
      ? {
          name: lastBooking.name,
          source: lastBooking.startStop,
          destination: lastBooking.endStop,
          date: lastBooking.travelDate,
          seats: [lastBooking.seatNumber],
          totalPrice: lastBooking.price,
        }
      : null;

    await sendOTP(userEmail, otp, journey, "TRACK");

    res.json({
      success: true,
      message: "OTP sent successfully",
      email: userEmail 
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to process request",
      error: error.message
    });
  }
}

export async function TrackTicketVerifyOTP(req, res)  {
  try {
    const { email, phone, otp } = req.body;

    let userEmail = email;
    let type = "email";

    if (phone) {
      type = "phone";

      const lastBooking = await Booking.findOne({ phone })
        .sort({ createdAt: -1 });

      if (!lastBooking) {
        return res.status(404).json({
          message: "No booking found with this phone number"
        });
      }

      userEmail = lastBooking.email;
    }

    if (!userEmail || !otp) {
      return res.status(400).json({
        message: "Email/Phone and OTP are required"
      });
    }

    const record = otpStore[userEmail];

    if (!record) {
      return res.status(400).json({ message: "OTP not found" });
    }

    if (Date.now() > record.expiresAt) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    delete otpStore[userEmail];

    const accessToken = jwt.sign(
      { email: userEmail },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { email: userEmail },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    const bookings = await Booking.find({ email: userEmail }).sort({
      createdAt: -1
    });

    if (!bookings.length) {
      return res.status(404).json({
        message: "No bookings found"
      });
    }

    res.json({
      success: true,
      type, 
      accessToken,
      refreshToken,
      bookings
    });

  } catch (error) {
    res.status(500).json({
      message: "Error verifying ticket",
      error: error.message
    });
  }
}

export async function GenerateNewAccessToken (req, res)  {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const newAccessToken = jwt.sign(
      { email: decoded.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });

  } catch (err) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
}

export async function CancelTicket (req, res)  {
  const { bookingId } = req.body;

  const booking = await Booking.findOne({
    _id: bookingId,
    email: req.user.email
  });

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  const today = new Date();
  const travelDate = new Date(booking.travelDate);

  if (travelDate <= today) {
    return res.status(400).json({
      message: "Cannot cancel past bookings"
    });
  }

  booking.status = "Cancelled";
  await booking.save();

  res.json({ message: "Cancelled successfully" });
}
export async function UpdateBooking(req, res) {
  try {
    const { bookingId, travelDate, seatNumber } = req.body;

    const booking = await Booking.findOne({
      _id: bookingId,
      email: req.user.email
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "Cancelled") {
      return res.status(400).json({
        message: "Cannot update cancelled booking"
      });
    }

    const today = new Date();
    if (new Date(booking.travelDate) <= today) {
      return res.status(400).json({
        message: "Cannot update past bookings"
      });
    }

    // update fields
    if (travelDate) booking.travelDate = travelDate;
    if (seatNumber) booking.seatNumber = seatNumber;

    await booking.save();

    res.json({
      success: true,
      message: "Booking updated",
      booking
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}
export function verifyUserToken  (req, res) {
  try {
   const token = req.headers.authorization?.split(" ")[1];
  
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
   
    return res.status(200).json({
      success: true,
      user: decoded, 
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      err
    });
  }
}
export async function GetMyBookings(req, res) {
  try {
    
    const bookings = await Booking.find({
      email: req.user.email
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      bookings
    });

  } catch (err) {
   
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}