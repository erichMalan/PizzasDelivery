import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import PizzaForm from './PizzaForm.js';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { AuthContext } from '../auth/AuthContext.js';
import {Redirect} from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/esm/Alert';
import HistoryEl from './HistoryEl';
import Container from 'react-bootstrap/Container';

class OrderList extends React.Component {
  constructor(props){
    super(props);
    let pavail = {avail:{},diff:{}};
    Object.values(props.avail).forEach((p)=>{pavail.avail[p[1].size]=p[0]});
    this.state = { Pizzas: {}, avail:pavail, submit:false, result:null};
    this.handleCommit = this.handleCommit.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.comanda = {};
  }

  componentDidMount(){
    this.props.getPublicPizzas();
    this.snapshot={};
    this.handleAdd();
    this.updateAvail();
  }

  async updateAvail(){
    let pavail = {avail:{},diff:{}};
    Object.values(this.props.avail).forEach((p)=>{pavail.avail[p[1].size]=p[0]});
    pavail.diff['S'] = pavail.avail['S']-Object.values(this.comanda).filter((el)=> el.size==='S').map((el)=>el.quantity).reduce((total,value)=>{return total+value},0);
    pavail.diff['M'] = pavail.avail['M']-Object.values(this.comanda).filter((el)=> el.size==='M').map((el)=>el.quantity).reduce((total,value)=>{return total+value},0);
    pavail.diff['L'] = pavail.avail['L']-Object.values(this.comanda).filter((el)=> el.size==='L').map((el)=>el.quantity).reduce((total,value)=>{return total+value},0);

    if(Object.keys(pavail.diff).filter((key)=>pavail.diff[key]<0).length>0)
      pavail.type="danger";
    else if(Object.keys(pavail.diff).filter((key)=>pavail.diff[key]===0).length)
      pavail.type="warning";
    else
      pavail.type="info";
    this.setState({avail:pavail});
  }

  componentDidUpdate(){
    let pavail = {...this.state.avail};
    for(let pizza of this.props.avail){
      if(pizza[0] !== pavail.avail[pizza[1].size]){
        Object.values(this.props.avail).forEach((p)=>{pavail.avail[p[1].size]=p[0]});
        this.setState({avail:pavail});
        break;
      }
    }
  }



  handleAdd() {
    let id = this.generateKey(Object.keys(this.state.Pizzas).length);
    let pizza_gui = this.createPizzaElem(id);
    var pizzas = {...this.state.Pizzas}
    pizzas[id] = pizza_gui;
    this.setState({Pizzas:pizzas});
  }

  handleRemove = (id) => {
    let new_pizzas = {...this.state.Pizzas};
    delete new_pizzas[id];
    delete this.comanda[id];
    this.setState({Pizzas:new_pizzas}, () =>
      Object.keys(this.state.Pizzas).length<1 ?
        this.handleAdd() : null
    )
    this.updateAvail();
  }

  handleCancel(){
    this.comanda={};
    this.setState({Pizzas: {}},() =>{
      this.handleAdd();
    });
    this.updateAvail();
  }

  async handleCommit(order) {
    return new Promise((resolve,reject) => {
      if(!order)
        reject("order undefined");
      let id = order.id;
      if(!(Object.keys(this.comanda).includes(id)) && (Object.keys(this.comanda) > 0)){
        let msg = id+'-pizza not present into'+Object.keys(this.comanda);
        this.setState({'error':msg});
        reject(msg);
      }
      this.comanda[id] = order;
      let up = {...this.getSummary()};
      this.setState({summary:up});
      resolve(order);
      this.updateAvail();
    });
  }

  getSummary(){
    let quantity = Object.values(this.comanda).map((v)=>v.quantity).reduce((total,value)=>{return total+value},0);
    let cost = Object.values(this.comanda).map((v)=>v.quantity*v.cost).reduce((total,value)=>{return total+value},0);
    let discount = 0;
    if(quantity>3)
      discount=10;
    let total =cost - (cost*discount/100)
    return{'quantity':quantity,'cost':cost, 'discount':discount, 'total':total};
  }


  async handleSubmit(e){
    e.preventDefault();
    let pizzasSnapshot = JSON.parse(JSON.stringify(this.state.Pizzas))
    this.snapshot = {orders:pizzasSnapshot,comanda:{}};
    let orders = JSON.parse(JSON.stringify(this.comanda));
    this.snapshot['comanda'] = orders;
    if(Object.keys(orders).length<1)
      this.setState( {error:"order empty, configure your order"})
    if(!Object.keys(this.comanda).sort().join(',') === Object.keys(this.state.Pizzas).sort().join(',')){
      this.setState( {error:"an error occurred, cancelling order"});
      this.handleCancel();
      return;
    }
    this.setState({submit:true});
    await this.props.submitOrder(this.comanda).then((resp) => {
      this.setState({result:resp});
    }).catch((problem)=>{
      this.setState({result:problem});
    }).finally(this.props.getPublicPizzas());

  }

