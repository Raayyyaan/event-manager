import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
      .then(async (res) => {
        const data = await res.json();

        if (res.ok) {
          if (!isSignup) {
            localStorage.setItem('token', data.token);
            toast.success("Heureux de vous revoir ! 👋");
            navigate('/profile');
          } else {
            toast.success('Inscription réussie, connectez-vous !');
            setIsSignup(false);
          }
        } else {
          toast.error(data.message || 'Identifiants incorrects');
        }
      })
      .catch(() => toast.error('Erreur réseau / Serveur non atteint'));
  };

  return (
    <div className="card">
      <h1>{isSignup ? 'Créer un compte' : 'Connexion'}</h1>
      <form onSubmit={onSubmit} className="login-form">
        <input type="text" placeholder="Username" name="username" required />
        <input type="password" placeholder="Password" name="password" required />
        <button type="submit" className="btn-primary" style={{ width: '100%' }}>
          {isSignup ? "S'inscrire" : 'Se connecter'}
        </button>
      </form>
      <p style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
        {isSignup ? "Déjà un compte ?" : "Pas encore de compte ?"}
        <button type="button" onClick={() => setIsSignup(!isSignup)} className="link-btn">
          {isSignup ? 'Se connecter' : "S'inscrire"}
        </button>
      </p>
    </div>
  );

};