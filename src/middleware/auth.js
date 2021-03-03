// loading the jsonwebtoken package
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        // getting the token from header of the users
        const token = req.header('Authorization').replace('Bearer ', '')

        // checking for the valid token or not
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // if valid token  then check in db
        // find user with correct id with authentication token still stored
        const user = await User.findOne({ _id: decoded._id,'tokens.token': token })

        // if user not found then throws an error
        if (!user) {
            throw new Error()
        }
        // token of that particular id's user
        req.token = token

        //set the user which is finded by that id and stores in that
        req.user = user

        // call next
        next()

    } catch (e) {
        res.status(401).send({ error: 'Please authentication.' })
    }
}

module.exports = auth