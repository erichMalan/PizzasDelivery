'use strict';
class Pizza{
    constructor(order) {
        if(order.id)
          this.id = order.id;
        this.size = order.size;
        this.split = order.split ? order.split : false;
        if(this.split && order.size != 'L')
            throw {pizza_error:'split available only for large pizzas'};
        this.possible_toppings = ['olives', 'ham', 'bacon', 'mushrooms','egg', 'artichokes', 'chips', 'vegetables'];
        if(typeof order.quantity === 'undefined')
            this.quantity = 1;
        else if(order.quantity <= 0){
            throw {pizza_error:0,msg:'null quantity'};
        }
        else 
            this.quantity=order.quantity;
        if(order.size === 'S'){
          this.cost = 4;
          this.max_toppings = 2;
        }
        else if(order.size === 'M'){
          this.cost = 6;
          this.max_toppings = 3;
        }
        else if(order.size === 'L'){
          this.cost = 10;
          this.split=order.split;
          if (order.split){
            this.max_toppings = [3,3];
          }
          else 
            this.max_toppings = 6;
          this.possible_toppings.push('seafood');
        }
        else
          throw {pizza_error:`pizza error - ${order.size} wrong size`, pizza: this};

        if (order.tomato !== 'undefined')
            this.tomato = order.tomato;
        else
            this.tomato = true;

        // it enters in this section if and only if toppings are declared
        // to make the difference between an abstract pizza
        // and a possible order pizza

        if (order.toppings) {
            this.toppings = order.toppings;
            if(this.split){
                for (let top_list of this.toppings){
                    if (top_list !== []){
                        for (let topp of top_list){
                            if ( !this.possible_toppings.includes(topp) )
                                throw {pizza_error:`toppings error - ${topp} topping not present`, pizza: this, "topp": topp,"top_list":top_list};
                        }
                    }
                }
            }
            else{
                for (let topp of this.toppings){
                    if ( !this.possible_toppings.includes(topp) )
                        throw {pizza_error:`toppings error - ${topp} topping not present`, pizza: this};
                }
            }
            
            if (this.size !== 'L'){
                if( this.toppings.includes('seafood') )
                    throw {pizza_error:'toppings error - seafood is only available for large pizzas', pizza: this};
                if( this.toppings.length > this.max_toppings )
                    throw {pizza_error:'toppings error - number of max toppings exceeded', pizza: this};
            }
            else {
                if(this.split){
                    let left = [...this.toppings[0]];
                    let right = [...this.toppings[1]];
                    let all_topps = [...left,...right]
                    if ( all_topps.includes('seafood') ){
                        if ((!left.includes('seafood') && right.includes('seafood'))||
                            (!right.includes('seafood') && left.includes('seafood')))
                            throw {pizza_error:'toppings error - seafood must be present in both sides', pizza: this};
                        else
                            this.cost += this.cost/20
                    }
                    if (left.length > this.max_toppings[0] ||
                        right.length > this.max_toppings[1])
                        throw {pizza_error:'toppings error - number of max toppings exceeded', pizza: this};

                }
                else{
                    if( this.toppings.includes('seafood') )
                        this.cost += this.cost/20
                    if( this.toppings.length > this.max_toppings )
                        throw {pizza_error:'toppings error - number of max toppings exceeded', pizza: this};
                }
                    
            }
        }
    }

    assign(json) {
        Object.assign(this, json);
    }
    static from(json) {
        const t =  Object.assign(new Pizza(), json);
        return t;
    }
}

module.exports = Pizza;
