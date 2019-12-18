import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import './App.css';
import Register from './components/Register/Register';
import Login from './components/Login/Login';
import EntryList from './components/EntryList/EntryList';
import Entry from './components/Entry/Entry';
import CreateEntry from './components/Entry/CreateEntry';

class App extends React.Component {
  state = {
    entries: [],
    entry: null,
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

  viewEntry = entry => {
    console.log(`view ${entry.description}`);
    this.setState({
      entry: entry
    });
  };

  deleteEntry = entry => {
    const { token } = this.state;

    if (token) {
      const config = {
        headers: {
          'x-auth-token': token
        }
      };

      axios
        .delete(`http://localhost:5000/api/entries/${entry._id}`, config)
        .then(response => {
          const newEntries = this.state.entries.filter(p => p._id !== entry._id);
          this.setState({
            entries: [...newEntries]
          });
        })
        .catch(error => {
          console.error(`Error deleting entry: ${entry}`);
        });
    }
  };

  onEntryCreated = entry => {
    const newEntries = [...this.state.entries, entry];

    this.setState({
      entries: newEntries
    });
  };

  render() {
    let { user, entries, entry, token } = this.state;
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
                {user ? (
                  <Link to="/new-entry">Add Food</Link>
                ) : (
                  <Link to="/register">Register</Link>
                )}
              </li>
              <li>
                {user ? (
                  <Link to="" onClick={this.logOut}>Logout</Link>
                )
                 : (
                <Link to="/login">Login</Link>
                 )}
              </li>
            </ul>
            </header>
            <main>
            <Switch>
                <Route exact path="/">
                  {user ? (
                    <React.Fragment>
                      <div>Hello {user}!</div>
                      <EntryList 
                      entries={entries} 
                      clickEntry={this.viewEntry}
                      deleteEntry={this.deleteEntry}/>
                  </React.Fragment>) : (
                    <React.Fragment>
                      Please Register or Login
                    </React.Fragment>
                  )}
                </Route>
                <Route path="/entries/:entryId">
                  <Entry entry={entry} />
                </Route>
                <Route path="/new-entry">
                  <CreateEntry token={token} onEntryCreated={this.onEntryCreated}/>
                </Route>
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