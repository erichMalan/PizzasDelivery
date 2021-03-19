import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Pizza from '../api/Pizza.js'
import Form from 'react-bootstrap/Form';
import Alert from'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';


class PizzaForm extends React.Component {
  constructor(props){
    super(props);
    let init_state = {};
    for (const [key, value] of Object.entries(this.props)){
      if(typeof(value) === 'function' || key === 'setOrder')
        continue
      init_state[key] = value;
    }

    if(props.setOrder){
      init_state.order={...props.setOrder};
    }

    else{
      let p = null;
      try{
        p = new Pizza({id: props.id, size:'S',toppings:[], quantity:1, tomato:true, split:false});
      }catch(e){
        console.log(e);
      }
      init_state.order={...p};
    }

    this.state={...init_state};
    this.error = null;
    this.recreated = props.setOrder === null ? true : false;
  }

  componentDidMount(){
    this.commitOrder(this.state.order);
  }

  showErr(e){
    console.log(e);
    this.setState({error:e});
  }

  closeAlert(){
    this.setState({error:null});
  }

  commitOrder(p){
    this.props.commit(p)
              .then(()=>{this.closeAlert(); this.setState({order:p})})
              .catch((error)=>this.showErr(error));
  }

  toggleTopping = (name_side,value) => {
    let partial_state = JSON.parse(JSON.stringify(this.state.order));
    let top = name_side.split('-');
    let name = top[0];
    if(partial_state.split){
      let left_toppings = partial_state.toppings[0].length > 0 ? partial_state.toppings[0] : [];
      let right_toppings = partial_state.toppings[1].length > 0 ? partial_state.toppings[1] : [];
      if (top[1] === 'left' ){
        if(value && !left_toppings.includes(name)){
          left_toppings = [...left_toppings,name];
          if (left_toppings.includes('seafood') && !right_toppings.includes('seafood'))
            right_toppings = [...right_toppings,name];
        }
        else{
          left_toppings = left_toppings.filter((e) => e !== name);
          if (!left_toppings.includes('seafood') && right_toppings.includes('seafood'))
            right_toppings = right_toppings.filter((e) => e !== name);
        }

      } else {
        if(value && !right_toppings.includes(name)){
          right_toppings = [...right_toppings,name];
          if (right_toppings.includes('seafood') && !left_toppings.includes('seafood'))
            left_toppings = [...left_toppings,name];
        }
        else{
          right_toppings = right_toppings.filter((e) => e !== name);
          if (!right_toppings.includes('seafood') && left_toppings.includes('seafood'))
            left_toppings = left_toppings.filter((e) => e !== name)
        }

      }
      partial_state.toppings = [[...left_toppings],[...right_toppings]];
    }
    else{
      if(value&& !partial_state.toppings.includes(name))
        partial_state['toppings'].push(name)
      else
        partial_state['toppings'] = partial_state['toppings'].filter((e) => e !== name)
    }
    this.dumpOrder(partial_state);
  }

  handleChange = (name,value,split=null) => {
    value = (value === 'on' ? true : value ) === 'off' ? false: value;
    let partial_state = JSON.parse(JSON.stringify(this.state.order));
    if(name==="quantity"){
      partial_state.quantity += value;
    }
    else
      partial_state[name] = value;
    if(name === 'size'){
      partial_state.toppings = [];
      split=false;
    }
    partial_state.split = split !== null ? split : partial_state.split;
    this.dumpOrder(partial_state);
  };

  splitPizza = (value) => {
    console.log(value,this.state.order.split);
    let toppings=[];
    if (this.state.order.size !== 'L'){
      this.showErr("split available only for large pizzas");
      return;
    }
    else {
      if(value)
        toppings = [[],[]];
    }
    this.handleChange('toppings',toppings,value);
  }

  dumpOrder(partial_state){
    let p = null;
    try{
      p = new Pizza(partial_state);
    }catch(e){
      if(e.pizza_error === 0){
        this.props.remove(partial_state.id);
      }
      this.showErr(e.pizza_error);
      return null;
    }
    this.commitOrder(p);
  };

