const jwt= require('jsonwebtoken')
const User=require('../models/user')
const auth=async(req,res,next)=>{
    try{
        const token=req.header('Authorization').replace('Bearer ',"") /*header has the token and started with
                                                                     "Bearer " which we want to remove from string*/
        const decoded=jwt.verify(token,process.env.JWT_SECRET)    //verify the token is valid with signature
        /*Note:- we verify the token only for the the varification that data in that token is not altered as data
        of token is accessale to anyone and we have to use that data*/
        const user=await User.findOne({_id:decoded._id,'tokens.token':token})/*fetching the user with the id given
                                                        in token and also verifying that token is also stored in 
                                                        database i.e. user in not loged out and still logedin */
        if(!user)
        {
            throw new Error() 
        }
        req.token=token         //returning the user and token so that we don't have to fetch user and token again
        req.user=user
        next()
    }
    catch(e){
        res.status(401).send({error:'Please Authenticate!'})
    }
}
module.exports=auth