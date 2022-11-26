const UserSchema = require("../models/User");
const NoteSchema = require("../models/Note");
const bcrypt = require("bcrypt");
const expressHandler = require("express-async-handler");

const getAllNotes = expressHandler( async (req,res) => {
    const Notes = await NoteSchema.find().lean()

    if(!Notes?.length) return res.status(400).json({message: 'Empty Notes Collection'})

    //we want to return notes with username
    const notesCollection = await Promise.all(Notes.map(async(notes) => {
        const user = await UserSchema.findById(notes.user).lean().exec()
        return {...notes, username: user.username}
    }))

    res.json(notesCollection)
})

const createNotes = expressHandler(async (req,res) => {
    const {user, title, text} = req.body

    if(!user || !title || !text) return res.status(400).json({message: 'All Input Fields required'})

    //duplicate check
    const duplicate = await NoteSchema.findOne({title}).collation({locale: 'en', strength: 2}).lean().exec()

    if(duplicate){
        return res.status(409).json({message: 'Notes with same title exist'})
    }

    const note = await NoteSchema.create({user,title, text})

    if(note){
        return res.status(201).json({message: 'New Note Created'})
    }else{
        return res.status(400).json({message: 'Error Occurred'})
    }
});


const updateNote = expressHandler(async (req,res) => {
    const { id, user, title, text, completed } = req.body
    // console.log(typeof completed)

    // Confirm data
    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Confirm note exists to update
    const note = await NoteSchema.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    // Check for duplicate title
    const duplicate = await NoteSchema.findOne({ title }).collation({locale: 'en', strength: 2}).lean().exec()

    // Allow renaming of the original note 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    const updatedNote = await note.save()

    res.json(`'${updatedNote.title}' updated`)
})


const deleteNote = expressHandler(async (req, res) => {
    const id = req.params.id

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Note ID required' })
    }

    // Confirm note exists to delete 
    const note = await NoteSchema.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    const result = await note.deleteOne()

    const reply = `Note '${result.title}' with ID ${result._id} deleted`

    res.json(reply)
})


const getSingleNote = expressHandler(async (req, res) => {
    // const {id} = req.body
    const id = req.params.id;
    // console.log(id)
    if(!id) return res.status(400).json({message:"ID field is empty"})

    const note = await NoteSchema.findById(id).exec()

    if(!note) return res.status(400).json({message: "User Does not exist"})

    // const result = await user.deleteOne()

    res.json(note)
});

module.exports = {
    getAllNotes,
    createNotes,
    updateNote,
    deleteNote,
    getSingleNote
}