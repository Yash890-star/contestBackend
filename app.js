const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const cron = require('node-cron');
const User = require('./models/user')

const routes = require('./routes/routes')
const app = express()

app.use(cookieParser())
app.use(bodyParser.json())
app.use(cors({
    credentials: true,
    origin: ['http://localhost:3000']
}))
app.use(routes)

mongoose.set('strictQuery', true)

mongoose.connect('mongodb+srv://root:Trojan890.@contestscrapper.xewnaj4.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if (err) {
        console.log(err)
    }
    else {
        console.log('connected')
    }
})

cron.schedule('* */10 * * *', async () => {
    console.log('running a task every minute');
    const users = await User.find()
    for (let x of users) {
        for (let y of x.remainders) {
            console.log(y)
            if (y.in_24_hours === 'Yes') {
                console.log("done")
                const nodemailer = require('nodemailer')
                let config = {
                    service: 'gmail',
                    auth: {
                        user: "yashwanthk523@gmail.com",
                        pass: "liookxwpkwbmjnyv"
                    }
                }
                let transporter = nodemailer.createTransport(config)
                let message = {
                    from: "yashwanthk523@gmail.com",
                    to: "yeswanthkumar.cse2020@citchennai.net",
                    subject: "Remainder Alert",
                    html: `<div>
                        <h1>Hello ${x.name},</h1><br/>
                        <h2>This is to inform you that ${y.name} is about to start soon</h2>
                        <h2>Here is the <a href=${y.url}>Link</a></h2>
                        <h1>We wish you all the best</h1>
                    </div>`
                }
                transporter.sendMail(message).then(() => {
                    console.log("done")
                }).catch((err) => {
                    console.log(err)
                })

            }
        }
    }
});

app.listen(5001, () => {
    console.log("server started at 5001")
})