  getToppingStatus = (name,side) => {
    if(this.state.order.split){
      let idx = side === 'left' ? 0 : 1;
      return this.state.order.toppings[idx].includes(name);
    }
    return this.state.order.toppings.includes(name);

  }

  getToppings(side="left") {
    return this.state.order.possible_toppings.map((top) => (
                          <Form.Check key={this.state.id+top+side} type={"checkbox"} style={{textAlign:"left"}}>
                          <Form.Check.Input key={this.state.id+top+side+"input"}
                          checked={this.getToppingStatus(top,side)}
                          id={this.state.id+top+side}
                          onChange={(ev) => this.toggleTopping(ev.target.name, ev.target.checked)}
                          name = {top+"-"+side}/><Form.Check.Label>{top}</Form.Check.Label></Form.Check>));
  }

  getDToppings() {
    return (
      <Row>
        <Col sm={9} md={6}>
          <p>Left side</p>
          {this.getToppings()}
        </Col>
        <Col sm={9} md={6}>
          <p>Right side</p>
          {this.getToppings("right")}
        </Col>
      </Row>
    );
  }

  render () {
    return (
      <Row style={{borderRadius: '15px',
                border: '1px solid #e0736c',
                padding:'20px'}}>
          <Col sm={4} md={3}>
          <Form.Group controlId="formGridSize">
              <Form.Label >Size</Form.Label>
              <Form.Control as="select" defaultValue="S" onChange={(ev) => this.handleChange('size',ev.target.value)}>
                <option value={'S'}>Small</option>
                <option value={'M'}>Medium</option>
                <option value={'L'}>Large</option>
              </Form.Control>
            </Form.Group>
          {this.state.order.size === "L" && <Form.Group controlId={this.state.order.id+"formGridSplitToppings"}>
                                          <Form.Label>Split Toppings</Form.Label>
                                              <Form.Check id={this.state.order.id+"formHSplitCheckWrapper"}>
                                              <Form.Check.Input
                                                name="split"
                                                checked={this.state.order.split}
                                                onChange={(ev) => {this.splitPizza(ev.target.checked)}}/>
                                              </Form.Check></Form.Group>}

          </Col>
          {!this.state.order.split &&
          <Col sm={4} md={3} >
          <Form.Group controlId="formGridLeftToppings">
            <Form.Label style={{textAlign:"center"}}>Toppings</Form.Label>
            {this.getToppings()}
          </Form.Group>
          </Col>}


            {this.state.order.split &&
            <Col sm={8} md={5}><Form.Group controlId="formGridRightToppings">
            <Form.Label>Toppings</Form.Label> {this.getDToppings()}
          </Form.Group></Col>}
          <Col sm={6} md={3}>
          <Row/>
          <Form.Group controlId={this.state.order.id+"formTomato"}>

            <Form.Check type="switch" id={this.state.order.id+'tomatoWrapper'}
              name="tomato"
              checked={this.state.order.tomato}
              onChange={(ev) => {this.handleChange(ev.target.name,ev.target.checked);}}>
            </Form.Check><Form.Label>Tomato</Form.Label>
            </Form.Group>

            <Form.Group controlId="formQuantity">
            <Row>
              <label>Quantity</label>
            </Row>
            <Row>
              <Col>
              <Button onClick={(ev) => {this.handleChange('quantity',-1)}}>-</Button>
              </Col>
              <Col>
              <p>{this.state.order.quantity}</p>
              </Col>
              <Col>
              <Button onClick={(ev) => {this.handleChange('quantity',1)}}>+</Button>
              </Col>
            </Row>
            <Row>
            <Col style={{margin:"20px"}}>
              <b>Price: </b><p>{this.state.order.quantity*this.state.order.cost}€</p>
              </Col>
              </Row>
          </Form.Group>

          </Col>
          <Col>
          {this.state.error &&
          <Alert variant="warning" onClose={(ev) => this.closeAlert(ev)} dismissible>
            <Alert.Heading>Error!</Alert.Heading>
             {this.state.error}
          </Alert>}
          </Col>

        </Row>
 );
  }
}
export default PizzaForm;
