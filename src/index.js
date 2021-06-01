const app=require('./app')
port= process.env.PORT

app.listen(port,()=>{
    console.log("yup port is running on port no.:",port)
})

/*Note:-Since we don't need to run server to up and run for tests we just need the aap so we make app and sever to
live in different files and imported he file in server i.e. index.js*/