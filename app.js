const express = require('express')
const dotenv = require('dotenv')
dotenv.config({path:'./config/config.env'})
const connectDB = require('./db')
const exphbs = require('express-handlebars')
const path = require('path')
const mongoose = require('mongoose')
const passport = require('passport')
const methodOverride = require('method-override')
const session = require('express-session')
const app = express()
const MongoStore = require('connect-mongo')(session)
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended:false }))
// Passport config
require('./config/passport')(passport)

//Method override - to Perform extra operations like PUT and DELETE on form
app.use(methodOverride(function(req,res){
    if(req.body && typeof req.body=='object' && '_method' in req.body){
        let method = req.body._method
        delete req.body._method
        return method
    }
}))

setInterval(async ()=>{
    const resp = await axios.get('https://project-stories.onrender.com/keep-alive');
    console.log(`Got keep-alive! - `,(resp.data))
}, 1000*3)

// Connecting to MongoDB
connectDB()

//Helpers
const {formatDate,stripTags,truncate,editIcon,select} = require('./helpers/hbs')
const { default: axios } = require('axios')

// View Engine
app.engine('.hbs',exphbs({helpers:{
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select
}, defaultLayout:'main',extname:'.hbs'}));
app.set('view engine','.hbs')

// Sessions
app.use(session({
    secret:'keyboard cat',
    resave:false,
    saveUninitialized:false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}))

//Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Setting global variable
app.use(function(req,res,next){
    res.locals.user = req.user || null
    next()
})

app.use(express.static(path.join(__dirname,'public')))

app.use('/',require('./routes/api'))
app.use('/auth',require('./routes/auth'))
app.use('/stories',require('./routes/stories'))

app.listen(PORT,()=>{console.log(`Server is running at PORT ${PORT}`)});