import express from "express";
import noteController from "../controllers/note.controller.js";
import { authenticate } from "../libs/middleware.protected.js";

const router = express.Router();
router.use(authenticate)

router.post("/", noteController.createNote);
router.get("/", noteController.getNotes);
router.get("/getUserInfo", noteController.getUserInfo);
router.delete("/:id", noteController.deleteNote);


export default router;