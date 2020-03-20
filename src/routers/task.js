                           //HOW SET ROUTES USING APP
/*Note:-By using router we set up a mini app and make our code more orgnise by setting up routes in another file
with the help of router while routes set up with the help of app must be in main app*/
const express=require('express')
const Task=require('../models/task')
const User=require('../models/user')
const auth=require('../middleware/auth')
const router=new express.Router()
router.post('/tasks',auth,async(req,res)=>{
    //const task=new Task(req.body)
    const task=new Task({
        ...req.body,    //it will save the content of req.body with owner "..." is a ES6 method
        owner:req.user._id
    })
    try{
        await task.save()
        res.send(task)
    }
    catch(e){
        res.status(400).send(e)
    }
})
//GET /tasks?completed=true/false
//GET /tasks?limit=10&skip=20(here skip, skips the no. of tasks and it is used to open other pages)
//GEt ?tasks?sortBy=creadtedAT:desc/ascORcompleted:desc/ascORalpha:desc/asc
router.get('/tasks',auth,async(req,res)=>{
    try{
        const match={}  //we created a empty object match
        if(req.query.completed){    /*if there is any query then put it in object if not then it remain empty
                                    as we want all task without filter if no query string is given*/
            match.completed=(req.query.completed==='true') //as query is a string and we want boolen
        }
        //Now, we can search by any field of task
        const sort={}
        if(req.query.sortBY){
            const parts=req.query.sortBY.split(':')
            sort[parts[0]]=(parts[1]==="desc"?-1:1) //we can not use sort.parts[] as parts is dynamic 
        }
        //const tasks= await Task.find({owner:req.user._id})
        await req.user.populate({
            path:'mytasks',
            // match={
            //     completed:true
            // }
            match:match ,
            options:{
                limit:parseInt(req.query.limit),    /* if a limit is not provided or it is not a no. it
                                                     will be ignored by mongoose that's why here we don't
                                                    need to set conditions for correct working if no query given*/
                skip:parseInt(req.query.skip),
                // sort:{
                //     createdAt:1
                // }
                sort:sort
            }
        }).execPopulate()   /*using task-user relation.HEre we have read all the 
                                                            tasks which are created by authenticated user and it
                                                            makes ore sense otherwise method written above will
                                                            also work the same. Note:- for its working refer to
                                                            notes: user-task-relation*/
                                                        
        res.send(req.user.mytasks)
    }
    catch(e){
        res.status(500).send(e)
    }
})
router.get('/tasks/:id',auth,async(req,res)=>{
    const _id=req.params.id
    try{
        const task=await Task.findOne({_id,owner:req.user._id}) 
        
        if(!task){
            res.status(404).send()
        }
        else{
            res.send(task)
        }
        
    }
    catch(e){
        res.status(500).send(e)
    }
})
router.patch('/tasks/:id',auth,async(req,res)=>{
    const _id=req.params.id
    const updates=Object.keys(req.body)
    const allowedUpdates=["description","completed"]
    const isValidOperation=updates.every((update)=>{
        return allowedUpdates.includes(update)
    })
    if(!isValidOperation)
    {
        return res.status(400).send({error:'invalid update'})
    }
    try{
       // const updatedTask=await Task.findByIdAndUpdate(_id,req.body,{new:true,runValidators:true})
       const updatedTask=await Task.findOne({_id,owner:req.user._id})
       updates.forEach((update)=>{
           updatedTask[update]=req.body[update]
       })
        await updatedTask.save()

        if(!updatedTask){
            res.status(404).send()
        }
        else{
            res.send(updatedTask)
        }
    }
    catch(e){
        res.status(500).send(e)
    }
    
})
router.delete('/tasks/:id',auth,async(req,res)=>{
    _id=req.params.id
    try{
       //const task= await Task.findByIdAndDelete(_id)
       const task= await Task.findOneAndDelete({_id,owner:req.user._id})
        if(!task)
        {
            res.status(404).send()
        }
        else{
            res.send(task)
        }
    }
    catch(e){
        res.status(500).send(e)
    }
})
module.exports=router