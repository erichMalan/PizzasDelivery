'use strict';

const Pizza = require('./pizza');
const db = require('./db');
const e = require('express');
//const moment = require('moment');

const makePizza = function (order) {
    try{
        return new Pizza(order);
    } catch(e) {
        console.log(e);
        throw e;
    }
};

// Get availability of pizzas
// even if the user is not logged

exports.getAvailability = function() {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM PIZZAS'
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
            } else { //create general pizzas objects of each size
                let pizzas = rows.map((row) => { const el = {};
                                                el.availability = row.Avail;
                                                el.pizza = makePizza({id:0,size:row.Size});
                                                return el;
                                                });
                resolve(pizzas);
            }
        });
    });
}

module.exports.fulfillOrder = async function(userId,orders){
    return new Promise((resolve, reject) => {
        if(!orders){
            reject({msg:"orders undefined"});
        }
        try{
            let pizzas = 0;
            let price = 0.0;
            let pizza_sizes = {'S':0,'M':0,'L':0};;
            let strorders = ""
            console.log(userId,"orders",Object.keys(orders))
            let o = {};
            for (let id of Object.keys(orders)){
                let order = orders[id];
                o[id] = order;
              let p = makePizza(order);
              price += (p.cost*p.quantity);
              pizzas += p.quantity;
              pizza_sizes[p.size] += p.quantity;
            }
            if (pizzas > 3)
                price -= price/10;
            strorders = JSON.stringify(o);

            if(strorders === {} || pizzas <= 0 || price <= 0)
                throw {err:"invalid parameters"};

            let statements = [
                //"UPDATE PIZZAS SET Avail=CASE WHEN Size='S' THEN ? WHEN Size='M' THEN ? WHEN Size='L' THEN ? ELSE Avail END WHERE Size IN ('S', 'M', 'L')",
                ["UPDATE PIZZAS SET Avail=Avail-(?) WHERE Size = (?);",[pizza_sizes['S'],'S']],
                ["UPDATE PIZZAS SET Avail=Avail-(?) WHERE Size = (?);",[pizza_sizes['M'],'M']],
                ["UPDATE PIZZAS SET Avail=Avail-(?) WHERE Size = (?);",[pizza_sizes['L'],'L']],
                ["INSERT INTO ORDERS(userId,pizzas,price,description) VALUES(?,?,?,?)",[userId,pizzas,price,strorders]],
                //["INSERT INTO ORDERS VALUES(?,?,?,?,?)",[orderId,userId,pizzas,price,strorders]],
            ];
            resolve(statements);
        } catch(e){
              reject(e);
              return;
        }

    });
};

exports.parallelRun = function(statements,myRun){
    return new Promise((resolve,reject)=>{
        db.run("BEGIN TRANSACTION;");
        Promise.all([myRun(statements[0][0], statements[0][1],"not enough S pizzas"),
                    myRun(statements[1][0], statements[1][1],"not enough M pizzas"),
                    myRun(statements[2][0], statements[2][1],"not enough L pizzas"),
                    myRun(statements[3][0], statements[3][1])])
        .then(()=>{
            db.run("COMMIT;");
            resolve(null);
        })
        .catch((e) =>{
            db.run("ROLLBACK;");
            reject(e);
        })

    });
}

exports.myRun = function(sql,values,check="CHECK CONTRAINT VIOLATED"){
    return new Promise((res,rej)=>{
        db.run(sql, values,  function (err) {
            if(err){
                if(err.code==="SQLITE_CONSTRAINT")
                    err.code = check;
                rej(err);
            }
            else
                res(err);
        });
    });
}

exports.getHistory = function(user){
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM ORDERS WHERE userId = (?)';
        db.all(sql, [user],(err,rows) => {
            if(err){
                reject(err);
            }
            else{
                let orders = {};
                rows.forEach((r) => orders[r.id]={id:r.id,
                                                    pizzas: r.pizzas,
                                                    price: r.price
                                                    //details: JSON.parse(r.description)
                                                });
                resolve(orders);
            }
        });
    });
}

exports.getHistoryId = function(user,orderId){

    return new Promise((resolve, reject) => {
        const sql = 'SELECT description FROM ORDERS WHERE userId = (?) AND id = (?)';
        db.get(sql, [user,orderId],(err,row) => {
            if(err){
                reject(err);
            }
            else if (row.length === 0)
                resolve(undefined);
            else{
                resolve(JSON.parse(row.description));
            }
        });
    });
}
