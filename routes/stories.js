const express = require('express')
const router = express.Router()
const Story = require('../models/Story')
const { ensureAuth } = require('../middleware/auth')

router.get('/add',ensureAuth,(req,res)=>{
    res.render('stories/add')
})

// Creating a Story
router.post('/',ensureAuth,async (req,res)=>{
    try{
        req.body.user = req.user.id
        await Story.create(req.body)
        res.redirect('/dashboard')
    }
    catch(err)
    {
        console.error(err)
        res.render('error/500')
    }
})

// Getting all public stories
router.get('/',ensureAuth,async (req,res)=>{
    try{
        const stories = await Story.find({ status:'public' })
        .populate('user')
        .sort({createdAt:'desc'})
        .lean()

        res.render('stories/index',{
            stories
        })
    }
    catch(err){
        console.error(err)
        res.render('error/500')
    }
})

router.get('/:id',ensureAuth, async (req,res)=>{
    try {
        let story = await Story.findById(req.params.id)
        .populate('user')
        .lean()

        if(!story)
        {
            return res.render('error/404')
        }
        
        res.render('stories/show',{
            story
        })
    } catch (err) {
        console.error(err)
        res.render('error/404')
    }
})

router.get('/user/:userId',ensureAuth,async (req,res)=>{
    try {
        const stories = await Story.find({user:req.params.userId, status:'public'})
        .populate('user')
        .sort({createdAt:'desc'})
        .lean()

        // console.log(story)
        res.render('stories/index',{
            stories
        })
    } catch (err) {
        console.error(err)
        res.render('error/500')
    }
})

router.get('/edit/:id',ensureAuth, async (req,res)=>{
    const story = await Story.findById(req.params.id ).lean()
    if(!story)
    {
        return res.render('error/404')
    }

    if(story.user != req.user.id)
    {
        res.redirect('/stories')
    }
    else
    {
        res.render('stories/edit',{
            story
        })
    }
})

router.put('/:id',ensureAuth, async (req,res)=>{
    try {
        let story = await Story.findById(req.params.id)
        if(!story)
        {
            return res.render('error/404')
        }

        if(story.user != req.user.id)
        {
            res.redirect('/stories')
        }
        else
        {
            story = await Story.findOneAndUpdate({_id:req.params.id},req.body,{
                new:true, //creates new if such story doesn't exist
                runValidators:true //to perform validation checks
            })
            res.redirect('/dashboard')
        }
    } catch (err) {
        console.error(err)
        res.render('error/500')   
    }
})


router.delete('/:id',ensureAuth, async(req,res)=>{
    try{
        await Story.deleteOne({_id:req.params.id})
        res.redirect('/dashboard')
    }
    catch(err){
        console.error(err)
        return res.render('error/500')
    }
})

module.exports = router