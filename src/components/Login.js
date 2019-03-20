import React, { Component } from "react";
import { AUTH_TOKEN } from "../constants";
import { Mutation } from "react-apollo";
import { SIGNUP_MUTATION, LOGIN_MUTATION } from "../operations/Mutation";

class Login extends Component {
  state = {
    login: true,
    email: "",
    password: "",
    name: ""
  };

  confirm = async data => {
    const { token } = this.state.login ? data.login : data.signup;
    this.saveUserData(token);
    this.props.history.push("/");
  };

  saveUserData = token => {
    localStorage.setItem(AUTH_TOKEN, token);
  };

  render() {
    const { login, email, password, name } = this.state;
    return (
      <>
        <h4 className="mv3">{login ? "Login" : "Sign Up!"}</h4>
        <div className="flex flex-column">
          {!login && (
            <input
              value={name}
              onChange={e => this.setState({ name: e.target.value })}
              type="text"
              placeholder="Name"
            />
          )}
          <input
            value={email}
            onChange={e => this.setState({ email: e.target.value })}
            type="text"
            placeholder="Email address"
          />
          <input
            value={password}
            onChange={e => this.setState({ password: e.target.value })}
            type="password"
            placeholder="Password"
          />
        </div>
        <div className="flex mt3">
          <Mutation
            mutation={login ? LOGIN_MUTATION : SIGNUP_MUTATION}
            variables={{ email, password, name }}
            onCompleted={data => this.confirm(data)}
          >
            {mutation => (
              <div className="pointer mr2 button" onClick={mutation}>
                {login ? "login" : "create account"}
              </div>
            )}
          </Mutation>
          <div className="pointer button" onClick={() => this.confirm}>
            {login ? "login" : "create account"}
          </div>
          <div
            className="pointer button"
            onClick={() => this.setState({ login: !login })}
          >
            {login ? "need to create an account?" : "already have an account?"}
          </div>
        </div>
      </>
    );
  }
}

export default Login;
