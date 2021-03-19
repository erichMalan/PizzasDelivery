import React,{ useEffect } from 'react';
import { Route, Redirect } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {AuthContext} from '../auth/AuthContext';

const RouteAcc = (props) => {

        let {path,needLog,InternalComponent, isLoading} = props;
        let loading=false;
        let Component = <Route path={path} >
                            <Row className="vheight-100" style={{textAling:'center'}}>
                                <Col className="below-nav">
                                    {InternalComponent}
                                </Col>
                            </Row>
                        </Route>;
        useEffect(() => {
            loading=isLoading();
            if(loading)
                return <Redirect to="/loading"></Redirect>;
        }, []);



        if (props.home)
            return Component;

        else
            return (<AuthContext.Consumer>

                {(context) => (<div>
                    {((context.authUser && needLog) || !(context.authUser && needLog)) &&
                        Component
                    }
                    {!context.authUser && needLog &&
                        <Redirect to="/public"></Redirect>
                    }
                </div>)}
            </AuthContext.Consumer>);

}
export default RouteAcc;
