import React, { useEffect, useState } from "react";
import axios from "axios";
import { Redirect } from "react-router-dom";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import FormControl from "react-bootstrap/FormControl";

function Login(props) {
  const [path, setPath] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [user, setUser] = useState({
    username: "",
    password: "",
  });

  // axios config
  const config = {
    withCredentials: true,
    // baseURL: "http://localhost:5000/",
    baseURL: process.env.REACT_APP_BASE_URL + ":5000/",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleRegister = (event) => {
    event.preventDefault();
    setPath("/register");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsLoading(true);
    axios
      .post(
        "/login",
        {
          username: user.username.toLowerCase(),
          password: user.password,
        },
        config
      )
      .then((res) => {
        if (res !== null) {
          // console.log("login page react->", res.data);
          props.setAccount(res.data);
          // setPath("/homepage");
          setPath("/");
        }
      })
      .catch((err) => {
        // console.log("err!->", err);
        setIsLoading(false);
        setLoginError(true);
        setErrorText("There is an error with your username or password!");
      });
  };

  async function updateBaseUrl() {
    // config[baseURL] = await axios.get("https://api.ipify.org");
    console.log(config);
  }

  // init
  useEffect(() => {
    // updateBaseUrl();
    axios.get("/", config).then((res) => {
      if (
        res !== null &&
        "passport" in res.data &&
        "user" in res.data.passport
      ) {
        setPath("/");
      }
    });
  }, []);

  if (path) {
    return <Redirect to={{ pathname: path }} />;
  } else {
    return (
      <div className="">
        <div className="container">
          {/* <!-- Outer Row --> */}
          <div className="row justify-content-center">
            <div className="col-xl-10 col-lg-12 col-md-9">
              <div className="card o-hidden border-0 shadow-lg my-5">
                <div className="card-body p-0">
                  {/* <!-- Nested Row within Card Body --> */}
                  <div className="row">
                    <div className="col-lg-6 d-none d-lg-block bg-login-image"></div>
                    <div className="col-lg-6">
                      <div className="p-5">
                        <div className="text-center">
                          <h1 className="h4 text-gray-900 mb-4">
                            Welcome Back!
                          </h1>
                        </div>

                        <Form onSubmit={handleSubmit}>
                          <Form.Group controlId="formBasicUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                              className="form-control form-control-user"
                              name="username"
                              type="text"
                              placeholder="Enter Username..."
                              onChange={handleChange}
                              isInvalid={loginError}
                            />
                          </Form.Group>

                          <Form.Group controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                              className="form-control form-control-user"
                              name="password"
                              type="password"
                              placeholder="Password"
                              onChange={handleChange}
                              isInvalid={loginError}
                            />
                            <FormControl.Feedback type="invalid">
                              {errorText}
                            </FormControl.Feedback>
                          </Form.Group>

                          <Button
                            className="btn btn-primary btn-user btn-block"
                            variant="primary"
                            type="submit"
                            disabled={isLoading}
                          >
                            <Spinner
                              animation="border"
                              variant="light"
                              size="sm"
                              hidden={!isLoading}
                            />
                            {isLoading ? " Loading…" : "Login"}
                          </Button>

                          <hr></hr>
                          <Button
                            block
                            variant="link"
                            onClick={handleRegister}
                            size="sm"
                          >
                            Create an Account!
                          </Button>
                        </Form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