  createPizzaElem(id,o=null){
    let formid = "PizzaForm-"+id;
    return <PizzaForm id={id} key={formid} remove={this.handleRemove} commit={this.handleCommit} setOrder={o}></PizzaForm>
  }

  generateKey = (pre) => {
    return `${ pre }_${ new Date().getTime() }`;
  }

  toggleOrderSent = (ev) => {
    ev.preventDefault();
    this.setState({submit:false});
  }

  getOrderSubmittedAlert = () => {
    let sub =  Object.keys(this.state.result)[0] === "error" ? false : true;
    if(sub){ return(
      <Alert variant="primary" key={"success-panel-order"}>
        <Alert.Heading>Order Sent</Alert.Heading>
        <p>
        The order of has been committed</p>
        <hr />
        <p>You will receive soon a notification when it is ready to be collected</p>
        <Button onClick={(ev) => {this.backToOrder(ev)}}> New order </Button>
      </Alert>);
    }
    else{ return(
      <Alert variant="danger" key={"success-panel-order"}>
        <Alert.Heading>Order error</Alert.Heading>
        <p>
        The order of has been rejected</p>
        <hr />
        <p>Reason: {this.state.result.error}</p>
        <Button onClick={(ev) => {this.backToOrder(ev)}}> New order </Button>
        <Button onClick={(ev) => {this.backToOrder(ev,false)}}> Modify </Button>
      </Alert>);
    }
  }

  backToOrder = (ev,cancel=true) => {
    ev.preventDefault();
    this.setState({submit:false});
    if(!cancel){
      let GUIS = Object.keys(this.snapshot.comanda).map((k) => this.createPizzaElem(k,this.snapshot.comanda[k]));
      this.comanda = {...this.snapshot.comanda};
      this.setState({Pizzas:{...GUIS}});
    }
    else{
      this.handleCancel();
    }
  }


  getPizza(id){
    let p = {...this.state.Pizzas[id]};
    return p;
  }

  render() {
    return (
          <AuthContext.Consumer>
            {(context) => ( <>
            {this.state.Pizzas &&
            <Container fluid style={{textAlign:'center'}}>{context.authUser && <Container fluid>
              <Row style={{margin:'20px'}}>
                <Col>
                <h2><strong>Book your Pizzas</strong></h2></Col></Row>
                {!this.state.submit &&
                  <Form method="POST" onSubmit={(event) => this.handleSubmit(event)}>
                 <Row>
                   <Col md={{ span: 6, offset: 1 }} >
                   <div style={{overflowY:'auto',maxHeight:'vheight-80'}}>
                   <ListGroup as="ul" variant="flush">
                      {Object.keys(this.state.Pizzas).map((id) => <ListGroup.Item key={id}>{this.state.Pizzas[id]}</ListGroup.Item>)}
                    </ListGroup>
                    </div>
                    <Button onClick={() => {this.handleAdd()}}> New </Button>
                    </Col>
                            <Col  md={{ span: 4 }}>
                          {Object.keys(this.state.avail.diff).length>0 && !Object.values(this.state.avail.diff).filter((s) => isNaN(s)).length>0 && 
                          <Alert variant={this.state.avail.type} key={"availability-panel"}>
                            <Alert.Heading>Availability</Alert.Heading>
                            <Table size="sm">
                            <thead>
                              <tr>
                                <th></th>
                              {Object.keys(this.state.avail.avail).map((el) => <th key={el+"sizeHeadTable"}>{el}</th>)}
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <th>Available</th>
                              {Object.keys(this.state.avail.avail).map((el) => <th key={el+"AvailablesizeTableBody"}>{this.state.avail.avail[el]}</th>)}
                              </tr>
                                <tr><th>Remaining</th>
                                {Object.keys(this.state.avail.diff).map((el) => <th key={el+"RemainingsizeTableBody"}>{this.state.avail.diff[el]}</th>)}
                                </tr>
                              </tbody>
                            </Table>
                            </Alert>
                            }

                           {Object.keys(this.comanda).length>0 &&
                           <HistoryEl order={this.comanda} key={"OrderDetailsTable"} status={this.state.summary}></HistoryEl>
                          }<Row>
                            <Col offset={3}>
                          <Button onClick={() => {this.handleCancel()}} style={{backgroundColor:'#e04d43'}}> Cancel </Button>
                          </Col>
                          <Col>
                          <Button type='submit'  variant='primary'
                         > Confirm </Button>
                          </Col>
                          </Row>
                          </Col></Row>
                  </Form>}
                {this.state.submit && this.state.result && this.getOrderSubmittedAlert()}
              </Container>}
                  {!context.authUser && <Redirect to="/public" push></Redirect>}</Container>} </>)}
            </AuthContext.Consumer>);
  }
}
export default OrderList;
