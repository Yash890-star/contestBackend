const bcrypt = require('bcrypt')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const fetch = require('node-fetch')
const Staff = require('../models/staff')

exports.postRegister = async (req, res, next) => {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
    const exist = await User.findOne({ email: req.body.email })
    if (exist) {
        return res.send('user Exists')
    }
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
    })
    try {
        const save = await user.save()
        const result = save.toJSON()
        const { password, ...data } = result
        const token = jwt.sign({ _id: user._id }, "key")
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 * 100,
            sameSite: 'none',
            secure: true
        })
        res.send({ message: 'yes' })
    }
    catch (err) {
        res.send(err)
    }
}

exports.postLogin = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return res.send('user does not exist')
    }
    if (! await bcrypt.compare(req.body.password, user.password)) {
        return res.send('user credentials do not match')
    }
    const token = jwt.sign({ _id: user._id }, "key")
    if (req.body.loggedIn) {
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 * 100,
            sameSite: 'none',
            secure: true
        })
    }
    else {
        res.cookie('jwt', token, {
            httpOnly: true,
            sameSite: 'none',
            secure: true
        })
    }
    console.log("logged in")
    res.send({ message: 'yes' })
}

exports.postCompetitions = async (req, res, next) => {
    try {
        const cookie = req.cookies['jwt']
        console.log(cookie)
        const claims = jwt.verify(cookie, 'key')
        console.log(claims)
        if (!claims) {
            res.send({ message: "user not logged in" })
        }
        const user = await User.findOne({ _id: claims._id })
        user.competitions = req.body.competitions
        await user.save()
        res.send({ "message": "done" })
    }
    catch (err) {
        res.send(err)
    }
}

exports.getCompetitions = async (req, res, next) => {
    try {
        console.log("compe")
        let result = {}
        const cookie = req.cookies['jwt']
        const claims = jwt.verify(cookie, 'key')
        if (!claims) {
            return res.send({ message: "user not logged in" })
        }
        const user = await User.findOne({ _id: claims._id })
        for (let x of user.competitions) {
            console.log("here")
            if (x === "LeetCode") {
                const response = await fetch('https://kontests.net/api/v1/leet_code')
                const leetcode = await response.json()
                result[x] = leetcode
            }
            else if (x === "CodeChef") {
                const response = await fetch('https://kontests.net/api/v1/code_chef')
                const codechef = await response.json()
                result[x] = codechef
            }
            else if (x === 'HackerRank') {
                const response = await fetch('https://kontests.net/api/v1/hacker_rank')
                const hackerrank = await response.json()
                result[x] = hackerrank
            }
            else if (x === "CodeForces") {
                const response = await fetch('https://kontests.net/api/v1/codeforces')
                const codeFoces = await response.json()
                result[x] = codeFoces
            }
            else if (x === "CodeForces::Gym") {
                const response = await fetch('https://kontests.net/api/v1/codeforces_gym')
                const codeForcesGym = await response.json()
                result[x] = codeForcesGym
            }
            else if (x === 'TopCoder') {
                const response = await fetch('https://kontests.net/api/v1/top_coder')
                const topCoder = await response.json()
                result[x] = topCoder
            }
            else if (x === "AtCoder") {
                const response = await fetch('https://kontests.net/api/v1/at_coder')
                const atCoder = await response.json()
                result[x] = atCoder
            }
            else if (x === "CS Academy") {
                const response = await fetch('https://kontests.net/api/v1/cs_academy')
                const csAcademy = await response.json()
                result[x] = csAcademy
            }
            else if (x === 'HackerEarth') {
                const response = await fetch('https://kontests.net/api/v1/hacker_earth')
                const hackerearth = await response.json()
                result[x] = hackerearth
            }
            else if (x === "Kick Start") {
                const response = await fetch('https://kontests.net/api/v1/kick_start')
                const kickStart = await response.json()
                result[x] = kickStart
            }
        }
        let remainders = user.remainders
        console.log(remainders)
        let finalArr = []
        let finalObj = {}
        for (let x in result) {
            finalObj[x] = []
        }
        let flag = 0
        for (let x in result) {
            for (let y of result[x]) {
                for (let z of remainders) {
                    if (y.name === z.name && y.start_time === z.start_time) {
                        flag = 1
                        break
                    }
                }
                if (flag == 0) {
                    finalArr.push(y)
                }
                flag = 0
            }
            finalObj[x] = finalArr
            finalArr = []
        }
        console.log(finalObj)
        res.send(finalObj)
    }
    catch (err) {
        res.send(err)
    }
}

