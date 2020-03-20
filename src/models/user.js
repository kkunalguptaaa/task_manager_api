const mongoose =require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
/*Middleware:- mongoose provide us middleware and with middleware we can regester to run some function before after
some events e.g. save,remove,validate */
/*Note:-When we pass an object in model it automatically convert it in into Schema behind the scene.*/
/*So here we first made a schema and then passed is to the model and before passing it we write code for
our middleware i.e. hashing before the save event i.e before user model got saved */
/*Note:- update bypasses the moongoose and directly operate on database that's why we need to explictly make
runValidator=true so it never going to run this middleware so we have to use natural code rather than
findByIdAndUpdate() */

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true ,  //we make our field mandtory to fill 
        trim:true       //sanatization removing the extra spaces
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){   //using validator npm library to validate email
                throw new Error("Invalid Email")
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:7, //min length of password is 7
        validate(value){
            if(value.toLowerCase().includes("password"))    //password can'nt contain word "password"
            {
                throw new Error("password can'nt contain the word 'password'")
            }
        }


    },
    age:{
        type:Number,
        default:0,
        validate(value){        //custom validation
            if(value<0){
                throw new Error('Age must be positive!')
            }
        }
    },
    avatar:{
        type:Buffer
    },
    tokens:[{       //it is a array of tokens used to a user 
        token:{
            type:String,
            required:true
        }
    }],
    
},{
    timestamps:true
})
                    //virtual property
//it do not het stored in data base it just provide relation between user and task and my 'tasks' works just like
//just 'owner' in task model.
userSchema.virtual('mytasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})
                                        //hiding private data
/*when we pass a object to res.send({}) it calls JSON.stringify() behind the scene and JSON.stringify() calls toJSON
function and use its return value. so res.send will ultimately calls this function and use its returned value
in which we have deleted the password and tokens and returned it*/
userSchema.methods.toJSON= function(){
    const user=this
    const userObject=user.toObject()
    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}
                                        //generate jwt token
/*Here we made a instance method on userSchema we use method when we have to apply the method on an individual user
 or instance. so it is applicable to an individual user as we called it on a user in router*/

userSchema.methods.generateAuthToken=async function(){
    const user=this
    const token=jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)    //convert _id to dtring from object
    user.tokens=user.tokens.concat({token})
    await user.save() /* it will we created as sub-document and it will have it own id*/
    return token

}
                                    //verify the email and password in login
/*Here we made a static method on userSchema we use static when we have to apply the method on whole model
sometimes it is called as model method so it is applicable to every user as we called it on User model in router*/
userSchema.statics.findByCredentials=async(email,password)=>{
    const user=await User.findOne({email})  //here we find user via email in database
    if(!user){
        throw new error("Invalid Email or Password!")
    }
    const isMatch=await bcrypt.compare(password,user.password)  //here we verify the password of the user
    if(!isMatch){
        throw new error("Invalid Email or Password!")
        
    }
    return user
}

//Hash the plain text password before saving
userSchema.pre('save',async function(next){ //here we want to run this code before the save event
    const user=this                         /*this has access to the current user to bind the value of this 
                                            we have used nomal fun. not arrow as it do not binds this*/
    if(user.isModified('password')){
       user.password=await bcrypt.hash(user.password,8)
    }
    next()                                   /*next() is used because ths whole code has to run before save event
                                            and as code is asynchronous it will never now when code is completed
                                            and next() indicates that code is completed and now save the user
                                            or execote diff. code */
}) 
//setting up a middleware for Deleting all user tasks when a user is removed
userSchema.pre('remove',async function(next){
    const user=this
    await Task.deleteMany({owner:user._id})
    next()
})
//here we made a model of our user , validate and sanitize the name and email
const User= mongoose.model('User',userSchema)
module.exports=User
