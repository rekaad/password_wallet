const express = require('express');
const app = express();
const cors = require("cors");
const pool = require("./db");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
var CryptoJS = require ("crypto-js");
var request = require("request");
var url = "https://geolocation-db.com/json";
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST","DELETE","UPDATE","PUT"],
    credentials: true,
    }));
    
app.use(express.json());

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
    session({
      key: "id",
      secret: "subscribe",
      resave: false,
      saveUninitialized: false,
      cookie: {
        expires: 60 * 60 * 24 * 1000,
      },
    })
  );


  
const bcrypt = require('bcrypt');
const saltRounds = 10;


function encrypt(haslo,login){

  var encrypted = CryptoJS.AES.encrypt(haslo, login).toString();
  console.log(encrypted);
  return encrypted;
}

function decrypt(haslohash, login){

var bytes  = CryptoJS.AES.decrypt(haslohash, login);
var originalText = bytes.toString(CryptoJS.enc.Utf8);
return originalText;

}

async function getUserIp(){

  const customPromise = new Promise((resolve,reject) =>{
    request({
      url: url,
      json: true
    }, function (error, response, body) {
    
      if (!error && response.statusCode === 200) {
          //console.log(body.IPv4);
          resolve(body.IPv4);
      }
    });
  })
  return customPromise;

}

function getCurrentDate(addedTime){

  let time = Date.now();
  let date_ob = new Date(time + (1000*addedTime));

// current date
// adjust 0 before single digit date
let date = ("0" + date_ob.getDate()).slice(-2);

// current month
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

// current year
let year = date_ob.getFullYear();

// current hours
let hours = date_ob.getHours();

// current minutes
let minutes = date_ob.getMinutes();

// current seconds
let seconds = date_ob.getSeconds();

if(hours < 10){
  hours = "0" + hours;
}
if(minutes < 10){
  minutes = "0" + minutes;
}
if(seconds < 10){
  seconds = "0" + seconds;
}
// prints date in YYYY-MM-DD format
//console.log(year + "-" + month + "-" + date);

// prints date & time in YYYY-MM-DD HH:MM:SS format
let aktualnaData =  year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

// prints time in HH:MM format
//console.log(hours + ":" + minutes);
return aktualnaData;
}


function loginResult(loginTime, loginRes, userIp,userId){
  
 
   // console.log(loginTime,loginRes,userIp);
    const time = loginTime;
    const result = loginRes;
    const ip = userIp;
    const id = userId;
    
    pool.query(
      "INSERT INTO login_results (login_date,login_result,user_ip,id_user) VALUES ($1,$2,$3,$4)",
      [time,result,ip,id],
      (err,result)=>{
      //console.log(err);
      //console.log(result);
         if(err)
         {
             //res.send({ message: "rezultat logowania error" });
         }else{
           // res.send(result);
         }
  }
  );

}

function addLoginFail(userId,status){


  if(status){
    console.log("Sukces");
    pool.query(
      "UPDATE user_table SET fail_count = 0 WHERE id=$1",
      [userId],
      (err,result)=>{
      //console.log(err);
      //console.log(result);
         if(err)
         {
             //res.send({ message: "rezultat logowania error" });
         }else{
           // res.send(result);
         }
  }
  );
  }else{
    console.log("Porazka");
    pool.query(
      "UPDATE user_table SET fail_count = fail_count+1 WHERE id=$1",
      [userId],
      (err,result)=>{
      //console.log(err);
      //console.log(result);
         if(err)
         {
             //res.send({ message: "rezultat logowania error" });
         }else{
           // res.send(result);
         }
  }
  );
  }
  
}

function banUser(userLogin,addedTime){

  const login = userLogin;
  const banTime = getCurrentDate(addedTime);
  pool.query(
    "UPDATE user_table SET ban_date = $1 WHERE user_login=$2",
    [banTime,login],
    (err,result)=>{
    //console.log(err);
    //console.log(result);
       if(err)
       {
           //res.send({ message: "rezultat logowania error" });
       }else{
         // res.send(result);
       }
}
);

}

