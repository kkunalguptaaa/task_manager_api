const express = require('express')
require('./db/mongoose') /* here we don not want grab anyhing , we just want that the mongoose.js should 
                            run to connect our database*/
// const User=require('./models/user')
// const Task=require('./models/task')
const userRouter=require('./routers/user')
const taskRouter=require('./routers/task')

const app=express()
//middleware to run code before running the route handlers
// app.use((req,res,next)=>{    //used to block the routes and run middleware and it sholud be written before 
                                //other app.use
//     res.status(503).send("site under maintainence!")
// })
/*Note:- to set enviroment variable every oss uses different method so we use env-cmd npm pakage do our job
and we change the "dev": "env-cmd -f ./config/dev.env nodemon src/index.js" in package.json and we never
commit cofig folder in repository to make our secret ey and data safe.
Note:- always install env-cmd as devlopment dependency like nodemon as we will not use it in production
Note:- enviroment variables only set up at starting of nodemon after starting nodemon any change in enviroment 
variable will not be reflected in nodemon you have to restart it */


app.use(express.json())
app.use(userRouter)                  /*Note we can not directly use the routes for using the routes we first have                                     to regester it in our app via app.use*/
app.use(taskRouter)
module.exports=app
//------------------------------------------------------------------------------------------------------------------
                            //HOW SET ROUTES USING APP
/*Note:-By using router we set up a mini app and make our code more orgnise by setting up routes in another file
with the help of router while routes set up with the help of app must be in main app*/
// app.post('/users',(req,res)=>{
//     const user=new User(req.body
//         )
//     user.save().then((user)=>{
//         res.send(user)
//     }).catch((error)=>{
//         res.status(400).send(error) //to set status code according to error occur
//                             //we have to set status before sendig the response otherwise default code will be send.
//     })  
// })

// app.post('/tasks',(req,res)=>{
//     const task=new Task(req.body)
//     task.save().then((task)=>{
//         res.send(task)
//     }).catch((error)=>{
//         res.status(400).res.send(error)
//     })
// })

// app.get('/users',(req,res)=>{
//     User.find({}).then((users)=>{   /*find() is used to read multiple users in a list and we have to specify
//                                     in which Model we are going to find out*/ 
//         res.send(users)
//     }).catch((error)=>{
//         res.status(500).send(error) // status code 500 is used for internal error like database not connected properly
        
//     })
// })

// app.get('/users/:id',(req,res)=>{   //':id' is route parameter it captures the dynamic values used in url
//                                     /*as findbyid() needs id to search so we have to capture it from url 
//                                     and url will we dynamic fo that purpose we use route parameter*/
//     const _id=req.params.id  
//             /*req.prams return a object whose key is route parameter name and value is the passed value in 
//              url and it also converts the id from string to binary and do not have to use new objectId("_id")   */

//     User.findById(_id).then((user)=>{
//         if(!user){
//             res.status(404).send()
//         }
//         else{
//             res.send(user)
//         }    
//     }).catch((error)=>{
//         res.status(500).send(error)
//     })
// })

// app.get('/tasks',(req,res)=>{
//     Task.find({}).then((tasks)=>{
//         res.send(tasks)
//     }).catch((error)=>{
//         res.status(500).send(error)
//     })
// })

// app.get('/tasks/:id',(req,res)=>{
//     const _id=req.params.id
//     Task.findById(_id).then((task)=>{
//         if(!task){
//             res.status(404).send()
//         }
//         else{
//             res.send(task)
//         }    
//     }).catch((error)=>{
//         res.status(500).send(error)
//     })
// })
//----------------------------------------------------------------------------------------------------------------
