const {faker} = require("@faker-js/faker");        // & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
const mysql = require("mysql2");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");  //new
const {v4: uuidv4 } = require("uuid");              //new

app.use(methodOverride("_method"));               //new
app.use(express.urlencoded({extended: true}));   //new
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const connection = mysql.createConnection({
    host : 'localhost',
    user: 'root',
    database : 'delta_app',
    password: 'Amitosh18012007'
});

let getRandomUser = () => {
    return [
        faker.string.uuid(),
        faker.internet.displayName(),
        faker.internet.email(),
        faker.internet.password(),
    ];
};
 
//home Route
app.get("/" , (req,res) => {
    let q = `SELECT count(*) FROM USER`;
    try{
    connection.query(q, (err , result) => {
        if(err) throw err;
       let count = result[0]["count(*)"];
        res.render("home.ejs", {count});
    });
    }catch(err){
    console.log(err);
    res.send("some error in database");
};
});


//Show Route
app.get("/user", (req,res) => {
    let q = `SELECT * FROM user`;
     
    try{
    connection.query(q, (err , users) => {
       if(err) throw err;
    res.render("showusers.ejs" ,{ users });
    });
    }catch(err){
    console.log(err);
    res.send("some error in database");
    };
});

//EDIT Route
app.get("/user/:id/edit" , (req,res) => {                    //new
    let {id}= req.params;
    let q = `SELECT * FROM user WHERE id ='${id}'`;
    
    try{
    connection.query(q, (err , result) => {
       if(err) throw err;
       let user = result[0];
       res.render("edit.ejs" , {user});
    });
    }catch(err){
    console.log(err);
    res.send("some error in database");
    };
});

//UPDATE (DB) route
app.patch("/user/:id" , (req,res) => {  
     let {id}= req.params;
     let {password: formPass, username: newUsername} = req.body;
    let q = `SELECT * FROM user WHERE id ='${id}'`;                  //new
                             
        try{
    connection.query(q, (err , result) => {
       if(err) throw err;
       let user = result[0];
       if(formPass != user.password){
        res.send("WRONG PASSWORD");      
       }else{
        let q2 = `UPDATE user SET username='${newUsername}' WHERE id='${id}'`;
        connection.query(q2, (err,result) => {
            if(err) throw err;
            res.redirect("/user");
        });
       };
    });
    }catch(err){
    console.log(err);
    res.send("some error in database");
    };
});

//new user                                      //new
app.get("/user/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/user/new", (req, res) => {
  let { username, email, password } = req.body;
  let id = uuidv4();
  //Query to Insert New User
  let q = `INSERT INTO user (id, username, email, password) VALUES ('${id}','${username}','${email}','${password}') `;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log("added new user");
      res.redirect("/user");
    });
  } catch (err) {
    res.send("some error occurred");
  }
});

//delete user                                         //new
app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.delete("/user/:id/", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) {
        res.send("WRONG Password entered!");
      } else {
        let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            console.log(result);
            console.log("deleted!");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.listen("8080", ()=>{
    console.log("server is listening to port 8080");
});