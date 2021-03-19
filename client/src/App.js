import React from 'react';
import './App.css';

//router
import {Redirect, Route} from 'react-router-dom';
import {Switch} from 'react-router';
import { withRouter} from 'react-router-dom';


// bootstrap
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from'react-bootstrap/Alert';
import Spinner from'react-bootstrap/Spinner';

// my files
import Menu from './Components/Menu';
import LoginForm from './Components/LoginForm';
import SignupForm from './Components/SignupForm';
import API from './api/API';
import PizzasList from './Components/PizzasList';
import OrderList from './Components/OrderList';
import {AuthContext} from './auth/AuthContext';
import RouteAcc from './Components/RouteAccess';
import Logout from './Components/Logout';
import HistoryList from './Components/HistoryList';
import logo from './logo.png';


class App extends React.Component {
  constructor(props) {
    super();
    console.log("instantiated");
    this.state = {pizzas: [],
                  orderResponse: null,
                  authUser: null,
                  authError: null,
                  error: null,
                  isLoading: this.isLoading,
                  login: this.login,
                  signup: this.signUp,
                  logout: this.handleLogout,
                  orders: {}};
    this.isLoading = this.isLoading.bind(this);
    this.getHistory = this.getHistory.bind(this);
    this.executeOrder = this.executeOrder.bind(this);
    this.getPublicPizzas = this.getPublicPizzas.bind(this);
  }

  componentDidMount() {
    console.log("mounted");
    this.loading();
    this.checkAuth();
    this.stopLoading();
  }

  handleErrors(err) {
    if(!err || Object.keys(err).length === 0){
      this.setState({error:"internal error, service unavailable"});
    }
    if (err) {
        if (err.status && err.status === 401) {
          if(this.state.authError){
            this.setState({authErr: null, authUser:null, error: null});
            this.props.history.push("/login");
          }
          else{
            this.setState({authErr: err.errorObj, authUser:null});
          }
        }
        else{
          try{
            let e = err.errors[0].msg;
            this.setState({error:e});
          }catch(e){
            this.setState({error:"an error occurred please reload the page"});
          }
        }
    }
  }

  /*
  *   ALWAYS ACCESSIBLE METHODS ###################################################################################
  */

  loading = () => {
    this.setState({error:null});
    this.setState({loading: true});
  }

  stopLoading = () => {
    this.setState({loading: false});
  }

  isLoading = () => {
    return this.state.loading;
  }

  checkAuth = () => {
    API.isAuthenticated().then(
      (user) => {
        this.setState({authUser: user});
      }
    ).catch((err) => {
        this.handleErrors(err);
    });
  }



  getPublicPizzas = () =>{
    this.loading();
    API.getPublicPizzas()
      .then((pizzas) => {this.setState({pizzas: pizzas})})
      .catch((errorObj) => {
        if(!errorObj){
          this.setState({err:"internal error, service unavailable"});
        }
        this.handleErrors(errorObj);
      })
      .finally(() => this.stopLoading());
  }

  handleLogout = () => {
    console.log("logout request");
    this.loading();
    API.userLogout().then(() => {
      this.setState({authUser: null,authErr: null, pizzas: [], error:null});
      this.getPublicPizzas();
    }).catch((errorObj) => {
      if(!errorObj){
        this.setState({err:"internal error, service unavailable"});
      }
      this.handleErrors(errorObj);
    }).finally(() => this.stopLoading());
  }

  login = (username, password) => {
    this.loading();
    API.userLogin(username, password).then(
      (user) => {
        this.setState({authUser: user, authErr: null})
      }
    ).catch(
      (errorObj) => {
        if(!errorObj){
          this.setState({err:"internal error, service unavailable"});
        }else{
          this.handleErrors(errorObj);
        }
      }
    ).finally(() => this.stopLoading());

  }

  signUp = (username, password, repwd) => {
    this.loading();
    API.userSignup(username, password, repwd).then(
      (user) => {
        console.log(user);
        this.setState({authUser: user, authErr: null})
      }
    ).catch(
      (errorObj) => {
        if(!errorObj){
          this.setState({err:"internal error, service unavailable"});
        }else{
          this.handleErrors(errorObj);
        }
      }
    ).finally(() => this.stopLoading());
  }


  /*
  *   ACCESSIBLE ONLY WHEN AUTHENTICATED METHODS #################################################################à
  */

  async executeOrder(order) {
    return new Promise((resolve,reject) => {
    let result = {};
    this.loading();
    API.executeOrder(order)
      .then((success) => {setTimeout(() => this.toggleOrderAvailable(success), 5000); resolve(success); })
      .catch((errorObj) => {
        if(!errorObj){
          this.setState({err:"internal error, service unavailable"});
        }
        if(errorObj.errors[0].errno && errorObj.errors[0].errno === 19)
          result['error']=errorObj.errors[0].msg;
        else{
          this.handleErrors(errorObj);
          result['error']="internal error";
        }
        reject(result);
      })
      .finally(() => {
        this.stopLoading();
      });
    });

  }

