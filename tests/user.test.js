const request = require('supertest')
const app = require('../src/app')
const User=require('../src/models/user')
const{userOneId,userOne,setUpDatabase}=require('./fixtures/db')

/*Note:- IN tests every test should not dapend on other our sole obejctive in testing individual route/functionality
not checking the linking between the routes. like while fetching the authenticated user, in real app we use token
created at time of login during authorization during fetch operation but here in test we will not use token created
at the time of login as then both test will depends on each other and we do not want that we will use the token 
created during user creation as it will be created before each test.
as we do not depends on any task we can even write the code of updating user even after the test of deleting 
a user.*/

//Note:- as we are using different suits for task and user's tests so we have to set --runInBand in pakage.json 

/*Use beforeAll in case we want to initilise a code and our tests are not changing that code then we can use 
before all but if a tests changing or updating the data then it will produce errors.
while BeforeEach resets the data before running each test so even if any test changed the data it will be reset.
so using beforeAll is more prone to human error.*/
beforeEach(setUpDatabase)  /*beforeEach is used beforeEach test and beforeAll runs once for all test in a suit
                            use beforeEach as it reduces human errors in test. */

test('Should signup a new user', async () => {
    const response=await request(app).post('/users').send({ //the response here will be the response sended by route.
        name:"kunal",
        email: 'kunal@exampl.com',
        password: 'MyPass777!'
    }).expect(201)

    //assert that the database is changed correctly
    const user=await User.findById(response.body.user._id)
    expect(user).not.toBeNull()
    //assertion about the respose
    expect(response.body).toMatchObject({
        user:{
            name:"kunal",
            email: 'kunal@exampl.com',
        },
        token:user.tokens[0].token   /*response has to obeject in it user,token as we return res.send({user,token})
                                        in route handler*/
    })
    expect(user.password).not.toBe('MyPass777!')      //password is not saved in plain text
})
test('Should login a existing user',async()=>{
    const response=await request(app).post('/users/login').send({
        email:userOne.email,
        password:userOne.password
    }).expect(200)
    //assert that the token is saved correctly in database.
    const user= await User.findById(response.body.user._id)
    expect(user).not.toBeNull()
    //console.log(user.tokens)
    expect(response.body.token).toBe(user.tokens[1].token)    //we have saved a token when we were creating the user.
    
})
test('Should not login non-existing user',async ()=>{
    await request(app).post('/users/login').send({
        email:userOne.email,
        password:"jhkfhgfg"
    }).expect(400)
})
test('Should get profile for user',async()=>{
    const response=await request(app)
    .get('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})
test('Should not get profile for unauthenticated user',async()=>{
    await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('Should delete an account for user',async()=>{
    const response=await request(app)
    .delete('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
    const user=await User.findById(userOneId)
    expect(user).toBeNull()
})
test('Should not delete an account for unauthenticated user',async()=>{
    await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})
test('Should upload avatar image',async()=>{
    const response=await request(app)
    .post('/users/me/avatar')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .attach('myavatar','./tests/fixtures/profile-pic.jpg')
    .expect(200)

    const user= await User.findById(userOneId) 
    expect(user.avatar).toEqual(expect.any(Buffer)) /*toBe is using === , and we have studied that one object is
                                                    naver equals to another objecteven with save properties and 
                                                    their values to here in case of object we use toEquals()
                                                    it uses an algo. to do our*/
})
test('Should update a user correcly',async()=>{
    const response=await request(app)
    .patch('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send({
        name:'Anshu Bajpai'
    }).expect(200)
    const user=await User.findById(userOneId)
    expect(user.name).toEqual('Anshu Bajpai')
})

