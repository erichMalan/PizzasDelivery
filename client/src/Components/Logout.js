import React from 'react';
import {Redirect } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Alert from'react-bootstrap/Alert';
import {AuthContext} from '../auth/AuthContext';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/Col';

const Logout = (props) => {
        let {logout} = props;

        return (  <AuthContext.Consumer>
                  {(context) => (<>{context.authUser &&
                                  <Container style={{textAlign:"center"}}>
                                    <Row>
                                        <Col>
                                        <Alert>Do you want to log out?</Alert>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                        <Button onClick={() => logout()}>Yes</Button>
                                        </Col>
                                    </Row>
                                    </Container>}

                                {!context.authUser &&
                                  <Redirect to="/login"></Redirect>}
              </>)}
          </AuthContext.Consumer>);

}
export default Logout;
