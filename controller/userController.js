const UserSchema = require("../models/User");
const NoteSchema = require("../models/Note");
const bcrypt = require("bcrypt");
const expressHandler = require("express-async-handler");

/**
 * Get() endPoint
 * Get all users
 */
const getAllUsers = expressHandler(async (req, res) => {
  //we didnt add .exec() bc no var was passed into find()
  // console.log(req.headers)
  const users = await UserSchema.find().select("-password").lean();
  if (!users?.length) return res.status(400).json({ message: "No Users Entry Found" });
  res.json(users);
});

/**
 * Post() endPoint
 * create user
 */
const createUser = expressHandler(async (req, res) => {
  const { username, password, roles } = req.body;
  if (!username || !password || !Array.isArray(roles)){
    return res.status(400).json({ message: "Inputs Field Required" })};
  //we need to call lean because we're not going to call save on const duplicate and we don't need all properties on document
  //collation checks for case sensitivity(Dave, dave, DAVE will be the same)
  const duplicate = await UserSchema.findOne({ username }).collation({locale: 'en', strength: 2}).lean().exec();

  //409 means conflict
  if (duplicate) return res.status(409).json({ message: "Username Exist" });

  const hashedpass = await bcrypt.hash(password, 10);

  const result = await UserSchema.create({
    username: username,
    password: hashedpass,
    roles: roles
  });
  console.log(result);
  if (result) {
    //201 is ok plus response
    res
      .status(201)
      .json({ message: `New User ${username} was created successfully` });
  } else {
    res.sendStatus(400).json({ message: "Input Field Required" });
  }
});

/**
 * PUT() endPoint
 * Update user
 */
const updateUser = expressHandler(async (req, res) => {
  const { username, id, password, active, roles } = req.body;
  if (!id || !username || typeof active !== 'boolean'  || !Array.isArray(roles)) {
    return res.status(400).json({ message: "All Fields Are Required" });
  }

  const user = await UserSchema.findById(id).exec();
 
  if (!user) return res.status(400).json({ message: "User Not Found" });

  const duplicate = await UserSchema.findOne({ username }).collation({locale: 'en', strength: 2}).lean().exec();
  if (duplicate && duplicate?._id.toString() !== id) {
    res.status(409).json({message: "Duplicate"})
  }

  user.username = username
  user.roles = roles
  user.active = active
  if(password){
    user.password = await bcrypt.hash(password, 10)
  }

  const result = user.save()
  // console.log(result)
  res.json({message: `${user.username} updated`})
});

/**
 * Delete() endPoint
 * Delete user
 */
const deleteUser = expressHandler(async (req, res) => {
    // const {id} = req.body
    const id = req.params.id;
    // console.log(id)
    if(!id) return res.status(400).json({message:"ID field is empty"})

    //we dnt want to delete user that has an active note
    const notes = await NoteSchema.findOne({user: id}).lean().exec()

    if(notes) return res.status(400).json({message: "User Has Active Notes"})
    // if(notes?.length) return res.status(400).json({message: "User Has Active Notes"})

    const user = await UserSchema.findById(id).exec()

    

    if(!user) return res.status(400).json({message: "User Does not exist"})

    const result = await user.deleteOne()

    const reply = `${result.username} by ID ${result._id} has been successfully deleted`;

    res.json(reply)
});

const getSingUser = expressHandler(async (req, res) => {
    // const {id} = req.body
    const id = req.params.id;
    // console.log(id)
    if(!id) return res.status(400).json({message:"ID field is empty"})

    const user = await UserSchema.findById(id).exec()

    if(!user) return res.status(400).json({message: "User Does not exist"})

    // const result = await user.deleteOne()

    res.json(user)
});



module.exports = { getAllUsers, createUser, updateUser, deleteUser, getSingUser };
