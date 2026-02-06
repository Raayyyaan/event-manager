import express from "express";
import { createEvent, getMyEvents, deleteEvent, updateEvent, getEventById, getAllEvents, registerForEvent, getRegisteredEvents, unregisterFromEvent } from "../controllers/event.controller.js";
import { loggedIn } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

router.post("/", loggedIn, upload.single('event_image'), createEvent);

router.get("/my-events", loggedIn, getMyEvents);
router.get("/registrations", loggedIn, getRegisteredEvents);
router.post("/register", loggedIn, registerForEvent);
router.delete("/unregister/:id", loggedIn, unregisterFromEvent);
router.get("/", loggedIn, getAllEvents);
router.get("/:id", loggedIn, getEventById);

router.put("/:id", loggedIn, upload.single('event_image'), updateEvent);

router.delete("/:id", loggedIn, deleteEvent);

export default router;