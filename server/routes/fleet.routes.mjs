import express from "express";
import { CreateBus, UpdateBus, DeleteBus, GetFleet } from "../controller/fleet.controller.mjs";
import { verifyToken, requireRole } from "../middleware/auth.middleware.mjs";

export default function fleetRoutes(router) {
  // Routes for ADMIN and OPERATOR
  router.post("/fleet", verifyToken, requireRole(["ADMIN", "OPERATOR"]), CreateBus);
  router.get("/fleet", verifyToken, requireRole(["ADMIN", "OPERATOR"]), GetFleet);
  router.put("/fleet/:id", verifyToken, requireRole(["ADMIN", "OPERATOR"]), UpdateBus);
  router.delete("/fleet/:id", verifyToken, requireRole(["ADMIN", "OPERATOR"]), DeleteBus);
}
