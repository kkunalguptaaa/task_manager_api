                           //HOW SET ROUTES USING APP
/*Note:-By using router we set up a mini app and make our code more orgnise by setting up routes in another file
with the help of router while routes set up with the help of app must be in main app*/
const express=require('express')
const User=require('../models/user')
const auth=require("../middleware/auth")
const multer=require('multer')
const sharp=require('sharp')
const {sendWelcomeEmail}=require('../emails/account')
const {sendExitEmail}=require('../emails/account')
const router=new express.Router()
router.post('/users',async(req,res)=>{     //we can use async for making our code to look more synchronous
    const user=new User(req.body)   
    try {
        await user.save()       /*we use try and catch intead of then and catch and here in catch we can grab                     
                                 the value of error */
        sendWelcomeEmail(user.email,user.name)  /*this is also an asynchronous fun but we don need its return value
                                        and also no need to wait for it to first complete its job so not used await*/
        const token= await user.generateAuthToken()
        res.status(401).send({user,token})
    }
    catch(e){
        res.status(400).send(e)  //to set status code according to error occur
                            //we have to set status before sendig the response otherwise default code will be send.    
    }

})

router.post('/users/login',async(req,res)=>{
   try{
    const user= await User.findByCredentials(req.body.email,req.body.password)  /*here we are working on model not
                                                                        a specific user that'why we use statics*/
    const token= await user.generateAuthToken()     /*here we want to generate token for a specific user that's why 
                                                    we used method */
    /*res.send({user: user.getPublicProfile(),token})  //if in model user.js userSchema.methods.toJSON= function()
                                                        //  is used then we use this res.send() */ 
                                                                                                   
    res.send({user,token})    /*as we now use toJSON so this will also work out as res.send calls 
                                JSON.stringify behind the scene and it calls toJSON otherwise we can use above
                        method commented but for that we have to call it in all routes and this one is automatic*/
   }

   catch(e){
    res.status(400).send()
   }
})
router.post('/users/logout',auth,async(req,res)=>{  //we also need to authenticate for logout
    try{
        req.user.tokens=req.user.tokens.filter((token)=>{   /*filter function takes one element of array and run
                                                            the callback function if function return true it will
                                                            remain in array if false then filter out and removed
                                                            so here when token matches it got filter out */
            return token.token!==req.token  /*here token is one element of the array and it contain a property 
                                            token whose value we want to access*/ 
        })
        await req.user.save()                
        res.send()
    }
    catch(e){
        res.status(500).send()
    }
   
})
router.post('/users/logoutAll',auth,async(req,res)=>{   //we also need to authenticate for logoutAll
    try{
        req.user.tokens=[]      //here we want to remove all the tokens form the array
        await req.user.save()
        res.send()
    }
    catch(e){
        res.status(500).send()
    }
})
router.get('/users/me',auth,async(req,res)=>{ /* we used auth middleware to authenticate before running the route
                                                handling function*/
    res.send(req.user)          /*we already had fetched the user during the authentication so no need to do it
                                again adn also that user will only be the one who is authenticated not anyone else
                                so user will not be albe to see other's profile*/
    // try{
    //     const users=await User.find({})  /*find() is used to read multiple users in a list and we have to specify
    //     //                                     in which Model we are going to find out*/ 
    //     res.send(users)
    // }
    // catch(e){
    //     res.status(500).send(e) // status code 500 is used for internal error like database not connected properly
    // }
})
//we do not want any user can see other user if his id is kown to him
// router.get('/users/:id',async(req,res)=>{   //':id' is route parameter it captures the dynamic values used in url
//                                        /*as findbyid() needs id to search so we have to capture it from url 
//                                        and url will we dynamic fo that purpose we use route parameter*/
//     const _id=req.params.id
//                  /*req.prams return a object whose key is route parameter name and value is the passed value in 
//               url and it also converts the id from string to binary and do not have to use new objectId("_id")  */
//     try{
//         const user=await User.findById(_id)
//         if(!user)
//         {
//             res.status(404).send()
//         }
//         else{
//             res.send(user)
//         }
//     }
//     catch(e){
//         res.status(500).send(e)
//     }
// })
router.patch('/users/me',auth,async(req,res)=>{
   // const _id=req.params.id
    //const _id=req.user._id
    const updates=Object.keys(req.body)
    const allowedUpdates=["name","email","password","age"]
    const isValidOperation=updates.every((update)=>{
        return allowedUpdates.includes(update) /*allowedUpdates.includes(update) return the boolen true if included
                                                false otherwise and our fun. should retun true if all are true i.e.
                                                all are included and false even if one is fase i.e not included */
    })
    if(!isValidOperation){
        return res.status(400).send({error:'inavalid update'})
    }
    /*Note:- update bypasses the moongoose and directly operate on database that's why we need to explictly make
runValidator=true so it never going to run this middleware so we have to use natural code rather than
findByIdAndUpdate()*/
    try{
       // const updatedUser =await User.findById(_id) //here we get the user
        updates.forEach((update)=>{                 //here we catch one key to update from the array of keys 
           /*updatedUser[update]=req.body[update]     //we use square bracketsfor dynamic values as we can not
                                                   // use user.name as it will change in all updates*/
            req.user[update]=req.body[update]
        })
     //await updatedUser.save()   //we have to save the user just like in post findByIdAndUpdate did it atomatically
         await req.user.save()
         res.send(req.user)
    //   // const updatedUser= await User.findByIdAndUpdate(_id,req.body,{new:true,runValidators:true})
    //    if(!updatedUser){
    //        res.status(404).send()
    //    }
    //   else{
    //       res.send(updatedUser)
    //   }
    }
    catch(e){
        res.status(500).send()
    }
})
router.delete('/users/me',auth,async(req,res)=>{
    //const _id=req.params.id
    //const id=req.user._id
    try{
       // await req.user.remove()
        await User.findByIdAndDelete(req.user._id)
        await sendExitEmail(req.user.email,req.user.name)
        res.send(req.user)
    //    const user= await User.findByIdAndDelete(id)
    //     if(!user)
    //     {
    //         res.status(404).send()
    //     }
    //     else{
    //         res.send(user)
    //     }
    }
    catch(e){
        res.status(500).send(e)
    }
})
const upload=multer({
   /* dest:'avatars', //if we set dest then we will not have the access to file data in route and will not able 
                      //to store it*/
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){    /*req contains request being made,file have info of file being uploaded, callback 
                                    typically called as cb and it tells multerwhen we are done filtering file
                                    still multer will validate the data but pass it through callback to route
                                    to that it can be accessable*/ 
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){/*Here we are using regex or we can also use .endswith("") fun.
                                                        Note:- for regular expression  refer to notes.*/
        
            return cb(new Error("Pls! upload only an image."))  //sending the error as first arg.
        }
        cb(undefined,true)      /*when there is no error everything is good so first arg as undefined and upload is
                                exprectd so true*/
        /*Note:- cb(undefined,false)  when there is no error but till we want to reject the upload. this will silently
                reject the upload*/
    }   
})
router.post('/users/me/avatar',auth,upload.single('myavatar'),async(req,res)=>{
    //const buffer=req.file.buffer //the data is accessable o req.file and we can accss all the properties we explored
    const updatedBuffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()    /*sharp is 
    asynchronous s uses await and shapr() returns sharp instance that can be used in chain opertions so further we 
    used chain operation to resize image to change it to .png and to convert it again in buffer data. now we will \
    have all images of same format and size so it will be easy to operate on them on client side.*/
    req.user.avatar=updatedBuffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{   /*we have set up this error handling function bcoz there is no error handling like try 
                                catch as this is not an async fun. and no prmoise.
                                Note:- Express will identify this function as error handling fun if we specified 
                                all of 4 argumeents. and it will give error when our middleware will give error
                                and it can be any middleware not only multer.*/
    res.status(400).send({error:error.message});
    next()
})
//Note:-open this url in browser
router.get('/users/:id/avatar',async(req,res)=>{
    try{
        const _id=req.params.id
        const user=await User.findById(_id)
        if(!user||!user.avatar){
            throw new Error()
        }
        res.set('Content-type','image/png') /*when we are serving any response we hav to tell the requester what 
                                            type of data we are sending and it is done by setting up a response 
                                            header and we set it with re.set("key","value") although we never set it 
                                            before but express did it for use as we were sending back json it sets
                                            Content-type:application/json*/
        res.send(user.avatar)
    }
    catch(e){
res.status(400).send("error:404")
    }
})
router.delete('/users/me/avatar',auth,async(req,res)=>{
    req.user.avatar=undefined
    await req.user.save()
    res.send()
})
module.exports=router