function saveIPforUser(userIp,userId){

    const ip = userIp;
    const id = userId;

  pool.query(
    "insert into ip_table(ip_address, id_user) values ($1, $2) on conflict (ip_address, id_user) do nothing",
    [ip,id],
    (err,result)=>{
    //console.log(err);
    //console.log(result);
       if(err)
       {
           //res.send({ message: "rezultat logowania error" });
       }else{
         // res.send(result);
       }
}
);


}

function addIPFail(ip,status){


  if(status){
   // console.log("Sukces");
    pool.query(
      "UPDATE ip_table SET fail_count = 0 WHERE ip_address=$1",
      [ip],
      (err,result)=>{
      //console.log(err);
      //console.log(result);
         if(err)
         {
             //res.send({ message: "rezultat logowania error" });
         }else{
           // res.send(result);
         }
  }
  );
  }else{
    //console.log("Porazka");
    pool.query(
      "UPDATE ip_table SET fail_count = fail_count+1 WHERE ip_address=$1",
      [ip],
      (err,result)=>{
      //console.log(err);
      //console.log(result);
         if(err)
         {
             //res.send({ message: "rezultat logowania error" });
         }else{
           // res.send(result);
         }
  }
  );
  }
  
}

function getIpFails(ip){
  let wynik = "Test";
  let wynik2 = "Testowy"
  pool.query(
    "SELECT ip_address, fail_count from ip_table where ip_address=$1 group by ip_address,fail_count",
    [ip],
    (err,result)=>{
    //console.log(err);
    console.log(result.rows[0].fail_count);
    if(result.rows[0].fail_count+1 < 2){
//tutaj info o banie 
    }else{
      // tutaj logowanie 
    }
       if(err)
       {
           //res.send({ message: "rezultat logowania error" });
       }else{
         // res.send(result);
       }
}
);

}



function banIP(ip,addedTime){

  const banTime = getCurrentDate(addedTime);
  pool.query(
    "UPDATE ip_table SET ban_date = $1 WHERE ip_address=$2",
    [banTime,ip],
    (err,result)=>{
    //console.log(err);
    //console.log(result);
       if(err)
       {
           //res.send({ message: "rezultat logowania error" });
       }else{
         // res.send(result);
       }
}
);

}

//decrypt();
//Rejestracja - cryptojs


app.post('/register', (req,res)=>{
   
  const login =req.body.user_login;
  const password = req.body.password_hash;

  const passhash = encrypt(password,login) ;


   pool.query(
       "INSERT INTO user_table (user_login,password_hash) VALUES ($1,$2)",
       [login,passhash],
       (err,result)=>{
       //console.log(err);
       //console.log(result);
          if(err)
          {
              res.send({ message: "Użytkownik już istnieje" });
          }else{
              res.send(result);
          }
   }
   );
 // });
});


// REJESTRACJA -- crypto dziala

//  app.post('/register', (req,res)=>{
   
//     const login =req.body.user_login;
//     const password = req.body.password_hash;
 
//     const hmac = crypto.createHmac("sha512",login).update(password).digest('hex');


//      pool.query(
//          "INSERT INTO user_table (user_login,password_hash) VALUES ($1,$2)",
//          [login,hmac],
//          (err,result)=>{
//          //console.log(err);
//          //console.log(result);
//             if(err)
//             {
//                 res.send({ message: "Użytkownik już istnieje" });
//             }else{
//                 res.send(result);
//             }
//      }
//      );
//    // });
//  });

// REJESTRACJA - bcrypt

// app.post('/register', (req,res)=>{
   
//   const login =req.body.user_login;
//   const password = req.body.password_hash;

//   bcrypt.hash(password, saltRounds, (err, hash) => {
//     console.log(hash);
//    if (err) {
//      console.log(err);
//    }


//    pool.query(
//        "INSERT INTO user_table (user_login,password_hash) VALUES ($1,$2)",
//        [login,hash],
//        (err,result)=>{
//        //console.log(err);
//        //console.log(result);
//           if(err)
//           {
//               res.send({ message: "Użytkownik już istnieje" });
//           }else{
//               res.send(result);
//           }
//    }
//    );
//  // });
// });


