import Pizza from './Pizza';
const baseURL = "/api";


async function isAuthenticated(){
    let url = "/user";
    const response = await fetch(baseURL + url);
    const userJson = await response.json();
    if(response.ok){
        return userJson;
    } else {
        let err = {status: response.status, errObj:userJson};
        throw err;  // An object with the error coming from the server
    }
}

async function userLogin(username, password) {
    return new Promise((resolve, reject) => {
        fetch(baseURL + '/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username: username, password: password}),
        }).then((response) => {
            if (response.ok) {
                response.json().then((user,email,token) => {
                    resolve(user,email,token);
                });
            } else {
                // analyze the cause of error
                response.json()
                .then((obj) => {reject(obj); }) // error msg in the response body
                .catch((err) => reject(response));//{ reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else       
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) })
        //.finally(() => {console.log("login response received");}); // connection errors
    });
}

async function userSignup(username, password, repwd) {
    return new Promise((resolve, reject) => {
        fetch(baseURL + '/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username: username, password: password, re: repwd}),
        }).then((response) => {
            if (response.ok) {
                response.json().then((user) => {
                    resolve(user);
                });
            } else {
                // analyze the cause of error
                  response.json()
                .then( (obj) => {reject(obj);} ) // error msg in the response body
                .catch( (err) => {reject(err);}); 
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) })
        
    });
}

async function userLogout() {
    return new Promise((resolve, reject) => {
        fetch(baseURL + '/logout', {
            method: 'POST',
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                // analyze the cause of error
                response.json()
                .then( (obj) => {reject(obj);} ) // error msg in the response body
                .catch( (err) => {reject(err);}); 
            }
        });
    });
}

const makePizza = function (order) {
    try{
        return new Pizza(order);
    } catch(e) {
        console.log(order,e);
        throw e;
    }
};

async function getPublicPizzas() {
    let url = "/pizzas/public";

    const response = await fetch(baseURL + url);
    const pizzasJson = await response.json();
    if(response.ok){
        return pizzasJson.map((el) => [el.availability,makePizza(el.pizza)]);
    } else {
        let err = {status: response.status, errObj:pizzasJson};
        throw err;  // An object with the error coming from the server
    }
}


async function executeOrder(pizzas) {
    return new Promise((resolve, reject) => {
        fetch(baseURL + "/order", {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(pizzas),
        }).then( (response) => {
            if(response.ok) {
                response.json().then((msg) => {      
                    resolve(msg);
                }).catch((err)=>resolve(response));
            } else {
                // analyze the cause of error
                response.json()
                .then( (obj) => {reject(obj);} ) // error msg in the response body
                .catch( (err) => {reject(err);}); //{ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else*/
            }
        }).catch( (err) => {reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}


async function getHistory() {
    return new Promise((resolve, reject) => {
        fetch(baseURL + "/history", {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        }).then( (response) => {
            if(response.ok) {
                response.json().then((orders) => {
                    resolve(orders);
                });
            } else {
                // analyze the cause of error
                response.json()
                .then( (obj) => {reject(obj.error.errors[0].msg);} ) // error msg in the response body
                .catch( (err) => {reject(response);}); //{reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else*/
            }
        }).catch( (err) => {reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}

async function getHistoryId(id) {
    return new Promise((resolve, reject) => {
        fetch(baseURL + "/history/" + id, {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        }).then( (response) => {
            if(response.ok) {
                response.json().then((orders) => {
                    resolve(orders);
                });
            } else {
                // analyze the cause of error
                response.json()
                .then( (obj) => {reject(obj.error.errors[0].msg);} ) // error msg in the response body
                .catch( (err) => {reject(response);}); //{reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else*/
            }
        }).catch( (err) => {reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) }); // connection errors
    });
}

const API = { isAuthenticated, getPublicPizzas, executeOrder, getHistory, getHistoryId, userLogin, userLogout, userSignup} ;
export default API;
