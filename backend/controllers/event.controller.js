import db from '../config/db.js';

export const createEvent = async (req, res) => {
    const { title, description, event_date, max_participants } = req.body;
    const creator_id = req.user.id;

    try {
        const newEvent = await db.query(
            'INSERT INTO events (title, description, event_date, max_participants, creator_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, description, event_date, max_participants, creator_id]
        );
        res.status(201).json(newEvent.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la création de l'événement" });
    }
};

export const getMyEvents = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM events WHERE creator_id = $1 ORDER BY event_date ASC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la récupération des événements" });
    }
};


export const deleteEvent = async (req, res) => {
    const { id } = req.params;
    const creator_id = req.user.id;

    try {
        const result = await db.query(
            'DELETE FROM events WHERE id = $1 AND creator_id = $2',
            [id, creator_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Événement non trouvé ou non autorisé" });
        }

        res.json({ message: "Événement supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression" });
    }
};

export const getEventById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM events WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Événement non trouvé" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
};

export const updateEvent = async (req, res) => {
    const { id } = req.params;
    const { title, description, event_date, max_participants } = req.body;
    const creator_id = req.user.id;

    try {
        const result = await db.query(
            'UPDATE events SET title = $1, description = $2, event_date = $3, max_participants = $4 WHERE id = $5 AND creator_id = $6 RETURNING *',
            [title, description, event_date, max_participants, id, creator_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Événement non trouvé ou non autorisé" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la modification" });
    }
};

export const getAllEvents = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT e.*, u.username as creator_name,
            (SELECT COUNT(*) FROM registrations WHERE event_id = e.id) as current_participants
            FROM events e
            JOIN users u ON e.creator_id = u.id
            ORDER BY e.event_date ASC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Erreur de récupération" });
    }
};

export const registerForEvent = async (req, res) => {
    const { event_id } = req.body;
    const user_id = req.user.id;

    try {
        const eventRes = await db.query('SELECT * FROM events WHERE id = $1', [event_id]);
        if (eventRes.rows.length === 0) return res.status(404).json({ message: "Événement introuvable" });

        const event = eventRes.rows[0];
        const countRes = await db.query('SELECT COUNT(*) FROM registrations WHERE event_id = $1', [event_id]);

        if (parseInt(countRes.rows[0].count) >= event.max_participants) {
            return res.status(400).json({ message: "Cet événement est complet !" });
        }

        await db.query('INSERT INTO registrations (user_id, event_id) VALUES ($1, $2)', [user_id, event_id]);
        res.status(201).json({ message: "Inscription réussie !" });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ message: "Vous êtes déjà inscrit à cet événement" });
        }
        res.status(500).json({ message: "Erreur lors de l'inscription" });
    }
};

export const getRegisteredEvents = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT e.*, u.username as creator_name 
            FROM events e
            JOIN registrations r ON e.id = r.event_id
            LEFT JOIN users u ON e.creator_id = u.id
            WHERE r.user_id = $1
        `, [req.user.id]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Erreur de récupération des inscriptions" });
    }
};

export const unregisterFromEvent = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM registrations WHERE user_id = $1 AND event_id = $2', [req.user.id, id]);
        res.json({ message: "Désinscription réussie" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la désinscription" });
    }
};