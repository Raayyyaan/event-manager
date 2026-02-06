import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import JWT from '../utils/jwt.js';

export const signup = async (req, res) => {
   const { username, password } = req.body;

   try {
      const userCheck = await db.query('SELECT * FROM users WHERE username = $1', [username]);
      if (userCheck.rows.length > 0) {
         return res.status(400).json({ message: "Cet utilisateur existe déjà" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);


      const newUser = await db.query(
         'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
         [username, hashedPassword]
      );

      res.status(201).json({
         message: "Utilisateur créé avec succès",
         user: newUser.rows[0]
      });

   } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur lors de l'inscription" });
   }
};

export const login = async (req, res) => {
   const { username, password } = req.body;

   try {
      const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);

      if (result.rows.length === 0) {
         return res.status(401).json({ message: 'Invalid credentials' });
      }

      const user = result.rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
         return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = JWT.generateUserToken({
         id: user.id,
         username: user.username
      });

      return res.json({ token });

   } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
   }
};
