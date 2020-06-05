import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import axios from "axios";

import Register from "./components/Register";
import Login from "./components/Login";
import Homepage from "./components/Homepage";
import NotFound from "./components/NotFound";
import ContractExplorer from "./components/ContractExplorer";

import "./sb-admin-2.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";

function App() {
  const [account, setAccount] = useState("");

  const config = {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  };

  useEffect(() => {
    // axios.defaults.baseURL = "http://localhost:5000/";
    axios.defaults.baseURL = process.env.REACT_APP_BASE_URL + ":5000/";
  });

  return (
    <div>
      <Router>
        <Switch>
          <Route exact path="/">
            <Homepage />
          </Route>

          <Route exact path="/register">
            <Register />
          </Route>

          {/* <Route exact path={["/", "/login"]}> */}
          <Route exact path="/login">
            <Login setAccount={setAccount} />
          </Route>

          <Route path="/contract-explorer">
            <ContractExplorer />
          </Route>

          <Route path="/">
            <NotFound />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
