import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
const axios = require('axios');
export default function withAuth(ComponentToProtect) {
  return class extends Component {
    constructor() {
      super();
      this.state = {
        loading: true,
        redirect: false,
      };
    }
    //life-cycle method that will be called automatically
    //this will be called after render() and before it displays
    componentDidMount() {
      axios.get('/api/checkToken')
        .then(res => {
          if (res.status === 200) {
            this.setState({ loading: false });
          } else {
            const error = new Error(res.error);
            throw error;
          }
        })
        .catch(err => {
          console.error(err);
          this.setState({ loading: false, redirect: true });
      });
    }
    render() {
      const { loading, redirect } = this.state;
      if (loading) {
        return null;
      }
      if (redirect) {
        return <Redirect to="/signin" />;
      }
      return <ComponentToProtect {...this.props} />;
    }
  }
}