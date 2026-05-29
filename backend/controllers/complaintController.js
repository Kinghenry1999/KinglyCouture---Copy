// backend/controllers/complaintController.js
import * as Complaint from "../models/Complaint.js";

// Public: submit a complaint
export const submitComplaint = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const complaint = await Complaint.createComplaint(name, email, message);
    res.status(201).json({ message: "Complaint submitted successfully", complaint });
  } catch (error) {
    console.error("SUBMIT COMPLAINT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: get all complaints
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.getAllComplaints();
    res.json(complaints);
  } catch (error) {
    console.error("GET COMPLAINTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: respond to a complaint
export const respondComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ message: "Response message is required" });
    }

    const updated = await Complaint.respondToComplaint(id, response);
    if (!updated) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.json({ message: "Response added", complaint: updated });
  } catch (error) {
    console.error("RESPOND COMPLAINT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: delete a complaint
export const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    await Complaint.deleteComplaint(id);
    res.json({ message: "Complaint deleted" });
  } catch (error) {
    console.error("DELETE COMPLAINT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};