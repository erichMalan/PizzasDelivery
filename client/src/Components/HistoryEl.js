import React from 'react';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Alert from'react-bootstrap/Alert';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/esm/Button';
import OrderDetail from './OrderDetail';

const HistoryEl = (props) => {

    let {summary,order,expand,status} = props;
    if(!(summary || status)){
      return;
    }
    let infos = ['id','size','tomato','toppings','quantity','cost'];
    let head1 = [];
    let head2 = [];
    if(order){

      for(let info of infos){
        if(info==='toppings'){
          head1.push(<th colSpan={2} key={order.id+info}>{info}</th>);
        }
        else{
          head1.push(<th key={order.id+info}>{info}</th>);
        }
      }

      for(let info of infos){
        if(info==='toppings'){
          head2.push(<th key={order.id+info+"left"}>left</th>);
          head2.push(<th key={order.id+info+"right"}>right</th>)
        }
        else{
          head2.push(<th key={order.id+info+"sub"}></th>);
        }
      }

    }

    return(

            <Container>
              {!status && <div>
              <Row>
                <Col xs={6} md={4}></Col>
                <Col xs={6} md={4}><h3>ORDER {summary.id}</h3></Col>
                <Col xs={6} md={4}></Col>
              </Row>
              <Row>
                <Col xs={4} md={{span:3, offset:3}}><p>Pizzas : {summary.pizzas}</p></Col>
                <Col xs={4} md={{span:3}}><p>Total cost : {summary.price}</p></Col>
              </Row>
              <Row><Col md={{span:2, offset:5}}>
              <Button onClick={() => {expand(summary.id)}}>Expand</Button>
              </Col></Row></div>}

              <Row><Col md={{ offset:0}}>
              {((summary && summary.expand && order )|| status ) &&
                <Alert variant="light" >
                    <Alert.Heading>Details</Alert.Heading>
                    <Table size="sm" responsive>
                      <thead>
                        <tr>
                          {head1}
                        </tr>
                        <tr>
                          {head2}
                        </tr>
                      </thead>
                      <tbody>
                          {Object.keys(order).map((key) => <OrderDetail order={order[key]} key={key+"OrderDetail"}></OrderDetail>)}
                      </tbody>
                    </Table>
                    {status && <Table size="sm" style={{paddingTop:'80px'}}>
                            <thead>
                              <tr>
                              <th colSpan={4}>Summary</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <th>Pizzas</th>
                                <th>Cost</th>
                                <th>Discount</th>
                                <th>Total</th>
                              </tr>
                              <tr>
                                <th>{status.quantity}</th>
                                <th>{status.cost}</th>
                                <th>{status.discount}%</th>
                                <th>{status.total}</th>
                              </tr>
                            </tbody>
                          </Table>}
                </Alert>}
                </Col></Row>

            </Container>
    );
  }


export default HistoryEl;
