const express = require('express')
const multer = require('multer')
// to convert large images in common formats to smaller, web-friendly JPEG,
// PNG, WebP and AVIF images of varying dimensions.
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')

const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')


const router = new express.Router()
// Endpoint: creating the user
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        // sends a mail when you create the account in the task app
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

//Endpoint:logging the users
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()  
    }
})

// Endpoint:logout the user
router.post('/users/logout', auth,  async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }

})

// Endpoint:logout all the sessions
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})
// Endpoint:reading the users
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

// Endpoint: updating the users 
router.patch('/users/me', auth,  async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates'})
    }

    try {
        //updating the user thorugh the mongoose 
        // const user = await User.findById(req.user._id)
        // Update means here email user pwd etc..
        updates.forEach((update) => req.user[update] = req.body[update])
        
        // here our middle ware actually executes
        await req.user.save()
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true})
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Endpoint:deleting the user
router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id)

        // if (!user) {
        //     return res.status(404).send()
        // }

        await req.user.remove()
        sendCancelationEmail (req.user.email, req.user.name)

        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})
// For uploading the user profile image we use multer package
const upload = multer({
    // dest: 'avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload a jpg,jpeg,png files here'))
        }

        cb(undefined, true)
    }
})
// Endpoint:setting up the endpoint for the avatar upload
router.post('/users/me/avatar', auth, upload.single('avatar'),async (req, res) => {
    // applying sharp to format the image
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer()
    // modified image stores in the buffer variable
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

//  Endpoint:deleting the avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})


// get the avatar by the user id
router.get('/users/:id/avatar', async (req, res) => {
    try {
        //finding the user id and storing into the var
        const user = await User.findById(req.params.id)
        
        // check condition if user is not found and throws an error
        if (!user || !user.avatar) {
            throw new Error()
        }
        // setting the data type  they are getting back(jpg)
        res.set('Content-Type', 'image/png ')

        //sending the avatar to the local host 
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})
module.exports = router

// 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