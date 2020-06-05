const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const contractSchema = new Schema(
  {
    contractId: {
      type: Number,
      required: true
    },
    seller: {
      type: String,
      required: true,
      trim: true
    },
    buyer: {
      type: String,
      required: true,
      trim: true
    },
    roomNumber: {
      type: Number,
      required: true
    },
    apartmentNumber: {
      type: Number,
      required: true
    },
    apartmentFloor: {
      type: Number,
      required: true
    },
    apartmentStreet: {
      type: String,
      required: true,
      trim: true
    },
    apartmentCity: {
      type: String,
      required: true,
      trim: true
    },
    money: {
      type: Number,
      required: true
    },
    sellerApprove: {
      type: Boolean,
      required: true
    },
    buyerApprove: {
      type: Boolean,
      required: true
    },
    status: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Contract = mongoose.model("Contract", contractSchema);

module.exports = Contract;
