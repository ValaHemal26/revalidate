import express from "express";
import {
  AdminDashboard,
  AdminGetAllBuses,
  AdminGetBusById,
  AdminCreateBus,
  AdminUpdateBus,
  AdminDeleteBus,
  AdminGetAllBookings,
  AdminCancelBooking,
  AdminGetAllOperators,
  AdminGetAllUsers,
  AdminApproveOperator,
  AdminBlockUser,
  AdminUnblockUser,
  AdminGetProfile,
  AdminUpdateProfile,
  AdminGetPendingLocations,
  AdminApproveLoc,
} from "../controller/admin.controller.mjs";
import { verifyToken, requireRole } from "../middleware/auth.middleware.mjs";

const adminMiddleware = [verifyToken, requireRole(["ADMIN"])];

export default function adminRoutes(router) {
  // Dashboard
  router.get("/admin/dashboard", adminMiddleware, AdminDashboard);

  // Bus Management
  router.get("/admin/buses", adminMiddleware, AdminGetAllBuses);
  router.get("/admin/buses/:id", adminMiddleware, AdminGetBusById);
  router.post("/admin/buses", adminMiddleware, AdminCreateBus);
  router.put("/admin/buses/:id", adminMiddleware, AdminUpdateBus);
  router.delete("/admin/buses/:id", adminMiddleware, AdminDeleteBus);

  // Booking Management
  router.get("/admin/bookings", adminMiddleware, AdminGetAllBookings);
  router.put("/admin/bookings/:id/cancel", adminMiddleware, AdminCancelBooking);

  // Operator Management
  router.get("/admin/operators", adminMiddleware, AdminGetAllOperators);
  router.put("/admin/operators/:id/approve", adminMiddleware, AdminApproveOperator);

  // User Management
  router.get("/admin/users", adminMiddleware, AdminGetAllUsers);
  router.put("/admin/users/:id/block", adminMiddleware, AdminBlockUser);
  router.put("/admin/users/:id/unblock", adminMiddleware, AdminUnblockUser);

  // Admin Profile
  router.get("/admin/profile", adminMiddleware, AdminGetProfile);
  router.put("/admin/profile", adminMiddleware, AdminUpdateProfile);

  // Location Requests
  router.get("/admin/pending-locations", adminMiddleware, AdminGetPendingLocations);
  router.post("/admin/locations/:id/approve", adminMiddleware, AdminApproveLoc);
}
