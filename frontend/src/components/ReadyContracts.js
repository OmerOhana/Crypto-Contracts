import React, { useEffect, useState, useRef } from "react";
import Web3 from "web3";
import axios from "axios";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import { CONSTRACT_ADDRESS, CONSTRACT_ABI } from "../blockchainConfig";
import SHA256 from "sha256-es";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Toast from "react-bootstrap/Toast";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import Col from "react-bootstrap/Col";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";

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

function ReadyContracts(props) {
  // const [showChild, setShowChild] = useState(false);
  // const [path, setPath] = useState("");
  // const [username, setUsername] = useState("");
  const [readyContracts, setReadyContracts] = useState([]);
  const [accountAddress, setAccountAddress] = useState("");
  // const [currentContract, setCurrentContract] = useState("");
  const [contractInfo, setContractInfo] = useState({
    time: "",
    id: "",
    seller: "",
    buyer: "",
    roomNumber: 0,
    apartmentNumber: 0,
    floor: 0,
    street: "",
    city: "",
    money: 0,
    sellerApprove: false,
    buyerApprove: false,
    status: "local",
  });
  const [contractInfoNotUpdate, setContractInfoNotUpdate] = useState({});
  const [showViewModal, setShowViewModal] = useState(false);
  const [isLoading1, setLoading1] = useState(false);
  const [isLoading2, setLoading2] = useState(false);
  const [buttonDisable1, setButtonDisable1] = useState(false);
  const [buttonDisable2, setButtonDisable2] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [emptyField, setEmptyField] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // blockchain connect
  async function loadBlockchain() {
    web3 = new Web3(Web3.givenProvider || "http://localhost::8545");
    // const network = await web3.eth.net.getNetworkType(); // network is ropsten
    accounts = await web3.eth.getAccounts();
    // console.log(
    //   "ready,successfully connected to the blockchain, your user address",
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

  useEffect(() => {
    loadBlockchain();
    // axios.defaults.baseURL = "http://localhost:5000/";
    axios
      .get("/", config)
      .then((res) => {
        if (
          res !== null &&
          "passport" in res.data &&
          "user" in res.data.passport
        ) {
          // console.log("ready user is->", res.data);
          // setUsername(res.data.passport.user);

          axios
            .get("/user/" + res.data.passport.user, config)
            .then((res) => {
              // console.log("readypage->>", res);
              const myAccount = res.data.accountAddress;
              setAccountAddress(res.data.accountAddress);

              axios.get("/contracts", config).then((res) => {
                for (let index = 0; index < res.data.length; index++) {
                  if (
                    res.data[index].status === "local" &&
                    (res.data[index].seller === myAccount ||
                      res.data[index].buyer === myAccount)
                  ) {
                    setReadyContracts((prevState) => [
                      {
                        id: res.data[index].contractId,
                        sellerApprove: res.data[index].sellerApprove ? (
                          <FontAwesomeIcon
                            icon={faCheck}
                            size="lg"
                            color="green"
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={faTimes}
                            size="lg"
                            color="#de2658"
                          />
                        ),
                        buyerApprove: res.data[index].buyerApprove ? (
                          <FontAwesomeIcon
                            icon={faCheck}
                            size="lg"
                            color="green"
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={faTimes}
                            size="lg"
                            color="#de2658"
                          />
                        ),
                        action: (
                          <Button
                            name={"btn_" + res.data[index].contractId}
                            size="sm"
                            onClick={(event) => {
                              setContractInfo({
                                time: res.data[index].createdAt,
                                id: res.data[index].contractId,
                                seller: res.data[index].seller,
                                buyer: res.data[index].buyer,
                                roomNumber: res.data[index].roomNumber,
                                apartmentNumber:
                                  res.data[index].apartmentNumber,
                                floor: res.data[index].apartmentFloor,
                                street: res.data[index].apartmentStreet,
                                city: res.data[index].apartmentCity,
                                money: res.data[index].money,
                                sellerApprove: res.data[index].sellerApprove,
                                buyerApprove: res.data[index].buyerApprove,
                                status: res.data[index].status,
                              });

                              setContractInfoNotUpdate({
                                time: res.data[index].createdAt,
                                id: res.data[index].contractId,
                                seller: res.data[index].seller,
                                buyer: res.data[index].buyer,
                                roomNumber: res.data[index].roomNumber,
                                apartmentNumber:
                                  res.data[index].apartmentNumber,
                                floor: res.data[index].apartmentFloor,
                                street: res.data[index].apartmentStreet,
                                city: res.data[index].apartmentCity,
                                money: res.data[index].money,
                                sellerApprove: res.data[index].sellerApprove,
                                buyerApprove: res.data[index].buyerApprove,
                                status: res.data[index].status,
                              });

                              //   setContractSeller(res.data[index].seller);
                              //   setContractBuyer(res.data[index].buyer);
                              // setCurrentContract(
                              //   event.target.name.split("_")[1]
                              // );
                              handleShowViewModal();
                            }}
                          >
                            View
                          </Button>
                        ),
                      },
                      ...prevState,
                    ]);
                  }
                }
              });
            })
            .catch((error) => {
              console.log("err!->", error);
            });
        } else {
          // setPath("/login");
        }
      })
      .catch((error) => {
        console.log("err!->", error);
      });

    // setShowChild(true);
  }, []);

  // check for ready contracts
  useInterval(() => {
    // Your custom logic here
    axios
      .get("/contracts", config)
      .then((res) => {
        setReadyContracts([]);
        for (let index = 0; index < res.data.length; index++) {
          if (
            res.data[index].status === "local" &&
            (res.data[index].seller === accountAddress ||
              res.data[index].buyer === accountAddress)
          ) {
            setReadyContracts((prevState) => [
              {
                id: res.data[index].contractId,
                sellerApprove: res.data[index].sellerApprove ? (
                  <FontAwesomeIcon icon={faCheck} size="lg" color="green" />
                ) : (
                  <FontAwesomeIcon icon={faTimes} size="lg" color="#de2658" />
                ),
                buyerApprove: res.data[index].buyerApprove ? (
                  <FontAwesomeIcon icon={faCheck} size="lg" color="green" />
                ) : (
                  <FontAwesomeIcon icon={faTimes} size="lg" color="#de2658" />
                ),
                action: (
                  <Button
                    name={"btn_" + res.data[index].contractId}
                    size="sm"
                    onClick={(event) => {
                      setContractInfo({
                        time: res.data[index].createdAt,
                        id: res.data[index].contractId,
                        seller: res.data[index].seller,
                        buyer: res.data[index].buyer,
                        roomNumber: res.data[index].roomNumber,
                        apartmentNumber: res.data[index].apartmentNumber,
                        floor: res.data[index].apartmentFloor,
                        street: res.data[index].apartmentStreet,
                        city: res.data[index].apartmentCity,
                        money: res.data[index].money,
                        sellerApprove: res.data[index].sellerApprove,
                        buyerApprove: res.data[index].buyerApprove,
                        status: res.data[index].status,
                      });

                      //   setContractSeller(res.data[index].seller);
                      //   setContractBuyer(res.data[index].buyer);
                      // setCurrentContract(event.target.name.split("_")[1]);
                      handleShowViewModal();
                    }}
                  >
                    View
                  </Button>
                ),
              },
              ...prevState,
            ]);
          }
        }
      })
      .catch((error) => {
        console.log("err!->", error);
      });
  }, 1000 * 10);

  const handleCloseViewModal = () => {
    setButtonDisable2(true);
    setEmptyField(false);
    setShowViewModal(false);
  };

  const handleShowViewModal = () => setShowViewModal(true);

  async function checkIfInBlockchain(contractInfo) {
    const constractsCount = await blockchainContract.methods
      .contractCount()
      .call();

    for (let item = 0; item < constractsCount; item++) {
      const housetContract = await blockchainContract.methods
        .contracts(item)
        .call();

      if (
        parseInt(housetContract.roomNumber) === contractInfo.roomNumber &&
        parseInt(housetContract.apartmentNumber) ===
          contractInfo.apartmentNumber &&
        parseInt(housetContract.apartmentFloor) === contractInfo.floor &&
        housetContract.apartmentStreet === contractInfo.street &&
        housetContract.apartmentCity === contractInfo.city
      ) {
        return true;
      }
    }
    return false;
  }

  const checkIfNumber = (x) => {
    try {
      return Number.isInteger(parseInt(x));
    } catch (error) {
      return false;
    }
  };

  const handleUpdate = (event) => {
    event.preventDefault();
    setButtonDisable2(true);
    setLoading2(true);

    if (contractInfo.roomNumber === -1) {
      contractInfo.roomNumber = 1;
    }

    if (
      contractInfo.apartmentNumber === -1 ||
      contractInfo.floor === -1 ||
      contractInfo.street === "none" ||
      contractInfo.city === "none" ||
      contractInfo.money === -1
    ) {
      setErrorText("You need to enter info in every input!");
      setEmptyField(true);
      setButtonDisable2(false);
      setLoading2(false);
    } else if (
      !checkIfNumber(contractInfo.apartmentNumber) ||
      !checkIfNumber(contractInfo.floor) ||
      !checkIfNumber(contractInfo.money)
    ) {
      setErrorText("You have error in one of the inputs!");
      setEmptyField(true);
      setButtonDisable2(false);
      setLoading2(false);
    } else if (
      !contractInfo.apartmentNumber ||
      !contractInfo.floor ||
      !contractInfo.street ||
      !contractInfo.city ||
      !contractInfo.money
    ) {
      setErrorText("You need to enter info in every input!");
      setEmptyField(true);
      setButtonDisable2(false);
      setLoading2(false);
    } else {
      contractInfo.roomNumber = parseInt(contractInfo.roomNumber);
      contractInfo.apartmentNumber = parseInt(contractInfo.apartmentNumber);
      contractInfo.floor = parseInt(contractInfo.floor);
      contractInfo.money = parseInt(contractInfo.money);

      checkIfInBlockchain(contractInfo).then((res) => {
        if (res) {
          setErrorText(
            "There is already a live contract with that apartment info!"
          );
          setEmptyField(true);
          setButtonDisable2(false);
          setLoading2(false);
        } else {
          if (accountAddress === contractInfo.seller) {
            contractInfo.sellerApprove = true;
            contractInfo.buyerApprove = false;
          } else {
            contractInfo.sellerApprove = false;
            contractInfo.buyerApprove = true;
          }

          axios
            .put("/contract/" + contractInfo.id, contractInfo, config)
            .then((res) => {
              // console.log("update looking good!");
              // console.log("status is->", res.data);
              setLoading2(false);
              setButtonDisable2(false);
              handleCloseViewModal(true);
              setErrorText("");
              setEmptyField(false);
            })
            .catch((error) => {
              setLoading2(false);
              setButtonDisable2(false);
            });
        }
      });
    }
  };

  async function getLastLiveContractHash() {
    try {
      const constractsCount = await blockchainContract.methods
        .contractCount()
        .call();

      console.log("count->", constractsCount);
      if (constractsCount == 0) {
        return "GenesisBlock";
      }

      const lastContract = await blockchainContract.methods
        .hashContracts(constractsCount - 1)
        .call();

      // console.log("lastCon->", lastContract);

      const lastContractInfo = {
        contractHash: lastContract.conHash,
        prevConHash: lastContract.prevConHash,
      };

      return lastContractInfo;
    } catch (error) {
      console.log("err->", error);
    }
  }

  const handleApprove = (event) => {
    event.preventDefault();
    setButtonDisable1(true);
    setLoading1(true);

    if (contractInfoNotUpdate.roomNumber === -1) {
      contractInfoNotUpdate.roomNumber = 1;
    }

    if (
      contractInfoNotUpdate.apartmentNumber === -1 ||
      contractInfoNotUpdate.floor === -1 ||
      contractInfoNotUpdate.street === "none" ||
      contractInfoNotUpdate.city === "none" ||
      contractInfoNotUpdate.money === -1
    ) {
      setErrorText("You need to enter info in every input!1");
      setEmptyField(true);
      setButtonDisable1(false);
      setLoading1(false);
    } else if (
      !contractInfoNotUpdate.apartmentNumber ||
      !contractInfoNotUpdate.floor ||
      !contractInfoNotUpdate.street ||
      !contractInfoNotUpdate.city ||
      !contractInfoNotUpdate.money
    ) {
      setErrorText("You need to enter info in every input!2");
      setEmptyField(true);
      setButtonDisable1(false);
      setLoading1(false);
    } else {
      if (accountAddress === contractInfoNotUpdate.seller) {
        contractInfoNotUpdate.sellerApprove = true;
      } else {
        contractInfoNotUpdate.buyerApprove = true;
      }

      axios
        .put(
          "/contract/" + contractInfoNotUpdate.id,
          contractInfoNotUpdate,
          config
        )
        .then((res) => {
          // console.log("approve looking good!");
          // console.log("status is->", res.data);
          if (res.data.status === "blockchain") {
            const time = new Date(contractInfo.time).toDateString();

            let prevConHash = "";
            getLastLiveContractHash().then((lastContractHash) => {
              // console.log("prv1->", lastContractHash);
              if (lastContractHash == "GenesisBlock") {
                prevConHash = "GenesisBlock";
              } else {
                prevConHash = lastContractHash.contractHash;
                // console.log("prv2->", lastContractHash);
              }
              // console.log("prevConHash->", prevConHash);
              const conHash = SHA256.hash(
                prevConHash +
                  res.data.contractId +
                  res.data.seller +
                  res.data.buyer +
                  res.data.roomNumber +
                  res.data.apartmentNumber +
                  res.data.apartmentFloor +
                  res.data.apartmentStreet +
                  res.data.apartmentCity +
                  res.data.money
              );
              // console.log("conHash->", conHash);
              blockchainContract.methods
                .createContract(
                  time,
                  res.data.contractId,
                  res.data.seller,
                  res.data.buyer,
                  res.data.roomNumber,
                  res.data.apartmentNumber,
                  res.data.apartmentFloor,
                  res.data.apartmentStreet,
                  res.data.apartmentCity,
                  res.data.money,
                  conHash,
                  prevConHash
                )
                .send({ from: accounts[0] })
                .once("receipt", (receipt) => {
                  // console.log("upload to blockchain!");
                  setLoading1(false);
                  setButtonDisable1(false);
                  handleCloseViewModal(true);
                  setErrorText("");
                  setEmptyField(false);
                  setShowToast(true);
                });
            });
          }
        })
        .catch((error) => {
          console.log(error);
          setLoading1(false);
          setButtonDisable1(false);
          // setExistsBuyerAddress(false);
          // setPendingErrorText(
          //   "You type wrong buyer address, try again or ask the buyer for their account address!"
          // )
        });
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setButtonDisable2(false);
    setContractInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleChangeMoney = (event) => {
    let num = event.target.value + "".replace(/,/g, "");
    num = numberWithCommas(num);
    num = num.replace(/,/g, "");
    event.target.value = numberWithCommas(num);
    num = event.target.value.replace(/,/g, "");
    setButtonDisable2(false);
    setContractInfo((prevState) => ({
      ...prevState,
      money: num,
    }));
  };

  const approveFormatter = (cell, row) => {
    return <center>{cell}</center>;
  };

  const columns = [
    {
      dataField: "id",
      text: "#",
    },
    {
      dataField: "sellerApprove",
      text: "Seller Approve",
      formatter: approveFormatter,
    },
    {
      dataField: "buyerApprove",
      text: "Buyer Approve",
      formatter: approveFormatter,
    },
    {
      dataField: "action",
      text: "Action",
      formatter: approveFormatter,
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
      {/* <h1>Ready Contracts Page</h1> */}

      <BootstrapTable
        keyField="id"
        data={readyContracts}
        columns={columns}
        pagination={paginationFactory(options)}
        responsive
        striped
        hover
        // rowStyle={rowStyle}
        bootstrap4
        condensed
      />

      {/* View modal - START */}
      <Modal show={showViewModal} onHide={handleCloseViewModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Contract #{contractInfo.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <center>
              <Form.Label>
                <i>
                  Drafted in CryptoContracts, on{" "}
                  <strong>{new Date(contractInfo.time).toDateString()}</strong>,
                  By and between:
                </i>
              </Form.Label>
            </center>
            <br />
            <Form.Row>
              <Form.Group as={Col}>
                <Form.Label>Seller</Form.Label>
                <Form.Control
                  //   size="sm"
                  type="text"
                  placeholder={contractInfo.seller}
                  disabled={true}
                />
              </Form.Group>

              <Form.Group as={Col}>
                <Form.Label>Buyer</Form.Label>
                <Form.Control
                  //   size="sm"
                  type="text"
                  placeholder={contractInfo.buyer}
                  disabled={true}
                />
              </Form.Group>
            </Form.Row>

            <Form.Row>
              <Form.Group as={Col}>
                <Form.Label>Number of rooms</Form.Label>
                <Form.Control
                  name="roomNumber"
                  defaultValue={
                    contractInfo.roomNumber > 0 ? contractInfo.roomNumber : "1"
                  }
                  onChange={handleChange}
                  as="select"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </Form.Control>
              </Form.Group>

              <Form.Group as={Col}>
                <Form.Label>Appartment Number</Form.Label>
                <Form.Control
                  name="apartmentNumber"
                  defaultValue={
                    contractInfo.apartmentNumber > 0
                      ? contractInfo.apartmentNumber
                      : ""
                  }
                  onChange={handleChange}
                  isInvalid={emptyField}
                />
                <FormControl.Feedback type="invalid">
                  {errorText}
                </FormControl.Feedback>
              </Form.Group>
            </Form.Row>

            <Form.Row>
              <Form.Group as={Col}>
                <Form.Label>Appartment Floor</Form.Label>
                <Form.Control
                  name="floor"
                  defaultValue={
                    contractInfo.floor > 0 ? contractInfo.floor : ""
                  }
                  onChange={handleChange}
                  isInvalid={emptyField}
                />
                <FormControl.Feedback type="invalid">
                  {errorText}
                </FormControl.Feedback>
              </Form.Group>

              <Form.Group as={Col}>
                <Form.Label>Apartment Street</Form.Label>
                <Form.Control
                  name="street"
                  defaultValue={
                    contractInfo.street !== "none" ? contractInfo.street : ""
                  }
                  onChange={handleChange}
                  isInvalid={emptyField}
                />
                <FormControl.Feedback type="invalid">
                  {errorText}
                </FormControl.Feedback>
              </Form.Group>
            </Form.Row>

            <Form.Row>
              <Form.Group as={Col}>
                <Form.Label>Apartment City</Form.Label>
                <Form.Control
                  name="city"
                  defaultValue={
                    contractInfo.city !== "none" ? contractInfo.city : ""
                  }
                  onChange={handleChange}
                  isInvalid={emptyField}
                />
                <FormControl.Feedback type="invalid">
                  {errorText}
                </FormControl.Feedback>
              </Form.Group>

              <Form.Group as={Col}>
                <Form.Label>Money amount per month ($)</Form.Label>
                <Form.Control
                  name="money"
                  defaultValue={numberWithCommas(
                    contractInfo.money > 0 ? contractInfo.money : ""
                  )}
                  onChange={handleChangeMoney}
                  isInvalid={emptyField}
                />
                <FormControl.Feedback type="invalid">
                  {errorText}
                </FormControl.Feedback>
              </Form.Group>
            </Form.Row>

            <Form.Row>
              <Col>
                <center>
                  <Form.Group as={Col}>
                    <Form.Label>Seller Approve</Form.Label>
                    <br />
                    {contractInfo.sellerApprove ? (
                      <FontAwesomeIcon icon={faCheck} size="2x" color="green" />
                    ) : (
                      <FontAwesomeIcon
                        icon={faTimes}
                        size="2x"
                        color="#de2658"
                      />
                    )}
                  </Form.Group>
                </center>
              </Col>
              <Col>
                <center>
                  <Form.Group as={Col}>
                    <Form.Label>Buyer Approve</Form.Label>
                    <br />
                    {contractInfo.buyerApprove ? (
                      <FontAwesomeIcon icon={faCheck} size="2x" color="green" />
                    ) : (
                      <FontAwesomeIcon
                        icon={faTimes}
                        size="2x"
                        color="#de2658"
                      />
                    )}
                  </Form.Group>
                </center>
              </Col>
            </Form.Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            disabled={
              buttonDisable1 ||
              (accountAddress === contractInfo.seller &&
                contractInfo.sellerApprove) ||
              (accountAddress === contractInfo.buyer &&
                contractInfo.buyerApprove)
            }
            variant="primary"
            onClick={handleApprove}
            block
          >
            <Spinner
              animation="border"
              variant="light"
              size="sm"
              hidden={!isLoading1}
            />
            {isLoading1
              ? " Loading…(might take some time...)"
              : "Everything is OK, approve contract"}
          </Button>
          <br />
          <Button
            disabled={buttonDisable2}
            variant="primary"
            onClick={handleUpdate}
            block
          >
            <Spinner
              animation="border"
              variant="light"
              size="sm"
              hidden={!isLoading2}
            />
            {isLoading2 ? " Loading…" : "Update contract info and approve"}
          </Button>
        </Modal.Footer>
      </Modal>
      {/* View modal - END */}
      <Toast
        onClose={() => setShowToast(false)}
        show={showToast}
        delay={8000}
        autohide={true}
        style={{
          position: "fixed",
          bottom: 0,
          left: 20,
        }}
      >
        <Toast.Header>
          <img src="holder.js/20x20?text=%20" className="rounded mr-2" alt="" />
          <strong className="mr-auto">Notification</strong>
          <small>now</small>
        </Toast.Header>
        <Toast.Body>
          Woohoo, your contract successfully uploaded to the blockchain!
        </Toast.Body>
      </Toast>
    </div>
  );
}

export default ReadyContracts;
