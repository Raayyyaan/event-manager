import JWT from '../utils/jwt.js';

export const loggedIn = (req, res, next) => {
   const token = JWT.getTokenFromRequest(req);

   if (!token) {
      return res.status(401).json({ message: "Non autorisé" });
   }

   const user = JWT.getUserFromToken(token);

   if (!user) {
      return res.status(403).json({ message: "Session expirée ou invalide" });
   }

   req.user = user;
   next();
};