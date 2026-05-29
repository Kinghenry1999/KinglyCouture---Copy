// controllers/addressController.js
import * as Address from "../models/Address.js";

export const createAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const address = await Address.createAddress(userId, req.body);
    res.status(201).json(address);
  } catch (error) {
    console.error("CREATE ADDRESS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await Address.getAddressesByUser(userId);
    res.json(addresses);
  } catch (error) {
    console.error("GET ADDRESSES ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const address = await Address.getAddressById(addressId, userId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.json(address);
  } catch (error) {
    console.error("GET ADDRESS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const address = await Address.updateAddress(addressId, userId, req.body);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.json(address);
  } catch (error) {
    console.error("UPDATE ADDRESS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const deleted = await Address.deleteAddress(addressId, userId);
    if (!deleted) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.json({ message: "Address deleted" });
  } catch (error) {
    console.error("DELETE ADDRESS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const address = await Address.setDefaultAddress(addressId, userId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.json(address);
  } catch (error) {
    console.error("SET DEFAULT ADDRESS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};