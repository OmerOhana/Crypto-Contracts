// export const CONSTRACT_ADDRESS = "0xAD61C0797f588edc64fD2b3D1A10960FaA7aE804";
export const CONSTRACT_ADDRESS = "0xdb725f6EC545bE0144F5986FB432a0C290d81564";

export const CONSTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_time",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_seller",
        type: "address",
      },
      {
        internalType: "address",
        name: "_buyer",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_roomNumber",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_apartmentNumber",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_apartmentFloor",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_apartmentStreet",
        type: "string",
      },
      {
        internalType: "string",
        name: "_apartmentCity",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_money",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_conHash",
        type: "string",
      },
      {
        internalType: "string",
        name: "_prevConHash",
        type: "string",
      },
    ],
    name: "createContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_time",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_id",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_seller",
        type: "address",
      },
      {
        internalType: "address",
        name: "_buyer",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_roomNumber",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_apartmentNumber",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_apartmentFloor",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_apartmentStreet",
        type: "string",
      },
      {
        internalType: "string",
        name: "_apartmentCity",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_money",
        type: "uint256",
      },
    ],
    name: "updateContract",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "contractCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "contracts",
    outputs: [
      {
        internalType: "string",
        name: "time",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "seller",
        type: "address",
      },
      {
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "roomNumber",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "apartmentNumber",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "apartmentFloor",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "apartmentStreet",
        type: "string",
      },
      {
        internalType: "string",
        name: "apartmentCity",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "money",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "hashContracts",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "conHash",
        type: "string",
      },
      {
        internalType: "string",
        name: "prevConHash",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
