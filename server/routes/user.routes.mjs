import * as controller from "../controller/user.controller.mjs";
import {verifyToken} from "../helper.js";

export default function user_routes(apiRouter){

    apiRouter.post("/bookSeat",controller.BookSeat);
    apiRouter.post("/send-otp",controller.SendOtp);
    apiRouter.post("/verify-otp",controller.VerifyOtp);
    apiRouter.post("/track-ticket-request",controller.TrackTicketSendOTP);
    apiRouter.post("/track-ticket-verify",controller.TrackTicketVerifyOTP);
    apiRouter.post("/refresh-token",controller.GenerateNewAccessToken);
    apiRouter.post("/cancel-booking",verifyToken,controller.CancelTicket);
    apiRouter.post("/update-booking",verifyToken,controller.UpdateBooking);
    
    apiRouter.get("/my-bookings", verifyToken, controller.GetMyBookings);
    apiRouter.get("/verify-token",controller.verifyUserToken);
    apiRouter.get("/search-buses",controller.SearchBuses);
    apiRouter.get("/seatAvailability",controller.CheckSeatAvailability);
    apiRouter.get("/bus/:id",controller.GetBusByID);
    apiRouter.get("/buses",controller.GetAllBuses);
}