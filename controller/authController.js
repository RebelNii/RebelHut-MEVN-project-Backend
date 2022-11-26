const UserSchema = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const expressHandler = require('express-async-handler')


/**
 * @desc Login
 * @route POST /auth
 * @access PUBLIC
 */
const login = expressHandler(async (req,res) => {
    //destruct body params
    const {username, password} = req.body
    // console.log(username, password)

    //check
    if(!username || !password){
        return res.status(400).json({message: "Username and Password required"})
    }

    //find user
    const user = await UserSchema.findOne({username}).exec()

    //
    if(!user || !user.active){
        return res.status(400).json({message: "User not found"})
    }

    //
    res.clearCookie("jwt");

    //
    const passCompare = await bcrypt.compare(password, user.password)

    if(!passCompare) return res.status(400).json({message: "Error"})

    const person = {
        'id': user._id,
        'username': user.username,
        'status': user.active,
        'roles': user.roles
    };

    const accessToken = jwt.sign(
        {'UserInfo':{'userId':user._id,'username': user.username,'roles': user.roles, 'status': user.active}},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: "10m"}
    )
    const refreshToken = jwt.sign(
        {'UserInfo':{'user-id':user._id,'username': user.username,'roles': user.roles, 'status': user.active}},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: "1d"}
    )

    // user.refreshToken = refreshToken;
    // const results = await findUser.save();
    // console.log(results);secure: true,
    
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 60 * 60 * 24 * 7,//this will be 7days
    });

    
    res.status(200).json({ accessToken});
    // console.log({'i': refreshToken})
})

/**
 * @desc Refresh
 * @route GET /auth/refresh
 * @access PUBLIC
 */
const refresh = expressHandler(async(req,res)=> {
    const cookies = req.cookies

    if(!cookies)return res.status(401).json({message: 'Invalid Cookie'})

    const refreshToken = cookies.jwt
    // console.log(cookies)
    // console.log(refreshToken)

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        expressHandler(async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })
            // console.log(decoded)
            // console.log(decoded.UserInfo.username)

            const foundUser = await UserSchema.findOne({ username: decoded.UserInfo.username }).exec()

            if (!foundUser) return res.status(401).json({ message: 'Unauthorized User' })
            

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundUser.username,
                        "roles": foundUser.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            )

            res.json({ accessToken })
        })

    )

})


/**
 * @desc Logout
 * @route POST /auth/logout
 * @access PUBLIC
 */
const logout = expressHandler(async (req,res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204) //No content , secure: true
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    res.json({ message: 'Cookie cleared' })
})

module.exports = {login, refresh, logout}