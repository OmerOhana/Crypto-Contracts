const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const contractsRequestSchema = new Schema({
  contractId: {
    type: Number,
    required: true,
  },
  seller: {
    type: String,
    required: true,
    trim: true,
  },
  buyer: {
    type: String,
    required: true,
    trim: true,
  },
  meesage: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});

const userSchema = new Schema(
  {
    accountAddress: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    contracts: {
      type: [Object],
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
