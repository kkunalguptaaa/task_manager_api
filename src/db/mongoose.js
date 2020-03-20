const mongoose =require('mongoose')
const validator=require('validator')
/*mongoose.connect is used to connect to the database here we provide the url with the name of database and the 
{  useNewUrlParser:true, useCreateIndex:true} */
mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser:true,
    useUnifiedTopology: true,
    useFindAndModify:false,
    useCreateIndex: true
})