//logowanie - dziala

// app.post('/login', (req,res)=>{
   
//     const login =req.body.user_login;
//     const password =req.body.password;
//      pool.query(
//          "SELECT * FROM user_table WHERE user_login =$1",
//          [login],
//          (err,result)=> {
//              if(err)
//             {
//                res.send({ err: err});
//              } 
             
//              if(result.rows.length >0){
//                 bcrypt.compare(password, result.rows[0].password_hash, (error, response) => {
//                 if (response) {
//                   //console.log(result.rows[0].user_login)
//                     req.session.login = result;
//                     //console.log(req.session);
//                     res.send(result);
//                   } else {
//                     res.send({ message: "Zły login lub hasło" });
//                   }
//                 });
//               } else {
                
//                 res.send({ message: "Użytkownik nie istnieje" });
//               }
//             }
//           );
//         });


// logowanie hmac test -- dziala 


app.post('/login', async (req,res)=>{
   
  const login =req.body.user_login;
  const password =req.body.password;
  const date = getCurrentDate(0);
  const ip = await getUserIp();
  //const ip_fails = getIpFails(ip);
  //console.log(ip);

  pool.query(
    "SELECT ip_address,fail_count,ban_date from ip_table where ip_address=$1 group by ip_address,fail_count,ban_date",
    [ip],
    (err,result)=>{
    //console.log(err);
    console.log(result.rows[0].fail_count);
    if(result.rows[0].ban_date > new Date()){
//tutaj info o banie 
console.log("Pozostało " + (result.rows[0].ban_date - new Date())/1000 + " sekund blokady adresu IP");
    }else{
      // tutaj logowanie 
      pool.query(
        "SELECT * FROM user_table WHERE user_login =$1",
        [login],
        async (err,result)=> {
            if(err)
           {
              res.send({ err: err});
            } 
            
            if(result.rows.length >0){
               
               //console.log(result);
               if(result.rows[0].ban_date > new Date()){
                 console.log("Pozostało " + (result.rows[0].ban_date - new Date())/1000 + " sekund blokady użytkownika");
               }else {
                 console.log(result.rows[0]);
               if (decrypt(result.rows[0].password_hash,login) === password) {
                 let loginres = true;
                 //console.log(date,ip,loginres);
                 saveIPforUser(ip,result.rows[0].id);
                 addIPFail(ip,loginres);
                 addLoginFail(result.rows[0].id,loginres);
                 loginResult(date,loginres,ip,result.rows[0].id);
                 
                // console.log(result.rows[0].user_login)
                //console.log(req.body)
                   req.session.login = result;
                   //console.log(req.session);
                   res.send(result);
                  
                 } else {
                   let loginres = false;
                  // console.log(date,ip,loginres);
                  saveIPforUser(ip,result.rows[0].id);
                  addIPFail(ip,loginres);
                  addLoginFail(result.rows[0].id,loginres);
                  if((result.rows[0].fail_count+1) === 2){
                   banUser(login,5);
                  }
                  if((result.rows[0].fail_count+1) === 3){
                   banUser(login,10);
                  }
                  if((result.rows[0].fail_count+1) > 3){
                   banUser(login,30);
                  }
                   loginResult(date,loginres,ip,result.rows[0].id);
                   res.send({ message: "Zły login lub hasło" });
                 }
               }
               
             } else {
               
               res.send({ message: "Użytkownik nie istnieje" });
             }
           }
         );
    }
    if((result.rows[0].fail_count+1) === 2){
      banIP(ip,5);
     }
     if((result.rows[0].fail_count+1) === 3){
      banIP(ip,10);
     }
     if((result.rows[0].fail_count+1) > 3){
      banIP(ip,30);
     }
       if(err)
       {
           //res.send({ message: "rezultat logowania error" });
       }else{
         // res.send(result);
       }
}
);

   
      });


 //sesja zalogowanego użytkownika
