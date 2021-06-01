const User=require('../../src/models/user')
const Task=require('../../src/models/task')
const mongoose=require('mongoose')
const jwt=require('jsonwebtoken')

const userOneId=new mongoose.Types.ObjectId()
const userOne={
    _id:userOneId,
    name:'Anshu',
    email:'anshu@gmail.com',
    password:'firstCrushOrSayLove',
    tokens:[{
         token:jwt.sign({_id:userOneId.toString()},process.env.JWT_SECRET)
    }]
}
const userTwoId=new mongoose.Types.ObjectId()
userTwo={
    _id:userTwoId,
    name:'Shaurya',
    email:'Shaurya@gmail.com',
    password:'SecondCrush',
    tokens:[{
         token:jwt.sign({_id:userTwoId.toString()},process.env.JWT_SECRET)
    }]
}
const taskOne={
    _id:new mongoose.Types.ObjectId(),
    description:'First task',
    completed:false,
    owner:userOne._id
}

const taskTwo={
    _id:new mongoose.Types.ObjectId(),
    description:'Second task',
    completed:true,
    owner:userOne._id
}
const taskThree={
    _id:new mongoose.Types.ObjectId(),
    description:'Third task',
    completed:false,
    owner:userTwo._id
}

const setUpDatabase=async()=>{
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}


module.exports={
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setUpDatabase
}