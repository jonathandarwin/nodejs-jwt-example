const express = require('express')
const jwt = require('jsonwebtoken')
const uuid = require('uuid')

const app = express()
app.use(express.json())

const sessionIdList = []

const SECRET_KEY = "49034tv90wiocrfjwojrfkajsdfjlkasdfjkla"

app.post('/login', (req, res) => {
    const username = req.body.username
    const password = req.body.password

    if(username == 'admin' && password == 'admin') {
        // Preapare Payload
        const sessionId = uuid.v4()
        const payload = { sessionId, username }
        
        // Save Session ID to Database (to array for simplicity)
        sessionIdList.push(sessionId)

        // Generate JWT
        const token = jwt.sign(payload, SECRET_KEY)

        res.send({
            message : 'Login Success',
            token : token,
        })
    }
    else {
        // Credential is incorrect
        res.send({
            message : 'Username / Password Incorrect'
        })
    }
})

app.get('/product', (req, res) => {
    // Get JWT token
    const token = req.headers.authorization
    
    try{
        // Decode Token
        const payload = jwt.verify(token, SECRET_KEY)

        const sessionId = payload.sessionId

        // Checking Session ID To Database
        let isFound = false
        sessionIdList.forEach(e => {
            if(e == sessionId) isFound = true // Session ID Valid
        })

        if(isFound) {
            res.send({
                "username" : payload.username,
                "data" : [
                    {
                        "id" : 1,
                        "name" : "Mouse",
                        "qty": 12
                    },
                    {
                        "id" : 2,
                        "name" : "Monitor",
                        "qty": 10
                    }
                ]
            })
        }
        else {
            // Session ID is not found in DB -> Expired
            res.send({
                "message" : "Session ID Expired"
            })
        }
    }
    catch(e) {
        // Cannot decode / verify token -> Token is invalid
        res.send({
            "message" : "Token Invalid"
        })
    }
})

const PORT = process.env.PORT || 1122
app.listen(PORT, () => {
    console.log(`Listening to port : ${PORT}...`)
})