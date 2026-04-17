import City from "../models/city.js";
import Point from "../models/point.js";

export async function SearchCities(req, res) {
  try {
    const { q } = req.query;
    let filter = { status: "APPROVED" };

    if (q) {
      filter.name = { $regex: q, $options: "i" };
    }

    // Limit to 20 to avoid huge payloads from large collections
    const cities = await City.find(filter)
      .limit(20)
      .select("name state normalizedName");
    res.json(cities);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cities", error });
  }
}

export async function RequestCity(req, res) {
  try {
    const { name, state } = req.body;

    // Check if it already exists (normalized)
    const normalizedName = name.toLowerCase().replace(/\s+/g, "");
    const exists = await City.findOne({ normalizedName });
    if (exists) {
      return res.status(400).json({ message: "City already exists." });
    }

    const newCity = new City({
      name,
      normalizedName,
      state: state || "GJ",
      status: "PENDING",
    });

    await newCity.save();
    res
      .status(201)
      .json({
        message: "City requested successfully and is pending admin approval.",
        city: newCity,
      });
  } catch (error) {
    res.status(500).json({ message: "Error requesting city", error });
  }
}

export async function GetPendingLocations(req, res) {
  try {
    const cities = await City.find({ status: "PENDING" });
    const points = await Point.find({ status: "PENDING" }).populate(
      "cityId",
      "name",
    );

    res.json({ cities, points });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching pending locations", error });
  }
}

export async function ApproveLocation(req, res) {
  try {
    const { id, type, action } = req.body; // action: 'APPROVE' | 'REJECT'

    const status = action === "APPROVE" ? "APPROVED" : "REJECTED";
    let updated;

    if (type === "CITY") {
      if (status === "REJECTED") {
        updated = await City.findByIdAndDelete(id);
      } else {
        updated = await City.findByIdAndUpdate(id, { status }, { new: true });
      }
    } else if (type === "POINT") {
      if (status === "REJECTED") {
        updated = await Point.findByIdAndDelete(id);
      } else {
        updated = await Point.findByIdAndUpdate(id, { status }, { new: true });
      }
    }

    if (!updated) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.json({
      message: `Location ${action.toLowerCase()}ed successfully.`,
      location: updated,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating location", error });
  }
}

export async function GetPointsByCity(req, res) {
  try {
    const { cityId } = req.params;
    const points = await Point.find({ cityId, status: "APPROVED" }).select(
      "_id name fullName",
    );
    res.json(points);
  } catch (error) {
    res.status(500).json({ message: "Error fetching points", error });
  }
}

export async function GetAllCitiesWithPoints(req, res) {
  try {
    const cities = await City.find({ status: "APPROVED" }).select(
      "_id name state",
    );
    const citiesWithPoints = await Promise.all(
      cities.map(async (city) => {
        const points = await Point.find({
          cityId: city._id,
          status: "APPROVED",
        }).select("_id name fullName");
        return { ...city.toObject(), points };
      }),
    );
    res.json(citiesWithPoints);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching cities with points", error });
  }
}
