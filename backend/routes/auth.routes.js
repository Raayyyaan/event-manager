import express from "express";
import { login, signup } from "../controllers/auth.controller.js";
import { loggedIn } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import pool from '../config/db.js'

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/me", loggedIn, (req, res) => {
    res.json({ user: req.user });
});

router.post("/profile-picture", loggedIn, upload.single('profile_picture'), async (req, res) => {
    try {
        const userId = req.user.id;
        const filename = req.file.filename;

        await pool.query(
            'UPDATE users SET profile_picture = $1 WHERE id = $2',
            [filename, userId]
        );

        res.json({
            message: 'Photo de profil mise à jour',
            profile_picture: filename
        });
    } catch (error) {
        console.error('Erreur upload photo:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

export default router;