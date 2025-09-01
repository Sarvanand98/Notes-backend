import Note from "../models/Note.js";
import User from "../models/User.js";

export default {
    createNote: async (req, res) => {
        try {
            const { content } = req.body;
            const userId = req.user._id;
            const note = await Note.create({ content, user: userId });
            res.status(201).json(note);
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error!" });
        } 
    },
    getNotes: async (req, res) => {
        try {
            const userId = req.user._id;
            const notes = await Note.find({ user: userId });
            res.status(200).json(notes);
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error!" });
        }
    },
    deleteNote: async (req, res) => {
        try {
            const noteId = req.params.id;
            await Note.deleteOne({ _id: noteId, user: req.user._id });
            res.status(200).json({ message: "Note deleted" });
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error!" });
        }
    },
     getUserInfo: async (req, res) => { 
        try {
            const userId = req.user._id;
            const user = await User.findById(userId).select("name email");
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error!" });
        }
        
    }
}