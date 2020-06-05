import React, { useEffect, useState, useRef } from "react";
import Web3 from "web3";
import axios from "axios";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import { CONSTRACT_ADDRESS, CONSTRACT_ABI } from "../blockchainConfig";

var web3;
var blockchainContract;
var accounts;

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function ActiveContracts(props) {
  const [contracts, setContracts] = useState([]);
  const [contractsUpdate, setContractsUpdate] = useState([]);
  const [accountAddress, setAccountAddress] = useState("");
  const [username, setUsername] = useState("");
  const [path, setPath] = useState("");
  const [flag, setFlag] = useState(false);

  // blockchain connect
  async function loadBlockchain(myAccount) {
    try {
      web3 = new Web3(Web3.givenProvider || "http://localhost::8545");
      // const network = await web3.eth.net.getNetworkType(); // network is ropsten
      accounts = await web3.eth.getAccounts();
      // console.log(
      //   "successfully connected to the blockchain, your user address",
      //   accounts[0]
      // );
      // get metamask current login account
      // setMetamaskAccount(accounts[0]);

      blockchainContract = new web3.eth.Contract(
        CONSTRACT_ABI,
        CONSTRACT_ADDRESS
      );
      // console.log("CryptoContract on the blockchain->", blockchainContract);
      const constractsCount = await blockchainContract.methods
        .contractCount()
        .call();
      // console.log("count right now->", constractsCount);

      for (let item = 0; item < constractsCount; item++) {
        const housetContract = await blockchainContract.methods
          .contracts(item)
          .call();
        if (
          housetContract.seller === myAccount ||
          housetContract.buyer === myAccount
        ) {
          setContracts((prevState) => [
            ...prevState,
            {
              time: housetContract.time,
              id: housetContract.id,
              seller: housetContract.seller,
              buyer: housetContract.buyer,
              roomNumber: housetContract.roomNumber,
              apartmentNumber: housetContract.apartmentNumber,
              apartmentFloor: housetContract.apartmentFloor,
              apartmentStreet: housetContract.apartmentStreet,
              apartmentCity: housetContract.apartmentCity,
              money: housetContract.money,
              sellerApprove: housetContract.sellerApprove,
              buyerApprove: housetContract.buyerApprove,
            },
          ]);
        }
      }
      setFlag(true);
    } catch (error) {}
  }
  // Check for updates in blockchain contracts
  async function checkForBlockchainUpdates() {
    try {
      const constractsCount = await blockchainContract.methods
        .contractCount()
        .call();

      setContractsUpdate([]);

      for (let item = 0; item < constractsCount; item++) {
        const housetContract = await blockchainContract.methods
          .contracts(item)
          .call();
        if (
          housetContract.seller === accountAddress ||
          housetContract.buyer === accountAddress
        ) {
          setContractsUpdate((prevState) => [
            ...prevState,
            {
              time: housetContract.time,
              id: housetContract.id,
              seller: housetContract.seller,
              buyer: housetContract.buyer,
              roomNumber: housetContract.roomNumber,
              apartmentNumber: housetContract.apartmentNumber,
              apartmentFloor: housetContract.apartmentFloor,
              apartmentStreet: housetContract.apartmentStreet,
              apartmentCity: housetContract.apartmentCity,
              money: housetContract.money,
              sellerApprove: housetContract.sellerApprove,
              buyerApprove: housetContract.buyerApprove,
            },
          ]);
        }
        setFlag(true);
      }
    } catch (error) {}
  }

  // axios config
  const config = {
    withCredentials: true,
    // baseURL: "http://localhost:5000/",
    baseURL: process.env.REACT_APP_BASE_URL + ":5000/",
    headers: {
      "Content-Type": "application/json",
    },
  };

  // init
  useEffect(() => {
    axios
      .get("/", config)
      .then((res) => {
        if (
          res !== null &&
          "passport" in res.data &&
          "user" in res.data.passport
        ) {
          // console.log("user is->", res.data);
          setUsername(res.data.passport.user);
        } else {
          setPath("/login");
        }

        axios
          .get("/user/" + res.data.passport.user, config)
          .then((res) => {
            if (res !== null) {
              setAccountAddress(res.data.accountAddress);
              const myAccount = res.data.accountAddress;
              loadBlockchain(myAccount);
            }
          })
          .catch((error) => {
            console.log("err!->", error);
          });
      })
      .catch((error) => {
        console.log("err!->", error);
      });
  }, []);

  // check for ready contracts
  useInterval(() => {
    // Your custom logic here
    checkForBlockchainUpdates();
    if (contractsUpdate.length > 0) {
      setContracts(contractsUpdate);
    }
  }, 1000 * 10);

  const moneyFormatter = (cell, row) => {
    return numberWithCommas(cell) + " $";
  };

  const columns = [
    {
      dataField: "id",
      text: "#",
    },
    {
      dataField: "apartmentStreet",
      text: "Street",
    },
    {
      dataField: "apartmentCity",
      text: "City",
    },
    {
      dataField: "apartmentNumber",
      text: "Apt.Num",
    },
    {
      dataField: "apartmentFloor",
      text: "Floor",
    },
    {
      dataField: "roomNumber",
      text: "Rooms",
    },
    {
      dataField: "money",
      text: "Money",
      formatter: moneyFormatter,
    },
  ];

  const customTotal = (from, to, size) => (
    <span className="react-bootstrap-table-pagination-total">
      Showing {from} to {to} of {size} Results
    </span>
  );

  const options = {
    sizePerPage: 5,
    hideSizePerPage: true,
    hidePageListOnlyOnePage: true,
    prePageText: "Previous",
    nextPageText: "Next",
    alwaysShowAllBtns: true,
    withFirstAndLast: false,
    showTotal: true,
    paginationTotalRenderer: customTotal,
  };

  const rowStyle = {
    textOverflow: "ellipsis",
    overflow: "scroll",
    // width: "1%"
  };

  return (
    <div>
      {flag && (
        <BootstrapTable
          className="table"
          keyField="id"
          data={contracts}
          columns={columns}
          pagination={paginationFactory(options)}
          responsive
          striped
          hover
          // rowStyle={rowStyle}
          bootstrap4
          condensed
        />
      )}
    </div>
  );
}

export default ActiveContracts;
