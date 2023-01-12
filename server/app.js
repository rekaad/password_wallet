import express from 'express'

const app = express()

app.post('/testowanie', (req,res)=>{
    res.statusCode(200);
})

export default app