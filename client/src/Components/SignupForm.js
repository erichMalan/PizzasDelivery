import React from 'react';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from'react-bootstrap/Button';
import Alert from'react-bootstrap/Alert';
import {Redirect} from 'react-router-dom';
import {AuthContext} from '../auth/AuthContext';


class SignupForm extends React.Component {
    constructor(props){
        super(props);
        this.state = {email: '', pwd: '', repwd: '', sub: false};
    }
    onChangeField = (name,value) => {this.setState({[name] : value});};
    handleSubmit = (event,signup) => {
        event.preventDefault();
        if(this.state.pwd !== this.state.repwd){
            alert("passwords don't match!");
            return;
        }
        console.log("signup attempt:",this.state.email);
        signup(this.state.email,this.state.pwd,this.state.repwd);
        this.setState({sub : true});
    }
    handleButton = (event) => {
        event.preventDefault();
    }
    render() {
        return(
            <AuthContext.Consumer>
                {(context) => (
            <div className="signupscreen">
                {!context.authUser &&
                <Container>
                    <Row style={{textAlign:'center'}}>
                        <Col md={{span:4,offset:4}}>
                            <Form method="POST" onSubmit={(event) => this.handleSubmit(event, context.signup)}>
                                <Form.Group controlId="username">
                                    <Form.Label>E-mail</Form.Label>
                                    <Form.Control type="email" name="email" placeholder="E-mail" value = {this.state.email} onChange={(ev) => this.onChangeField(ev.target.name,ev.target.value)} required autoFocus/>
                                </Form.Group>

                                <Form.Group controlId="password">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" name="pwd" placeholder="Password" value = {this.state.pwd} onChange={(ev) => this.onChangeField(ev.target.name,ev.target.value)} required/>
                                </Form.Group>
                                <Form.Group controlId="repassword">
                                    <Form.Label>Repeat Password</Form.Label>
                                    <Form.Control type="password" name="repwd" placeholder="Repeat Password" value = {this.state.repwd} onChange={(ev) => this.onChangeField(ev.target.name,ev.target.value)} required/>
                                </Form.Group>

                                <Button variant='primary' type="submit">Signup</Button>
                                {this.state.authErr &&
                            <Alert variant= "danger">
                                {context.authErr.msg}
                            </Alert>
                            }
                            </Form>
                        </Col>
                    </Row>
                </Container>}
                {context.authUser && <Redirect to="/book" push></Redirect>}
            </div>
            )}
        </AuthContext.Consumer>

        );
    }

}
export default SignupForm;
