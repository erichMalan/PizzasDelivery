import React,{ useEffect } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import PizzaEl from './PizzaElement'
import Container from 'react-bootstrap/esm/Container';

const PizzasList = (props) => {

  let {disp,getPublicPizzas} = props;

  useEffect(() => {
      getPublicPizzas();
  }, []);


  return(
    <Container>
        <ListGroup as="ul" variant="flush">
            {disp.map((el) =><ListGroup.Item key={el[1].id+el[1].size+el[0]}> <PizzaEl pizza = {el[1]} avail = {el[0]} key={el[1].id}></PizzaEl></ListGroup.Item>)}
        </ListGroup>
        </Container>
  );
}

export default PizzasList;
