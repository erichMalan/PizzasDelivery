class Pizza{
    constructor(order) {
        if(order.id)
          this.id = order.id;
        this.size = order.size;
        order.split = order.split ? order.split : false;
        if(order.split && order.size !== 'L'){
            let err = {pizza_error:'split available only for large pizzas'}
            throw err;
        }
            
            
        this.possible_toppings = ['olives', 'ham', 'bacon', 'mushrooms','egg', 'artichokes', 'chips', 'vegetables'];
        if(typeof order.quantity === 'undefined')
            this.quantity = 1;
        else if(order.quantity <= 0){
            let err = {pizza_error:0,msg:'null quantity'};
            throw err;
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
        else{
            let err = {pizza_error:`pizza error - ${order.size} wrong size`, pizza: this};
            throw err;
        }
          

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
                            if ( !this.possible_toppings.includes(topp) ){
                                let err =  {pizza_error:`toppings error - ${topp} topping not present`, pizza: this, "topp": topp,"top_list":top_list};
                                throw err;
                            }  
                        }
                    }
                }
            }
            else{
                for (let topp of this.toppings){
                    if ( !this.possible_toppings.includes(topp) ){
                        let err =  {pizza_error:`toppings error - ${topp} topping not present`, pizza: this};
                        throw err;
                    }
                }
            }
            
            if (this.size !== 'L'){
                if( this.toppings.includes('seafood') ){
                    let err =  {pizza_error:'toppings error - seafood is only available for large pizzas', pizza: this};
                    throw err;
                }
                    
                if( this.toppings.length > this.max_toppings ){
                    let err = {pizza_error:'toppings error - number of max toppings exceeded', pizza: this};
                    throw err;
                }
            }
            else {
                if(this.split){
                    let left = [...this.toppings[0]];
                    let right = [...this.toppings[1]];
                    let all_topps = [...left,...right]
                    if ( all_topps.includes('seafood') ){
                        if ((!left.includes('seafood') && right.includes('seafood'))||
                            (!right.includes('seafood') && left.includes('seafood'))){
                            let err =  {pizza_error:'toppings error - seafood must be present in both sides', pizza: this};
                            throw err;
                        }
                        else
                            this.cost += this.cost/20
                    }
                    if (left.length > this.max_toppings[0] ||
                        right.length > this.max_toppings[1]){
                        let err = {pizza_error:'toppings error - number of max toppings exceeded', pizza: this};
                        throw err;
                         }

                }
                else{
                    if( this.toppings.includes('seafood') )
                        this.cost += this.cost/20
                    if( this.toppings.length > this.max_toppings ){
                      let err =  {pizza_error:'toppings error - number of max toppings exceeded', pizza: this};
                      throw err;
                }
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

export default Pizza;
