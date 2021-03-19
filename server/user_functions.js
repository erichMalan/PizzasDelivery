'use strict';

const User = require('./user');
const db = require('./db');
const bcrypt = require('bcrypt');


const createUser = function (row) {
    const id = row.id;
    const email = row.email;
    const hash = row.pwd;
    console.log(id,email,hash);
    return new User(id, email, hash);
}

//TODO
//password validation
//email validation

exports.getUser = function (email) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM USERS WHERE email = ?"
        db.all(sql, [email], (err, rows) => {
            if (err)
                reject(err);
            else if (rows.length === 0)
                resolve(undefined);
            else{
                const user = createUser(rows[0]);
                console.log("user exists")
                resolve(user);
            }
        });
    });
  };

exports.getUserById = function (id) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM USERS WHERE id = ?"
        db.all(sql, [id], (err, rows) => {
            if (err)
                reject(err);
            else if (rows.length === 0)
                resolve(undefined);
            else{
                const user = createUser(rows[0]);
                resolve(user);
            }
        });
    });
  };


exports.checkPassword = function(user, password){
    //console.log("hash of: " + password);
    let hash = bcrypt.hashSync(password, 10);
    console.log(hash);
    console.log("DONE");

    return bcrypt.compareSync(password, user.hash);
}


exports.newUser = (email,password) => {
  return new Promise((resolve, reject) => {
      let hash = bcrypt.hashSync(password, 10);
      const sql = "INSERT INTO USERS(email,pwd) VALUES (?,?)";
      db.all(sql, [email,hash], (err, rows) => {
          if (err){
              console.log(err);
              reject(err);
          }
          else{
              resolve(email);
          }
      });
  });
}
