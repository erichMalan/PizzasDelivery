import React from 'react';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from'react-bootstrap/Button';
import Alert from'react-bootstrap/Alert';
import {Redirect} from 'react-router-dom';
import {AuthContext} from '../auth/AuthContext';


class LoginForm extends React.Component {
    constructor(props){
        super(props);
        this.state = {email: '', pwd: '', sub: false}; //, loginscreen:[], loginmessage:'', buttonLabel:'Register',isLogin:true
    }
    onChangeField = (name,value) => {this.setState({[name] : value});};
    handleSubmit = (event,login) => {
        event.preventDefault();
        console.log("logging attempt:",this.state.email);
        login(this.state.email,this.state.pwd);
        this.setState({sub : true});
    }
    handleButton = (event) => {
        event.preventDefault();
    }

    render() {

        return(
            <AuthContext.Consumer>
                {(context) => (
            <div className="loginscreen">
                {!context.authUser &&
                <Container style={{textAlign:'center'}}>
                    <Row>
                        <Col md={{span:4,offset:4}}>
                            <Form method="POST" onSubmit={(event) => this.handleSubmit(event, context.login)}>
                                <Form.Group controlId="username">
                                    <Form.Label>E-mail</Form.Label>
                                    <Form.Control type="email" name="email" placeholder="E-mail" value = {this.state.email} onChange={(ev) => this.onChangeField(ev.target.name,ev.target.value)} required autoFocus/>
                                </Form.Group>

                                <Form.Group controlId="password">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" name="pwd" placeholder="Password" value = {this.state.pwd} onChange={(ev) => this.onChangeField(ev.target.name,ev.target.value)} required/>
                                </Form.Group>

                                <Button variant='primary' type="submit">Login</Button>
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
export default LoginForm;
