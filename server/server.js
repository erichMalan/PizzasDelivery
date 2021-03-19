'use strict';

const express = require('express');
const pizzeria = require('./pizzeria');
const userHandler = require('./user_functions');
const morgan = require('morgan'); // logging middleware
const jwt = require('express-jwt');
const jsonwebtoken = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const { body, validationResult } = require('express-validator');


const expireTime = 1800; //seconds => 30 min
// Authorization error
const authErrorObj = { errors: [{  'param': 'Server', 'msg': 'Authorization error' }] };

const PORT = 3001;

const app = new express();

//TODO:
const jwtSecret = '6xvL4xkAAbG49hcXf5GIYSvkDICiUAR6EdR5dLdwW7hMzUjjMUe9t6M5kSAYxsvX';

// Logs for debugging
app.use(morgan('tiny'));

// Process body content
app.use(express.json());


//Create new createAccount
app.post('/api/signup', body('username').isEmail(),
  body('password').isLength({ min: 5 }), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try{
      // Finds the validation errors in this request and wraps them in an object with handy functions
      const email = req.body.username;
      const password = req.body.password;
      const repwd = req.body.re;
      if(password != repwd)
        throw "passwords don't match";
      const signed_email = await userHandler.newUser(email,password);
      const user = await userHandler.getUser(signed_email);
      const token = jsonwebtoken.sign({ user: user.id}, jwtSecret, {expiresIn: 1000*expireTime});
      res.cookie('token', token, { httpOnly: true, sameSite: true, maxAge: 1000*expireTime });
      res.json({id: user.id, email: user.email});
    } catch(err){
    res.status(401).json({ errors: [{'msg': err}], });};
});

// Authentication
app.post('/api/login', body('username').isEmail(),
body('password').isLength({ min: 5 }), (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const username = req.body.username;
    const password = req.body.password;
    userHandler.getUser(username)
      .then((user) => {
        if(user === undefined) {
            res.status(404).json({
                errors: [{ 'param': 'Server', 'msg': 'Invalid e-mail' }]
              });
        } else {
            if(!userHandler.checkPassword(user, password)){
                res.status(403).json({
                    errors: [{ 'param': 'Server', 'msg': 'Wrong password' }]
                  });
            } else {
                //AUTHENTICATION SUCCESS
                const token = jsonwebtoken.sign({ user: user.id}, jwtSecret, {expiresIn: expireTime});
                res.cookie('token', token, { httpOnly: true, sameSite: true, maxAge: 1000*expireTime });
                //res.render('/api/login', { csrfToken: req.csrfToken() });
                res.json({id: user.id, email: user.email});
            }
        }
      }).catch(

        // Delay response when wrong user/pass is sent to avoid fast guessing attempts
        (err) => {
            return new Promise((resolve) => {setTimeout(resolve, 3000)}).then(() => res.status(401).json(authErrorObj))
        }
      );
  });

app.use(cookieParser());
//log out
app.post('/api/logout', (req, res) => {
    res.clearCookie('token').end();
});


//GET /pizzas/public
app.get('/api/pizzas/public', (req, res) => {
    pizzeria.getAvailability()
        .then((pizzas) => {
            res.json(pizzas);
        })
        .catch((err) => {
            res.status(500).json({
                errors: [{'msg': err}],
             });
       });
});

// For the rest of the code, all APIs require authentication
app.use(
    jwt({
      secret: jwtSecret,
      algorithms: ['HS256'],
      getToken: req => req.cookies.token
    })
  );

// To return a better object in case of errors
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
      res.status(401).json(authErrorObj);
    }
  });

/*
*   GET
*/
//GET /user

app.get('/api/user', (req,res) => {
    const user = req.user && req.user.user;
    userHandler.getUserById(user)
        .then((user) => {
            res.json({id: user.id, email: user.email});
        }).catch(
        (err) => {
         res.status(401).json(authErrorObj);
        }
      );
});

/*
*   POST
*/
// AUTHENTICATED REST API endpoints
app.get('/api/history', (req,res) => {
  const user = req.user && req.user.user;
  pizzeria.getHistory(user)
          .then((orders) => {
            res.json(orders);
          })
          .catch((err) => {
            res.status(500).json({
                errors: [{'msg': err}],
             });
       });
});


app.get('/api/history/:historyId', (req, res) => {
  const user = req.user && req.user.user;
  pizzeria.getHistoryId(user,req.params.historyId)
      .then((course) => {
          if(!course){
              res.status(404);
          } else {
              res.json(course);
          }
      })
      .catch((err) => {
          res.status(500).json({
              errors: [{'param': 'Server', 'msg': err}],
          });
      });
});



app.post('/api/order', async (req, res) => {
  try{
    const user = req.user && req.user.user;
    const orders = req.body;
    const email = await userHandler.getUserById(user).catch(
      (err) => {res.status(401).json(authErrorObj)}
    );
    if(email === 'undefined' || email.email === undefined) {
      res.status(400).json({
          errors: [{'msg': 'Impossible to find the email related'}]
        });
    }


    const statements = await pizzeria.fulfillOrder(user,orders)
    .catch((err)=>{res.status(400).json({
      errors: [{'msg': err.msg}],
    });})

    if(statements === 'undefined') {
      res.status(400).json({
          errors: [{'msg': 'Statements undefined, error with the order'}]
        });
    }

    const noone = await pizzeria.parallelRun(statements,pizzeria.myRun)
    .then(()=>{
      res.status(201).json({msg:"order successfull", order:Object.keys(orders)[0], user:email.email});
    })
    .catch((e)=>{
      if((e.errno)===19){
        res.status(400).json({
          errors: [{'msg': e.code, 'errno':19}],
        });
      }
      else{
        res.status(500).json({
          errors: [{'msg': e}],
        });
        }
    })
  }catch(e){
    console.log();
  }

});

app.listen(PORT, ()=>console.log(`Server running on http://localhost:${PORT}/`));