exports.sendMail = async (req, res, next) => {
    const competition = req.body.name
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
        subject: "test",
        html: `<h1>${competition} la competition iruku bro</h1>`
    }
    transporter.sendMail(message).then(() => {
        console.log("done")
    }).catch((err) => {
        console.log(err)
    })
}

exports.addRemainders = async (req, res, next) => {
    try {
        const cookie = req.cookies['jwt']
        const claims = jwt.verify(cookie, 'key')
        console.log(claims)
        if (!claims) {
            return res.send({ message: "user not logged in" })
        }
        const user = await User.findOne({ _id: claims._id })
        console.log(user)
        let a = user.remainders
        a.push(req.body.remainder)
        user.remainders = a
        await user.save()
        res.send({ "message": "yes" })
    }
    catch (err) {
        console.log(err)
    }

}

exports.getAllRemainders = async (req, res, next) => {
    try {
        const cookie = req.cookies['jwt']
        const claims = jwt.verify(cookie, 'key')
        console.log(claims)
        if (!claims) {
            res.send({ message: "user not logged in" })
        }
        let result = []
        const user = await User.findOne({ _id: claims._id })
        const completions = user.completions
        for (let x of user.remainders) {
            if (completions.includes(x.name)) {
                console.log(x.name)
            }
            else {
                result.push(x)
            }
        }
        // console.log(completions)
        res.send(result)
    }
    catch (err) {
        console.log(err)
    }
}

exports.getLogout = async (req, res, next) => {
    res.cookie('jwt', '', { maxAge: 0 })
    return res.send({
        body: "success"
    })
}

exports.postStatus = async (req, res, next) => {
    try {
        const cookie = req.cookies['jwt']
        const claims = jwt.verify(cookie, 'key')
        console.log(claims)
        if (!claims) {
            res.send({ message: "user not logged in" })
        }
        const user = await User.findOne({ _id: claims._id })
        console.log(user)
        let a = user.completions
        a.push(req.body.name)
        user.completions = a
        await user.save()
    }
    catch (err) {
        console.log(err)
    }
}

exports.getCompletions = async (req, res, next) => {
    const cookie = req.cookies['jwt']
    const claims = jwt.verify(cookie, 'key')
    console.log(claims)
    if (!claims) {
        res.send({ message: "user not logged in" })
    }
    const user = await User.findOne({ _id: claims._id })
    let response = []
    for (let x of user.remainders) {
        if (user.completions.includes(x.name)) {
            response.push(x)
        }
    }
    res.send(response)
}

exports.getStaffRemainders = async (req, res, next) => {
    const cookie = req.cookies['jwt']
    const claims = jwt.verify(cookie, 'key')
    console.log(claims)
    if (!claims) {
        res.send({ message: "user not logged in" })
    }
    const user = await User.findOne({ _id: claims._id })
    console.log(user.staffCompletions)
    const staff = await Staff.findOne({ email: "user@user.com" })
    console.log(staff)
    let a = []
    if(staff && staff.remainders){
        console.log("staff remainders")
        for (let x of staff.remainders) {
            if (!user.staffCompletions.includes(x.name)) {
                a.push(x)
            }
        }
    }
    res.send(a)
}

exports.postStaffCompletions = async (req, res, next) => {
    const cookie = req.cookies['jwt']
    const claims = jwt.verify(cookie, 'key')
    console.log(claims)
    if (!claims) {
        res.send({ message: "user not logged in" })
    }
    const user = await User.findOne({ _id: claims._id })
    let a = user.staffCompletions
    a.push(req.body.completed)
    user.staffCompletions = a
    user.save()
    res.send({ message: 1 })
}