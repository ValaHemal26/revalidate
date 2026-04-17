import Bus from "../models/bus.js";

// Create Bus (Admin or Operator)
export async function CreateBus(req, res) {
  try {
    const busParams = req.body;
    // Set operator id if not an admin doing it
    if (req.user.role === "OPERATOR") {
      busParams.operatorId = req.user.userId;
    }
    const bus = new Bus(busParams);
    await bus.save();
    res.status(201).json(bus);
  } catch (err) {
    res.status(500).json({ message: "Failed to create bus", error: err.message });
  }
}

// Update Bus
export async function UpdateBus(req, res) {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ message: "Not found" });

    if (req.user.role === "OPERATOR" && bus.operatorId?.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    Object.assign(bus, req.body);
    await bus.save();
    res.json(bus);
  } catch (err) {
    res.status(500).json({ message: "Failed to update error", error: err.message });
  }
}

// Delete Bus
export async function DeleteBus(req, res) {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ message: "Not found" });

    if (req.user.role === "OPERATOR" && bus.operatorId?.toString() !== req.user.userId) {
       return res.status(403).json({ message: "Forbidden" });
    }

    await Bus.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Bus deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete", error: err.message });
  }
}

// Get All Fleet
export async function GetFleet(req, res) {
  try {
    let query = {};
    if (req.user.role === "OPERATOR") {
      query.operatorId = req.user.userId;
    }
    const fleet = await Bus.find(query);
    res.json(fleet);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch fleet", error: err.message });
  }
}