  getHistory = () => {
    this.loading();
    API.getHistory()
      .then((orders) => {
        this.setState({orders:orders});
      })
      .catch((errorObj) => {
        if(!errorObj){
          this.setState({err:"internal error, service unavailable"});
        }else{
          this.handleErrors(errorObj);
        }
      })
      .finally(() => this.stopLoading());
  }

  getHistoryId = (orderId) => {
    this.loading();
    API.getHistoryId(orderId)
      .then((orderDetail) => {
        let orders = {...this.state.orders};
        orders[orderId].detail = orderDetail;
        this.setState({orders:orders});
      })
      .catch((errorObj) => {
        if(!errorObj){
          this.setState({err:"internal error, service unavailable"});
        }else{
          this.handleErrors(errorObj);
        }
      })
      .finally(() => this.stopLoading());
  }

  toggleOrderAvailable(success=null){
    this.setState({orderAvailable:success});
  }

  toggleOrderResponse(success=null){
    this.setState({orderResponse:success});
  }

  getAlert(){
    return <Alert variant="success" key={"success-panel"} onClose={() => this.toggleOrderAvailable()} dismissible>
    <Alert.Heading>Order Ready</Alert.Heading>
    <p>
    The order {this.state.orderAvailable.order} of {this.state.orderAvailable.user} is ready to be collected</p>
    <hr />
    <p>Enjoy your meal!</p>
    </Alert>
  }



  render(){
    return (
      <AuthContext.Provider value={this.state}>
          <Container fluid>
            <Row style={{textAlign:'center'}}>
            <Col>
            <h1>Dentini's<img src={logo} alt="Logo" style={{pad:'0.5vh', height: '70px', margin:'15px'}}/></h1>
            </Col>
          </Row>
            <Row >
            <Menu showSidebar={this.showSidebar} />
            </Row>
            </Container>
            <Container>
            {this.state.authErr &&
                            <Alert variant= "danger">
                                {this.state.authErr.msg}
                            </Alert>
                            }
            {this.state.error &&
                            <Alert variant= "danger" dismissable="true">
                                {this.state.error}
                            </Alert>
                            }</Container>
            <div className="view">
            <Container fluid>
            <Row className="vheight-95">
            <Col className="below-nav">
            {this.state.orderAvailable && this.getAlert()}
            <Switch>
                    <Route exact path="/">
                        <Redirect to="/public" />
                    </Route>
                  {/*                     loading                    */}
                  <RouteAcc path="/loading" InternalComponent={<Spinner animation="grow" variant="primary" size="lg"/>}
                  auth = {this.state.authUser} restricted={true} home={true} isLoading={this.isLoading}></RouteAcc>

                  {/*                     pizzas                    */}

                  <RouteAcc path="/public" InternalComponent={(<div className="below-nav" style={{textAlign:'center',margin:'30px'}}>
                        <h2><strong>Our Pizzas</strong></h2>
                        <PizzasList disp = {this.state.pizzas} getPublicPizzas={this.getPublicPizzas}></PizzasList></div>)}
                        auth = {this.state.authUser} restricted={true} home={true} isLoading={this.isLoading}></RouteAcc>


                {/*                     login                    */}
                <RouteAcc path="/login" InternalComponent={<LoginForm/>} needLog={false} isLoading={this.isLoading}/>

                {/*                     signup                    */}
                <RouteAcc path="/signup" InternalComponent={<SignupForm/>}  needLog={false} isLoading={this.isLoading}/>



                {/*                     book                     */}
                <RouteAcc path="/book" InternalComponent={(
                      <OrderList submitOrder={this.executeOrder} avail={this.state.pizzas} getPublicPizzas={this.getPublicPizzas}></OrderList>)}
                      auth = {this.state.authUser} needLog={true} isLoading={this.isLoading} />

                {/*                     logout                   */}
                <RouteAcc path="/logout" InternalComponent={<Logout logout={this.state.logout} auth = {this.state.authUser}/>}
                auth = {this.state.authUser} needLog={true} isLoading={this.isLoading}/>

                {/*                     history                  */}
                <RouteAcc path="/history" InternalComponent={(
                      <HistoryList orders={this.state.orders} details={this.state.details} auth = {this.state.authUser} getHistory={this.getHistory} getHistoryId={this.getHistoryId} ></HistoryList>)}
                      auth = {this.state.authUser} needLog={true} isLoading={this.isLoading}/>

            </Switch>
            </Col>
            </Row>
            </Container>

          </div>
      </AuthContext.Provider>
    );
  }

}

export default withRouter(App);
