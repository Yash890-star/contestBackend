const Staff = require('../models/staff')
const jwt = require('jsonwebtoken')
const fetch = require('node-fetch')
const bcrypt = require('bcrypt')
const User = require('../models/user')

exports.postLogin = async (req, res, next) => {
    const staff = await Staff.findOne({ email: req.body.email })
    if (!staff) {
        return res.send('user does not exist')
    }
    if (! await bcrypt.compare(req.body.password, staff.password)) {
        return res.send('user credentials do not match')
    }
    const token = jwt.sign({ _id: staff._id }, "key")
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

exports.postRegister = async (req, res, next) => {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
    const exist = await Staff.findOne({ email: req.body.email })
    if (exist) {
        return res.send('user Exists')
    }
    const staff = new Staff({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
    })
    try {
        const save = await staff.save()
        const result = save.toJSON()
        const { password, ...data } = result
        const token = jwt.sign({ _id: staff._id }, "key")
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 * 100,
            sameSite: 'none'
        })
        res.send({ message: 'yes' })
    }
    catch (err) {
        res.send(err)
    }
}

exports.getAllSites = async (req, res, next) => {
    const data = await fetch('https://kontests.net/api/v1/sites')
    const result = await data.json()
    res.send(result)
}

exports.getAllcompetitions = async (req, res, next) => {
    const data = await fetch('https://kontests.net/api/v1/all')
    const result = await data.json()
    res.send(result)
}

exports.postRemainder = async (req, res, next) => {
    try {
        const cookie = req.cookies['jwt']
        const claims = jwt.verify(cookie, "key")
        if (!claims) {
            return res.send({ message: "user not logged in" })
        }
        const staff = await Staff.findOne({ _id: claims._id })
        let a = staff.remainders
        a.push(req.body.remainder)
        staff.remainders = a
        await staff.save()
    }
    catch (err) {
        console.log(err)
        res.send({ "err": "err" })
    }
}

exports.getAllRemainders = async (req, res, next) => {
    const cookie = req.cookies['jwt']
    const claims = jwt.verify(cookie, "key")
    if (!claims) {
        return res.send({ message: "user not logged in" })
    }
    const staff = await Staff.findOne({ _id: claims._id })
    return res.send(staff.remainders)
}

exports.createExcel = async (req, res, next) => {
    const cookie = req.cookies['jwt']
    const claims = jwt.verify(cookie, "key")
    if (!claims) {
        return res.send({ message: "user not logged in" })
    }
    const staff = await Staff.findOne({ _id: claims._id })
    const ExcelJS = require('exceljs');
    const fileName = 'simple.xlsx';
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('My Sheet');
    // ws.getCell('B1').value = 'contests completed';
    firstarr = []
    for (let x of staff.remainders) {
        firstarr.push(x.name)
    }
    let users = ['StudentName']
    const user = await User.find()
    const c1 = ws.getColumn(1)
    for (let x of user) {
        users.push(x.name)
    }
    c1.values = users
    let i = 2
    for (let y of firstarr) {
        let vals = []
        vals.push(y)
        const r2 = ws.getColumn(i)
        for (let x of user) {
            if (x.staffCompletions.includes(y)) {
                vals.push("yes")
            }
            else {
                vals.push("no")
            }
        }
        r2.values = vals
        i = i + 1;
    }
    // for (let x of user) {
    //     let arr = []
    //     arr.push(x.name)
    //     for (let y of x['staffCompletions']) {

    //     }
    //     const r3 = ws.getRow(i);
    //     r3.values = arr;
    //     arr = []
    //     i += 1
    // }
    // const comps = user.completions
    // arr.push(user.name)
    // 
    // const r3 = ws.getRow(2);
    // r3.values = arr;
    ws.columns.forEach(column => {
        const lengths = column.values.map(v => v.toString().length);
        const maxLength = Math.max(...lengths.filter(v => typeof v === 'number'));
        column.width = maxLength;
    });
    wb.xlsx
        .writeFile(fileName)
        .then(() => {
            console.log('file created');
        })
        .catch(err => {
            console.log(err.message);
        });
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
        subject: "Your excel sheet is ready",
        html: `<div>
            <h1>hey your excel sheet is ready, pls find it in the attachment to this mail</h1>
            </div>`,
        attachments: [
            {
                filename: 'simple.xlsx',
                path: './simple.xlsx'
            }
        ]

    }
    transporter.sendMail(message).then(() => {
        console.log("done")
        res.send({ message: 1 })
    }).catch((err) => {
        console.log(err)
    })
}

exports.test = async (req, res, next) => {
    res.send({ message: "nice ppl" })
}

