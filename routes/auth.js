const express = require('express')
const passport = require('passport')
const router = express.Router()

// Auth with Google
router.get('/google',passport.authenticate('google',{ scope:['profile'] }))

// Google Auth Callback
router.get('/google/callback',passport.authenticate('google',{
    failureRedirect:'/'}), (req,res)=>{
        res.redirect('/dashboard')
    }
)

// Logout User
router.get('/logout',(req,res)=>{
    req.logout()
    res.redirect('/')
})

module.exports = router