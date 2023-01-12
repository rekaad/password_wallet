import supertest from 'supertest'
import app from './app.js'

describe("POST /testowanie", () =>{
    
    describe("given a username and password", () =>{

        test("should respond with a 200 status code", async () =>{
            const response = await supertest(app).post("/testowanie").send({
                login: "login",
                password: "password"
            })
            expect(response.statusCode).toBe(200)
        })
    })


})