app.get("/zalogowanie",(req,res)=>{
  //console.log(req.session);
    if(req.session.login){
        res.send({loggedIn: true, login:req.session.login})
    }
    else {
        res.send({loggedIn:false})
    }
});

//wylogowanie użytkownika
app.get("/wylogowanie",(req,res)=>{
    res.send({loggedIn: false});
    req.session.destroy();
});

//poprawiona zmiana hasła -- bcrypt
// app.put('/zmianahasla/:id', (req,res)=>{
   
//   const id = req.params.id;
//   const oldpassword = req.body.oldpassword;
//   const newpassword = req.body.newpassword;

//   console.log(req.body)
//    bcrypt.hash(oldpassword, saltRounds, (err, hash) => {
//       console.log(hash);
//     if (err) {
//       console.log(err);
//     }
//    bcrypt.compare(oldpassword, hash, (error, response) => {
//        if(response){
//           bcrypt.hash(newpassword,saltRounds,(err,hash)=>{
//               db.query(
//                   "UPDATE user_table SET password_hash =$1 WHERE id =$2",[hash,id],
//                      (err,result)=> {
//                       if(err)
//                       {res.send(result);
                          
//                       }else{
//                         res.send({ message: "Hasło zostało zapisane!" });
//                         console.log(result);
//                       }
//                }
//                )
//           })
//   }
//       else{
//           res.send({message:"Wprowadzone hasło jest niepoprawne"})
//       }
//  ;}
// );
// })
// });    

//poprawiona zmiana hasła -- hmac
app.put('/zmianahasla/:id', (req,res)=>{
   
  const id = req.params.id;
  const login = req.body.login;
  const oldpassword = req.body.oldpassword;
  const newpassword = req.body.newpassword;
  console.log(req.params);

  console.log(req.body)
  const hmac_old = encrypt(oldpassword,login);
  if(hmac_old === encrypt(oldpassword,login)){
    const hmac_new = encrypt(newpassword,login);


     pool.query(
         "UPDATE user_table SET password_hash =$1 WHERE id =$2",
         [hmac_new,id],
         (err,result)=>{
        // console.log(err);
        // console.log(result);
            if(err)
            {
                res.send({ message: "Użytkownik już istnieje" });
            }else{
                res.send(result);
            }
     }
     );
  }

});   


/// hasła wewnętrzne

app.post('/newpass', (req,res)=>{
  const id = req.body.id;
    const login =req.body.login;
    const password = req.body.password;
    const description = req.body.description;
    const webadd = req.body.webadd;
    //console.log(req.body);
     pool.query(
         "INSERT INTO password_table (password,id_user,web_address,description,login) VALUES ($1,$2,$3,$4,$5)",
         [password,id,webadd,description,login],
         (err,result)=>{
         //console.log(err);
         //console.log(result);
            if(err)
            {
                res.send({ message: "Użytkownik już istnieje" });
            }else{
                res.send(result);
            }
     }
     );
   // });
  });

// wyswietlanie wszystkich haseł usera

app.get("/newpass/:id",(req,res)=>{
  const id = req.params.id;
  pool.query("SELECT * FROM password_table p inner join user_table u on p.id_user=u.id where p.id_user=$1",
  [id], (err,result)=>{
      if(err){
          res.send("Błąd!");
          console.log(err);
      }
      res.send(result);
  })
});

app.get("/lastsuc/:id",(req,res)=>{
  const id = req.params.id;
  pool.query("SELECT * FROM login_results where id_user=$1 and login_result=true order by login_date desc limit 1 ",
  [id], (err,result)=>{
      if(err){
          res.send("Błąd!");
          console.log(err);
      }
      res.send(result);
  })
});

app.get("/lastfail/:id",(req,res)=>{
  const id = req.params.id;
  pool.query("SELECT * FROM login_results where id_user=$1 and login_result=false order by login_date desc limit 1 ",
  [id], (err,result)=>{
      if(err){
          res.send("Błąd!");
          console.log(err);
      }
      res.send(result);
  })
});


app.listen(5000, () =>{
    console.log("server has started on port 5000");
});

