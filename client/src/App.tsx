import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import './App.css';
import Register from './components/Register/Register';
import Login from './components/Login/Login';

class App extends React.Component {
  state = {
    entries: [],
    token: null,
    user: null
  }

  componentDidMount() {
      this.authenticateUser();
  }

  authenticateUser = () => {
    const token = localStorage.getItem('token');

    if(!token) {
      localStorage.removeItem('user')
      this.setState({ user: null});
    }

    if(token) {
      const config = {
        headers: {
          'x-auth-token': token
        }
      }
      axios.get('http://localhost:5000/api/auth', config)
        .then((response) => {
          localStorage.setItem('user', response.data.name)
          this.setState({ user: response.data.name, token },
            () => {
              this.loadData();
            })
        })
        .catch((error) => {
          localStorage.removeItem('user');
          this.setState({ user: null });
          console.error(`Error logging in: ${error}`);
        })
    }
  }

  loadData = () => {
    const { token } = this.state;

    if (token) {
      const config = {
        headers: {
          'x-auth-token': token
        }
      };
      

      axios.get('http://localhost:5000/api/entries', config)
      .then((response) => {
        this.setState({
          entries: response.data
        });
      })
      .catch((error) => {
        console.error(`Error fetching data: ${error}`);
      });
    }
  };

  logOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.setState({ user: null, token: null });
  }

  render() {
    let { user, entries } = this.state;
    const authProps = {
      authenticateUser: this.authenticateUser
    }

    return (
      <Router>
        <div className="App">
          <header className="App-header">
            <h1>Nutrition Log</h1>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/register">Register</Link>
              </li>
              <li>
                {user ?
                <Link to="" onClick={this.logOut}>Logout</Link> :
                <Link to="/login">Login</Link>
                }
              </li>
            </ul>
            </header>
            <main>
                <Route exact path="/">
                  {user ?
                    <React.Fragment>
                      <div>Hello {user}!</div>
                      <div>
                        {entries.map(entry => (
                          <div key={entry._id}>
                            <p>Description: {entry.description}</p>
                            <p> Serving Size: {entry.servingSize} {entry.unit} </p>
                        <p> Servings: {entry.servingsPerContainer}</p>
                      </div>      
                        ))}
                      </div>
                    </React.Fragment> :
                    <React.Fragment>
                      Please Register or Login
                    </React.Fragment>
                  }
                </Route>
                <Switch>
                  <Route        
                    exact path="/register"
                    render={() => <Register {...authProps} />} />
                  <Route
                    exact path="/login"
                    render={() => <Login {...authProps} />} />
                </Switch>
            </main>
          </div>
      </Router> 
    );
  }
}

export default App;