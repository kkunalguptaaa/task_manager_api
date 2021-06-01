const request = require('supertest')
const app = require('../src/app')
const Task=require('../src/models/task')
const{userOneId,
    userOne,
    setUpDatabase,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,}=require('./fixtures/db')
                       
beforeEach(setUpDatabase)  /*use before all otherwise this code will run many times and generate many Object Ids
                        and that will create problem in code one id will be assign to our variable ,the one stored 
                        in database will be diffreent and used at thetime of login is different and this cause problm
                        as when we try to fetch user using the id variable the id stored in id variable will be
                        different from that is stored in database.*/


test('Should create a new task', async () => {
    const response=await request(app)
    .post('/tasks')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send({                         //the response here will be the response sended by route.       
       description:'make a test for task!',
       completed:true
    }).expect(201)
    const task =await Task.findById(response.body._id)
    expect(task.completed).toBe(true)
})
test('Should fetch user tasks',async()=>{
    const response=await request(app)
    .get('/tasks')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
    expect(response.body.length).toBe(2)
    
})
test('user should not delete the other users tasks',async()=>{
    const response=await request(app)
    .delete(`/tasks/${taskThree._id}`)
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(404)
    const task=await Task.findById(taskThree._id)
    expect(task).not.toBeNull()
})
