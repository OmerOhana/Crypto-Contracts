import React, { useEffect, useState, useRef } from "react";
import { Redirect, Link } from "react-router-dom";
import axios from "axios";
import Web3 from "web3";
import { CONSTRACT_ADDRESS, CONSTRACT_ABI } from "../blockchainConfig";
import logo from "../resources/logo.svg";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import Toast from "react-bootstrap/Toast";
import Nav from "react-bootstrap/Nav";
import FormControl from "react-bootstrap/FormControl";
import Badge from "react-bootstrap/Badge";
import Dropdown from "react-bootstrap/Dropdown";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faCubes } from "@fortawesome/free-solid-svg-icons";
import { faEdit, faCopy, faClock } from "@fortawesome/free-regular-svg-icons";

import ActiveContracts from "./ActiveContracts";
import PendingContracts from "./PendingContracts";
import ReadyContracts from "./ReadyContracts";

var web3;
var blockchainContract;
var accounts;

// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
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

function shrinkAddress(address) {
  return (
    address.slice(0, 6) +
    "..." +
    address.slice(address.length - 6, address.length)
  );
}

function Homepage(props) {
  const [showChild, setShowChild] = useState(false);
  const [pendingCon, setPendingCon] = useState(0);
  const [readyCon, setReadyCon] = useState(0);
  const [liveCount, setLiveCount] = useState(0);
  const [username, setUsername] = useState("");
  const [accountAddress, setAccountAddress] = useState("");
  const [path, setPath] = useState("");
  const [pendingContractInfo, setPendingContractInfo] = useState({
    contractId: 0,
    sellerAddress: "",
    buyerAddress: "",
    message: "",
    status: "",
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [existsBuyerAddress, setExistsBuyerAddress] = useState(true);
  const [pendingErrorText, setPendingErrorText] = useState("");
  const [wrongMetamask, setWrongMetamask] = useState(true);
  const [metamaskAccount, setMetamaskAccount] = useState("");
  const [hideLive, setHideLive] = useState(true);
  const [hideReady, setHideReady] = useState(true);
  const [hidePending, setHidePending] = useState(true);
  const [hideLiveText, setHideLiveText] = useState(false);
  const [hideReadyText, setHideReadyText] = useState(true);
  const [hidePendingText, setHidePendingText] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  // const [readyCount, setReadyCount] = useState(0);
  const [pageTitle, setPageTitle] = useState("Live contracts");
  const [navLinkClassName1, setNavLinkClassName1] = useState("nav-link-active");
  const [navLinkClassName2, setNavLinkClassName2] = useState(
    "nav-link-not-active"
  );
  const [navLinkClassName3, setNavLinkClassName3] = useState(
    "nav-link-not-active"
  );
  const [navIconColor1, setNavIconColor1] = useState("#de2658");
  const [navIconColor2, setNavIconColor2] = useState("#808080");
  const [navIconColor3, setNavIconColor3] = useState("#808080");

  const [toolTipText, setToolTipText] = useState("Copy to clipboard");

  const handleCloseLogoutModal = () => setShowLogoutModal(false);

  const handleClosePendingModal = () => {
    setExistsBuyerAddress(true);
    setShowPendingModal(false);
  };

  const handleShowLogoutModal = () => setShowLogoutModal(true);

  const handleShowPendingModal = () => setShowPendingModal(true);

  const handleChangePending = (event) => {
    const { name, value } = event.target;
    setPendingContractInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmitPending = (event) => {
    event.preventDefault();
    setLoading(true);
    // axios.defaults.baseURL = "http://localhost:5000/";
    axios
      .get("/user/address/" + pendingContractInfo.buyerAddress, config)
      .then((res) => {
        if (
          res !== null &&
          pendingContractInfo.buyerAddress !== accountAddress
        ) {
          // console.log("user found->", res.data);
          const randomNum = Math.round(Math.random() * Math.floor(10000) + 1); // 1-10000
          const newContract = {
            contractId: randomNum,
            seller: accountAddress,
            buyer: pendingContractInfo.buyerAddress,
            message: pendingContractInfo.message,
            status: "Pending",
          };

          // console.log("new con->>>>", newContract);
          let updatedContracts = res.data.contracts;
          // console.log("current cons->", updatedContracts);
          updatedContracts.push(newContract);
          // console.log("current cons now->", updatedContracts);

          axios
            .put("/user/" + res.data._id, updatedContracts, config)
            .then((res) => {
              setShowPendingModal(false);
              setLoading(false);
              setExistsBuyerAddress(true);
            })
            .catch((err) => {
              setLoading(false);
              console.log("err->", err);
            });
        } else {
          setLoading(false);
          setExistsBuyerAddress(false);
          setPendingErrorText("You can't send to your own account!");
        }
      })
      .catch((error) => {
        setLoading(false);
        setExistsBuyerAddress(false);
        setPendingErrorText(
          "You type wrong buyer address, try again or ask the buyer for their account address!"
        );
        // console.log("err in get user address!->", error);
      });
  };

  const handleLive = (event) => {
    if (liveCount > 0) {
      setHideLive(false);
    } else {
      setHideLiveText(false);
      setHideLive(true);
    }
    setHideReady(true);
    setHidePending(true);
    setHideReadyText(true);
    setHidePendingText(true);

    setPageTitle("Live contracts");
    setNavLinkClassName1("nav-link-active");
    setNavLinkClassName2("nav-link-not-active");
    setNavLinkClassName3("nav-link-not-active");
    setNavIconColor1("#de2658");
    setNavIconColor2("#808080");
    setNavIconColor3("#808080");
  };

  const handleReady = (event) => {
    if (readyCon > 0) {
      setHideReady(false);
    } else {
      setHideReadyText(false);
      setHideReady(true);
    }
    setHideLive(true);
    setHidePending(true);
    setHideLiveText(true);
    setHidePendingText(true);

    setPageTitle("Ready contracts");
    setNavLinkClassName1("nav-link-not-active");
    setNavLinkClassName2("nav-link-active");
    setNavLinkClassName3("nav-link-not-active");
    setNavIconColor1("#808080");
    setNavIconColor2("#de2658");
    setNavIconColor3("#808080");
  };

  const handlePending = (event) => {
    if (pendingCount > 0) {
      setHidePending(false);
    } else {
      setHidePendingText(false);
      setHidePending(true);
    }
    setHideLive(true);
    setHideReady(true);
    setHideLiveText(true);
    setHideReadyText(true);

    setPageTitle("Pending contracts");
    setNavLinkClassName1("nav-link-not-active");
    setNavLinkClassName2("nav-link-not-active");
    setNavLinkClassName3("nav-link-active");
    setNavIconColor1("#808080");
    setNavIconColor2("#808080");
    setNavIconColor3("#de2658");
  };

  const handleCopyAddress = (event) => {
    // Create new element
    var el = document.createElement("textarea");
    // Set value (string to be copied)
    el.value = accountAddress;
    // Set non-editable to avoid focus and move outside of view
    el.setAttribute("readonly", "");
    el.style = { position: "absolute", left: "-9999px" };
    document.body.appendChild(el);
    // Select text inside element
    el.select();
    // Copy text to clipboard
    document.execCommand("copy");
    // Remove temporary element
    document.body.removeChild(el);

    // let tooltip = document.getElementById("tooltip");
    // tooltip.innerHTML = "Copied!";
    setToolTipText("Copied!");
  };

  const handleToolTip = (event) => {
    setToolTipText("Copy to clipboard");
  };

  // blockchain connect
  async function loadBlockchain(myAccountAddress) {
    web3 = new Web3(Web3.givenProvider || "http://localhost::8545");
    // const network = await web3.eth.net.getNetworkType(); // network is ropsten
    accounts = await web3.eth.getAccounts();
    // console.log(
    //   "homepage,successfully connected to the blockchain, your user address",
    //   accounts[0]
    // );
    // get metamask current login account
    setMetamaskAccount(accounts[0]);

    blockchainContract = new web3.eth.Contract(
      CONSTRACT_ABI,
      CONSTRACT_ADDRESS
    );
    // console.log("CryptoContract on the blockchain->", blockchainContract);
    const constractsCount = await blockchainContract.methods
      .contractCount()
      .call();
    let count = 0;
    for (let item = 0; item < constractsCount; item++) {
      const housetContract = await blockchainContract.methods
        .contracts(item)
        .call();

      if (
        housetContract.seller === myAccountAddress ||
        housetContract.buyer === myAccountAddress
      ) {
        count++;
        setHideLive(false);
        setHideLiveText(true);
      }
    }

    setLiveCount(count);
  }

  // Check for updates in blockchain contracts
  async function checkForBlockchainUpdates() {
    const constractsCount = await blockchainContract.methods
      .contractCount()
      .call();

    let count = 0;
    for (let item = 0; item < constractsCount; item++) {
      const housetContract = await blockchainContract.methods
        .contracts(item)
        .call();
      if (
        housetContract.seller === accountAddress ||
        housetContract.buyer === accountAddress
      ) {
        count++;
      }
    }

    setLiveCount(count);
  }

  // axios config
  let config = {
    withCredentials: true,
    baseURL: process.env.REACT_APP_BASE_URL + ":5000/",
    // baseURL: "http://localhost:5000/",
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
              // console.log("my address=>", res.data.accountAddress);
              setAccountAddress(res.data.accountAddress);
              loadBlockchain(res.data.accountAddress);

              // console.log("len isssss->", res.data.contracts.length);
              let count = 0;
              setPendingCount(res.data.contracts.length);
              for (let index = 0; index < res.data.contracts.length; index++) {
                if (res.data.contracts[index].status === "Pending") {
                  count++;
                }
              }
              // setPendingCon(res.data.contracts.length);
              setPendingCon(count);

              count = 0;
              let myAccount = res.data.accountAddress;
              axios.get("/contracts", config).then((res) => {
                for (let index = 0; index < res.data.length; index++) {
                  if (
                    res.data[index].status === "local" &&
                    (res.data[index].seller === myAccount ||
                      res.data[index].buyer === myAccount)
                  ) {
                    count++;
                  }
                }
                setReadyCon(count);
              });
            }
          })
          .catch((error) => {
            console.log("err!->", error);
          });
      })
      .catch((error) => {
        console.log("err!->", error);
      });

    setShowChild(true);
  }, []);

  // check cookie still valid
  useInterval(() => {
    // Your custom logic here
    axios
      .get("/", config)
      .then((res) => {
        if (
          !(
            res !== null &&
            "passport" in res.data &&
            "user" in res.data.passport
          )
        ) {
          setPath("/login");
        }
      })
      .catch((error) => {
        console.log("err!->", error);
      });
  }, 1000 * 10);

  // check for new live contracts
  useInterval(() => {
    // Your custom logic here
    checkForBlockchainUpdates();
  }, 1000 * 10);

  // check for new pending contracts
  useInterval(() => {
    // Your custom logic here
    axios
      .get("/user/" + username, config)
      .then((res) => {
        if (res !== null) {
          let count = 0;
          setPendingCount(res.data.contracts.length);
          for (let index = 0; index < res.data.contracts.length; index++) {
            if (res.data.contracts[index].status === "Pending") {
              count++;
            }
          }
          setPendingCon(count);
        }
      })
      .catch((error) => {
        console.log("err!->", error);
      });
  }, 1000 * 10);

  // check for new ready contracts
  useInterval(() => {
    // Your custom logic here
    axios
      .get("/contracts", config)
      .then((res) => {
        let count = 0;
        for (let index = 0; index < res.data.length; index++) {
          if (
            res.data[index].status === "local" &&
            (res.data[index].seller === accountAddress ||
              res.data[index].buyer === accountAddress)
          ) {
            count++;
          }
        }
        setReadyCon(count);
      })
      .catch((error) => {
        console.log("err!->", error);
      });
  }, 1000 * 10);

  const handleLogout = (event) => {
    event.preventDefault();
    axios
      .get("/logout", config)
      .then((res) => {
        setPath("/login");
      })
      .catch((error) => {
        console.log("err!->", error);
      });
  };

  if (path) {
    return <Redirect to={{ pathname: path }} />;
  } else {
    return (
      <div id="page-top">
        {/* Page Wrapper */}
        <div id="wrapper">
          {/* Sidebar */}
          <Nav
            className="flex-column bg-light sidebar sidebar-light accordion right-spacer"
            id="accordionSidebar"
          >
            {/* Sidebar - Brand */}
            <Nav.Item className="sidebar-brand d-flex align-items-center justify-content-center">
              <img src={logo} className="logo" alt="logo" />
            </Nav.Item>
            {/* Divider */}
            {/* <hr className="sidebar-divider my-0" /> */}
            {/* Nav */}
            <Nav.Link>
              <Button
                className="btn-red bottom-spacer new-contract-button"
                block
                onClick={handleShowPendingModal}
              >
                + New contract
              </Button>
            </Nav.Link>
            <Nav.Link className={navLinkClassName1}>
              <FontAwesomeIcon icon={faCopy} color={navIconColor1} />
              <Button
                className="nav-link-button"
                variant="link"
                onClick={handleLive}
              >
                <div className="nav-button-text">Live contracts </div>
              </Button>
            </Nav.Link>

            <Nav.Link className={navLinkClassName2}>
              <FontAwesomeIcon icon={faEdit} color={navIconColor2} />
              <Button
                className="nav-link-button"
                variant="link"
                onClick={handleReady}
              >
                <div className="nav-button-text">Ready contracts </div>
              </Button>
              {readyCon > 0 ? (
                <Badge className="notification-number">{readyCon}</Badge>
              ) : (
                ""
              )}
            </Nav.Link>

            <Nav.Link className={navLinkClassName3}>
              <FontAwesomeIcon icon={faClock} color={navIconColor3} />
              <Button
                className="nav-link-button"
                variant="link"
                onClick={handlePending}
              >
                <div className="nav-button-text">Pending contracts </div>
              </Button>
              {pendingCon > 0 ? (
                <Badge className="notification-number">{pendingCon}</Badge>
              ) : (
                ""
              )}
            </Nav.Link>
            {/* Divider */}
            <hr className="sidebar-divider my-0" />
            <div className="sidebar-heading">
              <span>My Account address:</span>
            </div>

            <OverlayTrigger
              placement="bottom"
              transition
              overlay={
                <Tooltip id="tooltip" placement="bottom-end">
                  {toolTipText}
                </Tooltip>
              }
            >
              <div
                className="account-address-nav"
                onClick={handleCopyAddress}
                onMouseLeave={handleToolTip}
              >
                <span>{shrinkAddress(accountAddress)}</span>
              </div>
            </OverlayTrigger>
          </Nav>
          {/* End Nav */}

          {/* Content Wrapper */}
          <div id="content-wrapper" className="d-flex flex-column">
            {/* Main Content */}
            <div id="content">
              {/* Begin Page Content */}
              <div className="container-fluid mt-20">
                {/* Page Heading */}
                <div className="d-sm-flex align-items-center justify-content-between mb-4">
                  <h1 className="h3 mb-0 text-gray-800">{pageTitle}</h1>
                  <Dropdown className="d-none d-sm-inline-block animated--grow-in">
                    <Dropdown.Toggle variant="primary" id="dropdown-basic">
                      {username}
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="mr-3 mt-2">
                      {/* <Dropdown.Item className="animated--grow-in dropdown-item"> */}
                      <Link
                        className="animated--grow-in remove-underline dropdown-item dropdown-item-custom p-2 m-0"
                        to="/contract-explorer"
                      >
                        <FontAwesomeIcon icon={faCubes} color="#d1d3e1" />{" "}
                        Contract Explorer
                      </Link>
                      {/* </Dropdown.Item> */}
                      <hr></hr>
                      <Dropdown.Item
                        className="animated--grow-in p-2 m-0"
                        onClick={handleShowLogoutModal}
                      >
                        <FontAwesomeIcon icon={faSignOutAlt} color="#d1d3e1" />{" "}
                        Logout
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>

                {/* here are the 3 blocks */}

                {/* Content Row */}
                <div className="row">
                  {/* Area Chart */}
                  <div className="col-xl col-lg-7">
                    <div className="card shadow mb-4">
                      {/* Card Body */}
                      <div className="card-body">
                        <div hidden={hideLiveText}>
                          <h1 className="h4 text-gray-500 font-italic text-center">
                            No Live contracts!
                          </h1>
                        </div>
                        <div hidden={hideLive}>
                          <ActiveContracts />
                        </div>

                        <div hidden={hideReadyText}>
                          <h1 className="h4 text-gray-500 font-italic text-center">
                            There is nothing ready...yet.
                          </h1>
                        </div>
                        <div hidden={hideReady}>
                          <ReadyContracts username={username} />
                        </div>

                        <div hidden={hidePendingText}>
                          <h1 className="h4 text-gray-500 font-italic text-center">
                            Nothing here!...where is everyone..?
                          </h1>
                        </div>
                        <div hidden={hidePending}>
                          <PendingContracts
                            username={username}
                            accountAddress={accountAddress}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /.container-fluid */}
            </div>
            {/* End of Main Content */}

            {/* Footer */}
            <footer className="sticky-footer bg-white">
              <div className="container my-auto">
                <div className="copyright text-center my-auto">
                  <span>Copyright &copy; CryptoContracts 2020</span>
                </div>
              </div>
            </footer>
            {/* End of Footer */}
          </div>
          {/* End of Content Wrapper */}
        </div>
        {/* End of Page Wrapper */}

        {/*START - new pending contract popup */}
        <Modal
          {...props}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          // centered
          show={showPendingModal}
          onHide={handleClosePendingModal}
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              New contract request
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmitPending}>
              <Form.Group controlId="formBasicBuyerAddress">
                <Form.Label>Please write the buyer account address</Form.Label>
                <Form.Control
                  name="buyerAddress"
                  type="text"
                  placeholder="Buyer address"
                  onChange={handleChangePending}
                  isInvalid={!existsBuyerAddress}
                />
                <FormControl.Feedback type="invalid">
                  {pendingErrorText}
                </FormControl.Feedback>
              </Form.Group>

              <Form.Group controlId="formBasicMessage">
                <Form.Label>
                  Please write a small message to the buyer so he can recognize
                  you
                </Form.Label>
                <Form.Control
                  name="message"
                  type="text"
                  placeholder="Your message..."
                  onChange={handleChangePending}
                />
              </Form.Group>

              <Button variant="primary" type="submit" disabled={isLoading}>
                <Spinner
                  animation="border"
                  variant="light"
                  size="sm"
                  hidden={!isLoading}
                />
                {isLoading ? " Loading…" : "Send request"}
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
        {/*END - new pending contract popup */}

        {/*START - logout popup */}
        <Modal
          {...props}
          // size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          // centered
          show={showLogoutModal}
          onHide={handleCloseLogoutModal}
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Ready to Leave?
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Select "Logout" below if you are ready to end your current session.
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleCloseLogoutModal} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleLogout} variant="primary">
              Logout
            </Button>
          </Modal.Footer>
        </Modal>
        {/*END - logout popup */}

        {/* START - wrong metamask */}
        <Modal
          size="lg"
          show={metamaskAccount !== accountAddress && wrongMetamask}
          onHide={() => setWrongMetamask(false)}
          aria-labelledby="example-modal-sizes-title-sm"
        >
          <Modal.Header closeButton>
            <Modal.Title id="example-modal-sizes-title-sm">
              Diffrenat MetaMask account / MetaMask is not connected!
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Please notice that your MetaMask account is Diffrence then your
            address account in our system OR your MetaMask is not connected! In
            order for this platform to run correctly you need MetaMask to work.
          </Modal.Body>
        </Modal>
        {/* END - wrong metamask */}

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
            <img
              src="holder.js/20x20?text=%20"
              className="rounded mr-2"
              alt=""
            />
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
}

export default Homepage;
