import React from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import HistoryEl from './HistoryEl';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/Col';
import {Redirect } from 'react-router-dom';
import Container from 'react-bootstrap/esm/Container';
import Alert from'react-bootstrap/Alert';
import {AuthContext} from '../auth/AuthContext';

class HistoryList extends React.Component {
    constructor(props){
      super(props);
      this.state={orders: props.orders};
      this.toggleExpand = this.toggleExpand.bind(this);
    }

    componentDidMount(){
        this.props.getHistory();
    }

    componentDidUpdate(){
        if (this.state.orders !== this.props.orders) {
            this.setState({orders:this.props.orders});
        }
    }

    empty(){
        return Object.keys(this.state.orders).length > 0 ? false : true;
    }

    async toggleExpand(id) {
        let orders = {...this.state.orders};
        if (!this.state.orders[id].detail)
            await this.props.getHistoryId(id);
        orders[id].expand = !orders[id].expand;
        this.setState({orders:orders});
    }

    render(){
        return(
            <AuthContext.Consumer>
            {(context) => (
            <Container stle={{textAling:'center'}}>
                <Row>
                    <Col>
                {context.authUser && !this.empty() &&
                        <ListGroup as="ul" variant="flush">
                        {Object.keys(this.state.orders).map((key) =>
                                (<ListGroup.Item id = {key} key={key+this.state.orders[key].id}>
                                    <HistoryEl summary={this.state.orders[key]} order={this.state.orders[key].detail} expand={this.toggleExpand} key={this.state.orders[key].id+"historyEl"}></HistoryEl>
                                </ListGroup.Item>))}
                        </ListGroup>}
                {context.authUser && this.empty() &&
                    <Alert variant="light">
                        <Alert.Heading>No past orders found</Alert.Heading>
                    </Alert>}
                {!context.authUser && <Redirect to="/login"></Redirect>}
                </Col>
                </Row>
            </Container>
            )}
        </AuthContext.Consumer>
        );
    }

}

export default HistoryList;
