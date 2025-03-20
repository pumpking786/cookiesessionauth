const express=require("express")
const {query,body,validationResult, param}=require("express-validator")
const cookieParser=require("cookie-parser")
const session=require('express-session')
const app=express();

app.use(cookieParser())

app.use(session({
    secret:"pramitamatya",
    saveUninitialized:false,
    resave:false,
    cookie:{
        maxAge:60000
    }

}))

app.use(express.json())

// const validationget=query('email').isEmail()
// const validationpost=body('email').isEmail()

// app.get("/signup",validationget,(req,res)=>{
//     const result=validationResult(req);
//     if (result.isEmpty()) {
//         // If email is valid, send a success message
//         res.send(`My email is ${req.query.email}`);
//     }
//     // Send 400 status with the error message if validation fails
//     return res.status(400).send({ error: result.array() });

// })

// app.post("/signup",validationpost,(req,res)=>{
//     const result=validationResult(req);
//     const {email}=req.body
//     const added={
//         email
//     }
//     if(result.isEmpty()){
//         res.send(added)
//     }
//     return  res.status(400).send({ error: result.array() });
// })

const validateemail=body('email').isEmail()
const validatename=body('name').notEmpty()
const validateage=body('age').isNumeric()

const users=[
    {username:"pramit123",password:"12345"},
    {username:"aakash456",password:"678910"}
]

const userDetails=[{
    email:"pramit@gmail.com",
    name:"Pramit",
    age:15
},{
    email:"Sagar@gmail.com",
    name:"Sagar",
    age:19
}]

app.post("/login", (req, res) => {
    try {
        const { username, password } = req.body;
        const user = users.find((i) => i.username === username && i.password === password);

        if (user) {
            req.session.visited = true;
            res.cookie("cookie", "saved", { maxAge: 60000 }); // Cookie expires in 1 minute
            return res.status(200).send("You are now authenticated");
        }

        res.status(401).send("Username or password incorrect");
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

app.get("/getusers", (req, res) => {
    if (req.session.visited) {
        res.json(userDetails);
    } else {
        res.status(401).send("Please log in first");
    }
});
// app.get("/getusers", (req, res) => {
//         try{res.json(userDetails);}
//         catch(error){
//             res.status(404).send(error)
//         }
// });
app.post("/adduser",validateemail,validatename,validateage,(req,res)=>{
    try{
        
        const result=validationResult(req)
        const {email,name,age}=req.body;
    
        if(!result.isEmpty()){
            return res.send({
                success:false,
                message:"Failed to add user"
            })
        }
        const addeditem={
            email,
            name,
            age
        }
        userDetails.push(addeditem)
        res.json({
            message:"User added",
            addeditem
        })
    }catch(error){
        res.status(404).send(error.message)
    }
})

app.put("/edit/:name",validateemail,validatename,validateage,(req,res)=>{
    const result=validationResult(req);
    if(!result.isEmpty()){
       return res.send("Error")
    }
    const naam=req.params.name.toLowerCase();
    const {email,name,age}=req.body;
    const userid=userDetails.find((i)=>i.name.toLowerCase()===naam)
    if(!userid){
        res.send("Not found") 
    }
    userid.email=email||userid.email
    userid.name=name||userid.name
    userid.age=age||userid.age
    return res.json({
        message: `${naam} updated`,
        userid
    })

})

app.delete("/deleteuser/:name",(req,res)=>{
    const name=req.params.name.toLowerCase()
    const userid=userDetails.find((i)=>i.name.toLowerCase()===name)
    if(!userid){
        res.send("Name not found")
    }
    const index=userDetails.indexOf(userid)
    userDetails.splice(index,1)
    res.send(`${name} deleted`)
})

const port=process.env.port||8000

app.listen(port,()=>console.log("Server Started"))