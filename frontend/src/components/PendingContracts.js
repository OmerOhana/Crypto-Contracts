import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";

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

function PendingContracts(props) {
  const [showChild, setShowChild] = useState(false);
  const [path, setPath] = useState("");
  const [username, setUsername] = useState("");
  const [pendingContracts, setPendingContracts] = useState([]);
  const [currentContract, setCurrentContract] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [sellerAddress, setSellerAddress] = useState("");
  const [currentSellerAddress, setCurrentSellerAddress] = useState("");
  const [sameSellerAddress, setSameSellerAddress] = useState(true);

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
    // axios.defaults.baseURL = "http://localhost:5000/";
    axios
      .get("/", config)
      .then((res) => {
        if (
          res !== null &&
          "passport" in res.data &&
          "user" in res.data.passport
        ) {
          // console.log("pending user is->", res.data);
          setUsername(res.data.passport.user);

          axios
            .get("/user/" + res.data.passport.user, config)
            .then((res) => {
              // console.log("pendingpage->>", res);
              // console.log("pendingpage->>", res.data.contracts.length);
              for (let index = 0; index < res.data.contracts.length; index++) {
                setPendingContracts((prevState) => [
                  {
                    id: res.data.contracts[index].contractId,
                    message: res.data.contracts[index].message,
                    status: res.data.contracts[index].status,
                    action: (
                      <div>
                        <Button
                          name={"btn_" + res.data.contracts[index].contractId}
                          size="sm"
                          variant={
                            res.data.contracts[index].status === "Reject"
                              ? "secondary"
                              : "success"
                          }
                          onClick={(event) => {
                            setCurrentContract(event.target.name.split("_")[1]);
                            setCurrentSellerAddress(
                              res.data.contracts[index].seller
                            );
                            handleShowAcceptModal();
                          }}
                          disabled={
                            res.data.contracts[index].status === "Reject" ||
                            res.data.contracts[index].status === "Accept"
                              ? true
                              : false
                          }
                        >
                          Accept
                        </Button>
                        &nbsp;
                        <Button
                          name={"btn_" + res.data.contracts[index].contractId}
                          size="sm"
                          variant={
                            res.data.contracts[index].status === "Accept"
                              ? "secondary"
                              : "danger"
                          }
                          onClick={(event) => {
                            setCurrentContract(event.target.name.split("_")[1]);
                            handleShowRejectModal();
                          }}
                          disabled={
                            res.data.contracts[index].status === "Reject" ||
                            res.data.contracts[index].status === "Accept"
                              ? true
                              : false
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    ),
                  },
                  ...prevState,
                ]);
              }
            })
            .catch((error) => {
              console.log("err!->", error);
            });
        } else {
          setPath("/login");
        }
      })
      .catch((error) => {
        console.log("err!->", error);
      });

    setShowChild(true);
  }, []);

  // check for new pending contracts
  useInterval(() => {
    // Your custom logic here
    // console.log("go");
    axios
      .get("/user/" + username, config)
      .then((res) => {
        // console.log("pendingpage->>", res.data.contracts.length);
        setPendingContracts([]);
        for (let index = 0; index < res.data.contracts.length; index++) {
          setPendingContracts((prevState) => [
            {
              id: res.data.contracts[index].contractId,
              message: res.data.contracts[index].message,
              status: res.data.contracts[index].status,
              action: (
                <div>
                  <Button
                    name={"btn_" + res.data.contracts[index].contractId}
                    size="sm"
                    variant={
                      res.data.contracts[index].status === "Reject"
                        ? "secondary"
                        : "success"
                    }
                    onClick={(event) => {
                      setCurrentContract(event.target.name.split("_")[1]);
                      setCurrentSellerAddress(res.data.contracts[index].seller);
                      handleShowAcceptModal();
                    }}
                    disabled={
                      res.data.contracts[index].status === "Reject" ||
                      res.data.contracts[index].status === "Accept"
                        ? true
                        : false
                    }
                  >
                    Accept
                  </Button>
                  &nbsp;
                  <Button
                    name={"btn_" + res.data.contracts[index].contractId}
                    size="sm"
                    variant={
                      res.data.contracts[index].status === "Accept"
                        ? "secondary"
                        : "danger"
                    }
                    onClick={(event) => {
                      setCurrentContract(event.target.name.split("_")[1]);
                      handleShowRejectModal();
                    }}
                    disabled={
                      res.data.contracts[index].status === "Reject" ||
                      res.data.contracts[index].status === "Accept"
                        ? true
                        : false
                    }
                  >
                    Reject
                  </Button>
                </div>
              ),
            },
            ...prevState,
          ]);
        }
      })
      .catch((error) => {
        console.log("err!->", error);
      });
  }, 1000 * 10);

  const actionFormatter = (cell, row) => {
    return <center>{cell}</center>;
  };

  const statusFormatter = (cell, row) => {
    if (row.status === "Reject") {
      return (
        <span>
          <i style={{ color: "red" }}>{cell}</i>
        </span>
      );
    } else if (row.status === "Accept") {
      return (
        <span>
          <i style={{ color: "green" }}>{cell}</i>
        </span>
      );
    }
    return (
      <span>
        <strong>{cell}</strong>
      </span>
    );
  };

  const columns = [
    {
      dataField: "id",
      text: "#",
    },
    {
      dataField: "message",
      text: "Message",
    },
    {
      dataField: "status",
      text: "Status",
      formatter: statusFormatter,
    },
    {
      dataField: "action",
      text: "Action",
      formatter: actionFormatter,
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

  const handleCloseRejectModal = () => setShowRejectModal(false);

  const handleShowRejectModal = () => setShowRejectModal(true);

  const handleCloseAcceptModal = () => {
    setSameSellerAddress(true);
    setShowAcceptModal(false);
  };

  const handleShowAcceptModal = () => setShowAcceptModal(true);

  const handleReject = (event) => {
    event.preventDefault();
    setLoading(true);

    axios.get("/", config).then((res) => {
      if (
        res !== null &&
        "passport" in res.data &&
        "user" in res.data.passport
      ) {
        axios
          .put(
            "/user/" + res.data.passport.user + "/" + currentContract,
            { status: "Reject" },
            config
          )
          .then((res) => {
            // console.log("pending updating status ok!!!");
            handleCloseRejectModal();
            setLoading(false);
          });
      }
    });
  };

  const handleChange = (event) => {
    const { value } = event.target;
    setSellerAddress(value);
  };

  const handleAccept = (event) => {
    event.preventDefault();
    setLoading(true);
    if (sellerAddress !== currentSellerAddress) {
      setSameSellerAddress(false);
      setLoading(false);
    } else {
      axios
        .put(
          "/user/" + username + "/" + currentContract,
          { status: "Accept" },
          config
        )
        .then((res) => {
          const newContract = {
            contractId: parseInt(currentContract),
            seller: currentSellerAddress,
            buyer: props.accountAddress,
          };

          axios.post("/contract/new", newContract, config);
        })
        .then((res) => {
          // console.log("pending updating status ok!!!");
          // console.log(res);
          handleCloseAcceptModal();
          setLoading(false);
        });
    }
  };

  return (
    <div>
      {/* <h1>Pending Contracts Page</h1> */}

      <BootstrapTable
        keyField="id"
        data={pendingContracts}
        columns={columns}
        pagination={paginationFactory(options)}
        responsive
        striped
        hover
        // rowStyle={rowStyle}
        bootstrap4
        condensed
      />

      {/* Reject modal - START */}
      <Modal show={showRejectModal} onHide={handleCloseRejectModal}>
        <Modal.Header closeButton>
          <Modal.Title>Are you sure?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          You are about to reject a contract request, are you sure with your
          action?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseRejectModal}>
            No, cancel
          </Button>
          <Button variant="primary" onClick={handleReject}>
            <Spinner
              animation="border"
              variant="light"
              size="sm"
              hidden={!isLoading}
            />
            {isLoading ? " Loading…" : "Yes, reject the request"}
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Reject modal - END */}
      {/* Accept modal - START*/}
      <Modal show={showAcceptModal} onHide={handleCloseAcceptModal}>
        <Modal.Header closeButton>
          <Modal.Title>Enter the seller address</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            onChange={handleChange}
            name="address"
            type="text"
            placeholder="Seller address"
            isInvalid={!sameSellerAddress}
          />
          <FormControl.Feedback type="invalid">
            You type the wrong seller address, try again or ask the seller for
            their account address!
          </FormControl.Feedback>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAcceptModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAccept}>
            <Spinner
              animation="border"
              variant="light"
              size="sm"
              hidden={!isLoading}
            />
            {isLoading ? " Loading…" : "Accept"}
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Accept modal - END*/}
    </div>
  );
}

export default PendingContracts;
