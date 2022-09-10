var cookieParser = require('cookie-parser')
var csrf = require('csurf')
var bodyParser = require('body-parser')
var express = require('express')
var cors = require("cors");
var mysql = require('mysql');
const app = express()
require('dotenv/config');
var csrfProtection = csrf({ cookie: true })
const userService = require('./service');

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'odk',
  password: 'Salvis@10',
  port: 5432,
})


const pool2 = new Pool({
  user: 'cosdd_olan',
  host: '172.16.10.51',
  database: 'postgres',
  password: 'cosddolan',
  port: 5432,
})


app.use(cookieParser())
app.use(cors());
app.use(bodyParser.json({limit: '25mb'}));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '25mb'
}));




var dbConn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

var dbConn2 = mysql.createConnection({
  host: process.env.DB_HOST2,
  user: process.env.DB_USER2,
  password: process.env.DB_PASSWORD2,
  database: process.env.DB_DATABASE2,
});


  dbConn.connect(function(err) {
    if (err) throw err;
    console.log('Database is connected successfully !');
  });

  dbConn2.connect(function(err) {
    if (err) throw err;
    console.log('Database is connected successfully! Local DB');
  });


  pool.connect(function(err) {
    if (err) throw err;
    console.log('Database is connected successfully!Postgre');
  });

  pool2.connect(function(err) {
    if (err) throw err;
    console.log('Database is connected successfully!Postgres Remote');
  });





//VALIDATE HEADER FUNCTION
const header_validation = (req, res) => {
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.status(401).json({ message: 'Missing Authorization Header' });
    }
    const base64Credentials =  req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    
    const user = userService.authenticate({ username, password });
    if (!user) {
        return res.status(401).json({ message: 'Invalid Authentication Credentials' });
    }
    validatebeneficiriary(req, res)
  }


//VALIDATE RESQUEST FROM BILLER'S API
  const validatebeneficiriary = (req, res) => {
    let bene_bin = req.body.biller.accountNumber;
    let req_body = req.body;
  
    console.log(req.headers['request-reference-no']);

    dbConn2.query('SELECT * FROM BCS0020_BCS  WHERE bin = ?',[bene_bin], function (error, results) {
     if (error) throw error;

     if (results.length == '1'){
         req_body.result = {
          "code": "0000",
          "message": "Successfully Validated."
        }
        res.header("Content-Type', 'application/json");
        res.header("Request-Reference-No', '1e9ac446-8a62-4ae3-852d-c352ceda99b");
        res.status(200).json(req_body)
        console.log(req_body)
     }
     else if(results.length == '0'){
      req_body = {
        "id": "76bd34ae-7d5d-47e8-a3d5-909410000168",
        "date": "2019-07-22T08:04:15.055Z",
        "result": {
          "code": "2559",
          "message": "Account Number is invalid"
        }
      }
      res.status(400).json(req_body)
      console.log(req_body)
     } 
  });
  }





  //VALIDATE RESQUEST FROM BILLER'S API
  const posting = (req, res) => {
    
  let trx_id = req.body.id;
  let bene_bin =req.body.biller.accountNumber;
  let trx_slug = req.body.biller.slug;
  let bene_fname = req.body.biller.fields.firstName;
  let bene_lname = req.body.biller.fields.lastName;
  let bene_cntno = req.body.biller.fields.contactNumber;
  let trx_total_amnt = req.body.transaction.amount.total.value;
  let trx_base_amnt = req.body.transaction.amount.base.value;
  let trx_fee_amnt = req.body.transaction.amount.fee.value;
  let trx_callback_url = req.body.callback.url;
  let trx_callback_method = req.body.callback.method;
  let trx_receiptno = "Ym20190207015139123456789012"
  
  dbConn.query('INSERT INTO  tbx_payments (pyt_trxid, pyt_benebin, pyt_fname, pyt_lname, pyt_ctno, pyt_totalamt, pyt_baseamt, pyt_feeamt, pyt_receiptnumber, pyt_callbkurl) VALUES (?,?,?,?,?,?,?,?,?,?)', 
  [trx_id, bene_bin, bene_fname, bene_lname, bene_cntno, trx_total_amnt, trx_base_amnt,trx_fee_amnt,trx_receiptno,trx_callback_url], 
  function (error, results, fields)  {
    if(error){
      return res.status(400).send({error: error});
    } else {
      return res.status(200).send({
        "id": "5e67d842-9638-4697-a61c-cbdeb7d14069",
        "result": {
          "code": "0000",
          "message": "Successfully Posted."
        },
        "biller": {
          "accountNumber": "30655639",
          "details": {
            "firstName": "John",
            "lastName": "Smith",
            "contactNumber": "+639384618830"
          }
        },
        "transaction": {
          "receiptNumber": "Ym20190207015139123456789012",
          "amount": {
            "total": {
              "currency": "PHP",
              "value": 110
            },
            "base": {
              "currency": "PHP",
              "value": 100
            },
            "fee": {
              "currency": "PHP",
              "value": 10
            }
          },
          "date": "2019-07-22T08:04:15.055Z"
        }
        
      });
    }

  });

  }




//ACCEPT  ENTRY
app.get('/acceptpayment/:TRX_UUID', function (req, res) {
  let TRX_UUID = req.params.TRX_UUID;
  dbConn.query('UPDATE tbx_payments SET pyt_status = "Accept" WHERE pyt_trxid =?',[TRX_UUID], function (error, results, fields) {
      if (error) throw error;
      res.json({list: results})
      console.log(results)
  });
});



//FETCH ALL ENTRIES
app.get('/postinglist', function (req, res) {
  dbConn.query('SELECT *  FROM tbx_payments WHERE pyt_status = "Pending"', function (error, results, fields) {
      if (error) throw error;
      res.json({list: results})
      console.log(results)
  });
});

















//   app.get('/createcsrf', csrfProtection, function (req, res, error) {
//     let csrtoken = req.csrfToken()
//       res.json({csr: csrtoken})
//       // res.render('send', { csrfToken: csrtoken })
//       console.log(csrtoken)

//   })


// //Ok CSRF
//   app.get('/csrf',csrfProtection, function(req, res, error){
//     res.send(`
//     <h1>Hello World</h1>
//     <form action="/entry" method="POST">
//       <div>
//         <label for="message">Enter a message</label>
//         <input id="message" name="message" type="text" />
//       </div>
//       <input type="submit" value="Submit" />
//       <input type="hidden" name="_csrf" value="${req.csrfToken()}" />
//     </form>
//   `);
//   })


//   app.post('/entry',csrfProtection, function (req, res){
//     console.log(`Message received: ${req.body.message}`);
//     res.send(`CSRF token used: ${req.body._csrf}, Message received: ${req.body.message}`);
//   });
// //



//   app.post('/login', function (req, res, error) {

//     let csrf =  req.body.csrf;
//     let uname =  req.body.uname;
//     let upassword =  req.body.upassword;
//     csrfProtection(csrf)
//     console.log('data is being processed')


//   })

// app.get('/sample', csrfProtection, function(req, res, error){
//   let csrtoken = req.csrfToken()
//   res.send(`
//   <html>
//   <form id="myForm" action="/transfer" method="POST" target="_blank">
//   Account:<input type="text" name="account" value="your friend"/><br/>
//   Amount:<input type="text" name="amount" value="$5000"/>
//   <input type="text" name="_csrf" value="${csrtoken}"/>
//     <button type="submit">Transfer Money</button>
//   </form>
//   </html>
//   `)
// })





module.exports = {
    validatebeneficiriary,
    posting,
    header_validation
    // updateUser,
    // deleteUser,
  }