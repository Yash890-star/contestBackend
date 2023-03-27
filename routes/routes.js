const router = require('express').Router()
const userRoutes = require('../controllers/user')
const staffRoutes = require('../controllers/staff')
const staff = require('../models/staff')

//User Routes

router.post('/register', userRoutes.postRegister)
router.post('/login', userRoutes.postLogin)
router.get('/competitions', userRoutes.getCompetitions)
router.post('/apply', userRoutes.postCompetitions)
router.post('/sendMail', userRoutes.sendMail)
router.post('/setRemainder', userRoutes.addRemainders)
router.get('/getRemainder', userRoutes.getAllRemainders)
router.get('/logout', userRoutes.getLogout)
router.post('/postStatus', userRoutes.postStatus)
router.get('/completions', userRoutes.getCompletions)
router.get('/staffRemainders', userRoutes.getStaffRemainders)
router.post('/staffCompleted', userRoutes.postStaffCompletions)

//staff routes

router.post('/staffRegister', staffRoutes.postRegister)
router.post('/staffLogin', staffRoutes.postLogin)
router.get('/getSites', staffRoutes.getAllSites)
router.get('/getComps', staffRoutes.getAllcompetitions)
router.post('/remainder', staffRoutes.postRemainder)
router.get('/getRemainders', staffRoutes.getAllRemainders)
router.get('/createExcel', staffRoutes.createExcel)
router.get('/test', staffRoutes.test)

module.exports = router