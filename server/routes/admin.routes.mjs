import * as controller from "../controller/admin.controller.mjs";
import { verifyAdminToken } from "../helper.js";

export default function admin_routes(apiRouter,){

    apiRouter.post("/login",controller.AdminLogin);
    apiRouter.post("/addbus",verifyAdminToken,controller.AddBus);

    apiRouter.put("/editBus/:id",verifyAdminToken,controller.EditBus);
    apiRouter.put("/cancelBooking/:id",verifyAdminToken,controller.CancelBooking);

    apiRouter.delete("/deleteBus/:id",verifyAdminToken,controller.DeleteBus);

    apiRouter.get("/buses",verifyAdminToken,controller.GetAllBuses);
    apiRouter.get("/bus/:id",verifyAdminToken,controller.GetBusByID);
    apiRouter.get("/dashboard",verifyAdminToken,controller.GetDashboard);
    apiRouter.get("/bookings",verifyAdminToken,controller.GetAllBookings);
}