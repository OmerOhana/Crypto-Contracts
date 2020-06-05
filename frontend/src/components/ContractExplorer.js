import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Web3 from "web3";
import { CONSTRACT_ADDRESS, CONSTRACT_ABI } from "../blockchainConfig";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Spinner from "react-bootstrap/Spinner";
import FormControl from "react-bootstrap/FormControl";
import Modal from "react-bootstrap/Modal";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldAlt, faCertificate } from "@fortawesome/free-solid-svg-icons";

import logo from "../resources/logo.svg";

var web3;
var blockchainContract;
var accounts;

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function ContractExplorer(props) {
  const [hideContractInfo, setHideContractInfo] = useState(true);
  const [accountAddress, setAccountAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [contractInfo, setContractInfo] = useState({});
  const [contractIdSearch, setContractIdSearch] = useState(-1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [notFoundModal, setNotFoundModal] = useState(false);
  const [errorTextModal, setErrorTextModal] = useState("");
  const [modalAddress, setModalAddress] = useState("");

  const handleChange = (event) => {
    const { value } = event.target;
    setContractIdSearch(value);
  };

  const handleChangeModal = (event) => {
    const { value } = event.target;
    setModalAddress(value);
  };

  const handleShowConfirmModal = () => setShowConfirmModal(true);
  const handleCloseConfirmModal = () => setShowConfirmModal(false);

  const handleSearch = async (event) => {
    event.preventDefault();
    setHideContractInfo(true);
    setLoading(true);
    const found = await searchForContract(contractIdSearch);
    // console.log("found->", found);
    if (found) {
      if (found.seller === accountAddress || found.buyer === accountAddress) {
        setHideContractInfo(false);
        setLoading(false);
        setNotFound(false);
      } else {
        setLoading(false);
        handleShowConfirmModal();
        setNotFound(false);
      }
    } else {
      // we dont hvae this id need to tell the user and make hide
      setNotFound(true);
      setErrorText("There is no contract with that ID in our blockchain");
      setHideContractInfo(true);
      setLoading(false);
    }
  };

  const handleUnlock = (event) => {
    event.preventDefault();
    if (
      modalAddress === contractInfo.seller ||
      modalAddress === contractInfo.buyer
    ) {
      setHideContractInfo(false);
      handleCloseConfirmModal();
      setNotFound(false);
    } else {
      setNotFoundModal(true);
      setErrorTextModal("You type wrong address!");
    }
  };

  async function searchForContract(serachContractId) {
    const constractsCount = await blockchainContract.methods
      .contractCount()
      .call();

    for (let item = 0; item < constractsCount; item++) {
      const houseContract = await blockchainContract.methods
        .contracts(item)
        .call();
      const conHash = await blockchainContract.methods
        .hashContracts(item)
        .call();
      if (houseContract.id === serachContractId) {
        setContractInfo({
          time: houseContract.time,
          id: houseContract.id,
          seller: houseContract.seller,
          buyer: houseContract.buyer,
          roomNumber: houseContract.roomNumber,
          apartmentNumber: houseContract.apartmentNumber,
          apartmentFloor: houseContract.apartmentFloor,
          apartmentStreet: houseContract.apartmentStreet,
          apartmentCity: houseContract.apartmentCity,
          money: houseContract.money,
          conHash: conHash.conHash,
          prevHash: conHash.prevConHash,
          // sellerApprove: houseContract.sellerApprove,
          // buyerApprove: houseContract.buyerApprove,
        });
        return houseContract;
      }
    }
    return null;
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

  // blockchain connect
  async function loadBlockchain() {
    web3 = new Web3(Web3.givenProvider || "http://localhost::8545");
    // const network = await web3.eth.net.getNetworkType(); // network is ropsten
    accounts = await web3.eth.getAccounts();
    // console.log(
    //   "explorer,successfully connected to the blockchain, your user address",
    //   accounts[0]
    // );

    blockchainContract = new web3.eth.Contract(
      CONSTRACT_ABI,
      CONSTRACT_ADDRESS
    );
  }

  // init
  useEffect(() => {
    loadBlockchain();
    axios
      .get("/", config)
      .then((res) => {
        if (
          res !== null &&
          "passport" in res.data &&
          "user" in res.data.passport
        ) {
          axios
            .get("/user/" + res.data.passport.user, config)
            .then((res) => {
              setAccountAddress(res.data.accountAddress);
            })
            .catch((error) => {
              console.log("err!->", error);
            });
        }
      })
      .catch((error) => {
        console.log("err!->", error);
      });
  }, []);

  return (
    <div className="">
      <div className="container">
        {/* <!-- Outer Row --> */}
        <div className="row justify-content-center">
          <div>{/* <h1>Contract Explorer</h1> */}</div>
          <div className="col-xl-10">
            <div className="card border-0 shadow-lg my-3">
              <div className="card-body">
                {/* <!-- Nested Row within Card Body --> */}
                <div className="p-4">
                  <div className="text-center">
                    <h1 className="h1 text-gray-800 mb-2">
                      {" "}
                      <img src={logo} className="logo-small" alt="logo" />
                      Contract Explorer
                    </h1>
                    <h1 className="h5 text-gray-700 mb-4">
                      Search for any LIVE contract
                    </h1>
                    <div className="contract-explorer-input-text text-gray-900 mb-4">
                      Contract Explorer give you the ability to search for any
                      LIVE contract that uploaded to CryptoContract blockchain
                      network.
                      <br />
                      Please note that to view contract that you are not part
                      of, you will need to provide the account address of the
                      Seller or the Buyer of that contract.
                    </div>
                    <div>
                      <Form onSubmit={handleSearch}>
                        <Form.Row className="">
                          <Col sm={10}>
                            <Form.Control
                              name="contractId"
                              placeholder="# Contarct ID"
                              onChange={handleChange}
                              isInvalid={notFound}
                            />
                            <FormControl.Feedback type="invalid">
                              {errorText}
                            </FormControl.Feedback>
                          </Col>
                          <Col sm={1}>
                            <Button
                              variant="primary"
                              type="submit"
                              disabled={loading}
                            >
                              <Spinner
                                animation="border"
                                variant="light"
                                size="sm"
                                hidden={!loading}
                              />
                              {loading ? "" : "Search!"}
                            </Button>
                          </Col>
                        </Form.Row>
                      </Form>
                    </div>
                  </div>

                  <div
                    hidden={hideContractInfo}
                    className="border rounded border-primary shadow mt-4 p-4 text-center"
                  >
                    <Form>
                      <Form.Row>
                        <Form.Group as={Col}>
                          <div className="contract-explorer-input-text font-italic">
                            {/* <Form.Label> */}
                            <FontAwesomeIcon
                              icon={faCertificate}
                              size="2x"
                              color="#4e73df"
                            />
                            <br />
                            Drafted in CryptoContracts, on {contractInfo.time},
                            By and between:
                            {/* </Form.Label> */}
                          </div>
                        </Form.Group>
                      </Form.Row>

                      <br />

                      {/* <hr></hr> */}

                      <Form.Row>
                        <Form.Group as={Col} controlId="formGridEmail">
                          <Form.Label>Seller</Form.Label>
                          <div className="contract-explorer-input-text">
                            {contractInfo.seller}
                          </div>
                        </Form.Group>

                        <Form.Group as={Col} controlId="formGridPassword">
                          <Form.Label>Buyer</Form.Label>
                          <div className="contract-explorer-input-text">
                            {contractInfo.buyer}
                          </div>
                        </Form.Group>
                      </Form.Row>

                      <hr></hr>

                      <Form.Row>
                        <Form.Group as={Col} controlId="formGridCity">
                          <Form.Label>Num of Rooms</Form.Label>
                          <div className="contract-explorer-input-text">
                            {contractInfo.roomNumber}
                          </div>
                        </Form.Group>

                        <Form.Group as={Col} controlId="formGridState">
                          <Form.Label>Apt. Number</Form.Label>
                          <div className="contract-explorer-input-text">
                            {contractInfo.apartmentNumber}
                          </div>
                        </Form.Group>

                        <Form.Group as={Col} controlId="formGridZip">
                          <Form.Label>Money</Form.Label>
                          <div className="contract-explorer-input-text">
                            {numberWithCommas(parseInt(contractInfo.money))} $
                          </div>{" "}
                        </Form.Group>
                      </Form.Row>

                      <hr></hr>

                      <Form.Row>
                        <Form.Group
                          // className="border border-secondary"
                          as={Col}
                          controlId="formGridCity"
                        >
                          <Form.Label>Street</Form.Label>
                          <div className="contract-explorer-input-text">
                            {contractInfo.apartmentStreet}
                          </div>{" "}
                        </Form.Group>

                        <Form.Group
                          // className="border border-secondary"
                          as={Col}
                          controlId="formGridState"
                        >
                          <Form.Label>City</Form.Label>
                          <div className="contract-explorer-input-text">
                            {contractInfo.apartmentCity}
                          </div>
                        </Form.Group>
                      </Form.Row>
                      <div className="text-center">
                        <span className="contract-explorer-input-text font-italic">
                          Digital signed
                        </span>
                        <br />
                        <FontAwesomeIcon
                          icon={faShieldAlt}
                          size="2x"
                          color="#4e73df"
                        />
                        <br />
                        <span className="contract-explorer-input-text font-italic">
                          CryptoContracts
                        </span>
                      </div>
                      <div className="contract-explorer-input-text font-italic">
                        <strong>Hash:</strong> {contractInfo.conHash}
                      </div>
                      {/* <div className="contract-explorer-input-text font-italic">
                          {contractInfo.prevHash}
                        </div> */}
                    </Form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="sticky-footer">
        <div className="container my-auto">
          <div className="copyright text-center my-auto text-gray-100">
            <Link className="text-gray-100 my-auto" to="/">
              &larr; Back to CryptoContract
            </Link>
          </div>
        </div>
      </footer>
      {/* End of Footer */}

      {/*START - confirm popup */}
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        // centered
        show={showConfirmModal}
        onHide={handleCloseConfirmModal}
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Confirm identity
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="contract-explorer-input-text">
          Blockchain contracts include personal information. Because you do not
          participate in this contract, you are asked to enter the address of
          one of the parties to view the contents of the contract.
        </Modal.Body>
        <Form className="pl-3 pr-3 pb-3">
          <Form.Control
            size="sm"
            name="contractAddress"
            placeholder="Seller / Buyer address..."
            onChange={handleChangeModal}
            isInvalid={notFoundModal}
          />
          <FormControl.Feedback type="invalid">
            {errorTextModal}
          </FormControl.Feedback>
        </Form>
        <Modal.Footer>
          <Button onClick={handleCloseConfirmModal} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleUnlock} variant="primary">
            Unlock
          </Button>
        </Modal.Footer>
      </Modal>
      {/*END - confirm popup */}
    </div>
  );
}

export default ContractExplorer;
