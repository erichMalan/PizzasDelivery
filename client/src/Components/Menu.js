import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import {AuthContext} from '../auth/AuthContext'
import {NavLink} from 'react-router-dom';
import Container from 'react-bootstrap/esm/Container';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';



class Menu extends React.Component {

  constructor(props){
    super(props);
    this.state = {collectOrder: props.collectOrder};
  }

  render(){
    return (
    <AuthContext.Consumer>
      {(context) => (
        <Container fluid="md">
          <Row>
          <Col md={{ span: 6, offset: 3 }}>
          <Navbar>
            <Nav className="mr-auto">
              <Nav.Link as={NavLink} to="/public" > Browse pizzas! </Nav.Link>
              {!context.authUser && <>
                <Nav.Link as={NavLink} to="/login" > Log in </Nav.Link>
                <Nav.Link as={NavLink} to="/signup" > Sign up </Nav.Link> </>}
              {context.authUser && <>
                <Nav.Link as={NavLink} to="/book" > Browse & book </Nav.Link>
                <Nav.Link as={NavLink} to="/history"> Check History </Nav.Link>
                <Nav.Link as={NavLink} to="/logout"> Log out </Nav.Link> </>
              }
            </Nav>
          </Navbar>
          </Col>
          </Row>
        </Container>
      )}
    </AuthContext.Consumer>);
  }
}

export default Menu;
