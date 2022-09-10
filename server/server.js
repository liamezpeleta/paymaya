var cookieParser = require('cookie-parser')
var csrf = require('csurf')
var bodyParser = require('body-parser')
var express = require('express')
var cors = require("cors");
var mysql = require('mysql');
const app = express()
require('dotenv/config');
var csrfProtection = csrf({ cookie: true })

const db = require('./queries')
const errorHandler = require('./error_handler');







app.use(cookieParser())
app.use(cors());
app.use(bodyParser.json({limit: '25mb'}));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '25mb'
}));
app.use(errorHandler);





//VALIDATE RESQUEST FROM BILLER'S API
app.post('/v1/validate', db.header_validation,db.validatebeneficiriary)
app.post('/v1/post', db.posting)



// //ACCEPT  ENTRY
// app.get('/acceptpayment/:TRX_UUID', function (req, res) {
//   let TRX_UUID = req.params.TRX_UUID;
//   dbConn.query('UPDATE tbx_payments SET pyt_status = "Accept" WHERE pyt_trxid =?',[TRX_UUID], function (error, results, fields) {
//       if (error) throw error;
//       res.json({list: results})
//       console.log(results)
//   });
// });



// //FETCH ALL ENTRIES
// app.get('/postinglist', function (req, res) {
//   dbConn.query('SELECT *  FROM tbx_payments WHERE pyt_status = "Pending"', function (error, results, fields) {
//       if (error) throw error;
//       res.json({list: results})
//       console.log(results)
//   });
// });


// //ACCEPT  ENTRY
// app.get('/acceptpayment/:TRX_UUID', function (req, res) {
//   let TRX_UUID = req.params.TRX_UUID;
//   dbConn.query('UPDATE tbx_payments SET pyt_status = "Accept" WHERE pyt_trxid =?',[TRX_UUID], function (error, results, fields) {
//       if (error) throw error;
//       res.json({list: results})
//       console.log(results)
//   });
// });


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





  app.listen(5000, () => {console.log("Server started at port 5000")})