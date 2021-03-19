import React from 'react';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

const PizzaEl = (props) => {

    let {pizza,avail} = props;
    let tops = null;
    
    if (pizza.max_toppings.length !== 2) 
      tops=pizza.max_toppings;
    else{
      tops = "["+pizza.max_toppings.join("-")+"] per side! ";
      let seafood = "seafood (+20%)"
      pizza.possible_toppings[pizza.possible_toppings.length - 1] = seafood;
    }
      
    return(

            <Container style={{textAlign:"center"}}>
              <Row>
                <Col xs={6} md={4}></Col>
                <Col xs={6} md={4}><h3>PIZZA {pizza.size} : {avail} available </h3></Col>
                <Col xs={6} md={4}></Col>
              </Row>
              <Row>
                <Col>
                <p> up to {tops} between {pizza.possible_toppings.join(" - ")}</p>
                </Col>
              </Row>
              <Row>
                <Col xs={6} md={4}></Col>
                <Col xs={6} md={4}><p>cost : {pizza.cost}€</p></Col>
                <Col xs={6} md={4}></Col>
              </Row>
            </Container>
    );
  }
  

export default PizzaEl;