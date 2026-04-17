import express from "express";
import {
  SearchCities,
  RequestCity,
  GetPendingLocations,
  ApproveLocation,
  GetPointsByCity,
  GetAllCitiesWithPoints,
} from "../controller/location.controller.mjs";
import { verifyToken, requireRole } from "../middleware/auth.middleware.mjs";

export default function locationRoutes(router) {
  const locRouter = express.Router();

  locRouter.get("/cities", SearchCities);

  locRouter.get("/cities-with-points", GetAllCitiesWithPoints);

  locRouter.get("/cities/:cityId/points", GetPointsByCity);

  locRouter.post(
    "/city",
    verifyToken,
    requireRole(["OPERATOR", "ADMIN"]),
    RequestCity,
  );

  locRouter.get(
    "/pending",
    verifyToken,
    requireRole(["ADMIN"]),
    GetPendingLocations,
  );
  locRouter.post(
    "/approve",
    verifyToken,
    requireRole(["ADMIN"]),
    ApproveLocation,
  );

  router.use("/locations", locRouter);
}
