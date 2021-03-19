import React from 'react';
const OrderDetail = (props) => {

    let {order} = props;
    const mapValue = (val) => {
      if (typeof(val) === "boolean")
        return val ? "yes" : "no";
      else if (Array.isArray(val) && val.length === 0)
        return "None";
      else if (Array.isArray(val))
        return val.join(',');
      else 
        return val;
    }

    let toppings = order.split ? <><th key = {order.id+"detailtoppleft"}>{mapValue(order.toppings[0])}</th><th key = {order.id+"detailtoppright"}>{mapValue(order.toppings[1])}</th></> 
    : <th key = {order.id+"detailtoppingboth"} colSpan={2}>{mapValue(order.toppings)}</th>


    return (<tr key = {order.id+"detail-head"}>
                <th key = {order.id+"detail-id"}>{mapValue(order.id)}</th>
                <th key = {order.id+"detail-size"}>{mapValue(order.size)}</th>
                <th key = {order.id+"detail-tomato"}>{mapValue(order.tomato)}</th>
                        {toppings}
                <th key = {order.id+"detail-quan"}>{mapValue(order.quantity)}</th>
                <th key = {order.id+"detail-cost"}>{mapValue(order.cost)}</th>
            </tr>);
            
  }
  

export default OrderDetail;