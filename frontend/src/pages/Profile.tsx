import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import '../styles/index.css';
import { Pencil, Trash2, Plus, Search, LayoutDashboard, CalendarDays, Camera, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export const Profile = () => {
    const [user, setUser] = useState<{ username: string; profile_picture?: string } | null>(null);
    const [myEvents, setMyEvents] = useState<any[]>([]);
    const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [imageKey, setImageKey] = useState(0);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/'); return; }

        fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => setUser(data.user))
            .catch(() => {
                localStorage.removeItem('token');
                navigate('/');
            });

        fetch('/api/events/my-events', { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => setMyEvents(data));

        fetch('/api/events/registrations', { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setRegisteredEvents(data);
                else setRegisteredEvents([]);
            })
            .catch(() => setRegisteredEvents([]));
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        toast.success('Déconnexion réussie ! 👋');
        navigate('/');
    };

    const handleDelete = (id: number) => {
        const confirmDelete = () => {
            const token = localStorage.getItem('token');
            fetch(`/api/events/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => {
                if (res.ok) {
                    setMyEvents(myEvents.filter(e => e.id !== id));
                    toast.success("Événement supprimé ! 🗑️");
                } else {
                    toast.error("Erreur lors de la suppression");
                }
            });
        };

        toast((t) => (
            <span>
                Supprimer cet événement ?{' '}
                <button
                    onClick={() => {
                        confirmDelete();
                        toast.dismiss(t.id);
                    }}
                    style={{ marginLeft: '10px', textDecoration: 'underline', color: '#ef4444' }}
                >
                    Oui
                </button>
            </span>
        ));
    };

    const handleUnregister = (id: number) => {
        const token = localStorage.getItem('token');
        fetch(`/api/events/unregister/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => {
            if (res.ok) {
                setRegisteredEvents(registeredEvents.filter(e => e.id !== id));
                toast.success("Désinscription réussie !");
            }
        });
    };

    const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("L'image ne doit pas dépasser 5MB");
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error("Le fichier doit être une image");
            return;
        }

        const formData = new FormData();
        formData.append('profile_picture', file);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch('/api/auth/profile-picture', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                setUser(prev => prev ? { ...prev, profile_picture: data.profile_picture } : null);
                setImageKey(prev => prev + 1);
                toast.success("Photo de profil mise à jour ! 📸");
                setShowImageUpload(false);
            } else {
                toast.error(data.message || "Erreur lors de l'upload");
            }
        } catch (err) {
            toast.error("Erreur réseau");
        }
    };

    if (!user) return <p>Chargement...</p>;

    return (
        <div className="full-page-container">
            <div className="event-list">
                <header className="profile-header">
                    <div className="header-left">
                        <button className="btn-primary" onClick={() => navigate('/create-event')}><Plus size={20} /> Créer</button>
                        <button className="btn-primary" onClick={() => navigate('/discover')} style={{ background: '#6366f1' }}><Search size={20} /> Découvrir</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ position: 'relative' }}>
                            {user.profile_picture ? (
                                <img
                                    key={imageKey}
                                    src={`/uploads/${user.profile_picture}`}
                                    alt="Photo de profil"
                                    className="profile-picture"
                                    onClick={() => setShowImageUpload(true)}
                                />
                            ) : (
                                <div
                                    className="profile-picture-placeholder"
                                    onClick={() => setShowImageUpload(true)}
                                >
                                    <User size={40} />
                                </div>
                            )}
                            <button
                                className="profile-picture-edit"
                                onClick={() => setShowImageUpload(true)}
                            >
                                <Camera size={16} />
                            </button>
                        </div>
                        <h1 style={{ margin: 0 }}>Profil de {user.username}</h1>
                    </div>

                    <div className="header-right">
                        {/* Toggle de thème */}
                        <div className="theme-toggle" onClick={toggleTheme}>
                            <div className="theme-toggle-switch">
                                <div className="theme-toggle-slider">
                                    {theme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
                                </div>
                            </div>
                        </div>

                        <button className="btn-logout" onClick={handleLogout}>Se déconnecter</button>
                    </div>
                </header>

                <div className="profile-grid">
                    <div>
                        <h3 className="section-title">
                            <LayoutDashboard size={22} strokeWidth={2.5} /> Mes Créations
                        </h3>
                        {myEvents.length === 0 ? <p>Aucun événement créé.</p> : (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {myEvents.map(event => (
                                    <li key={event.id} className="event-item">
                                        <div className="event-info">
                                            <strong>{event.title}</strong><br />
                                            <small>{new Date(event.event_date).toLocaleDateString()}</small>
                                        </div>
                                        <div className="event-actions">
                                            <button onClick={() => navigate(`/edit-event/${event.id}`)} className="edit-btn">
                                                <Pencil size={18} color="#94a3b8" />
                                            </button>
                                            <button onClick={() => handleDelete(event.id)} className="btn-logout-icon">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div>
                        <h3 className="section-title">
                            <CalendarDays size={22} strokeWidth={2.5} /> Mes Participations
                        </h3>
                        {registeredEvents.length === 0 ? <p>Aucune inscription.</p> : (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {registeredEvents.map(event => (
                                    <li key={event.id} className="event-item participation">
                                        <div className="event-info">
                                            <strong>{event.title}</strong><br />
                                            <small>Par {event.creator_name} • {new Date(event.event_date).toLocaleDateString()}</small>
                                        </div>
                                        <button onClick={() => handleUnregister(event.id)} className="btn-logout-small">
                                            Quitter
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {showImageUpload && (
                <div className="modal-overlay" onClick={() => setShowImageUpload(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Changer la photo de profil</h2>
                            <button onClick={() => setShowImageUpload(false)} className="modal-close">
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleProfilePictureUpload}
                                style={{ width: '100%' }}
                            />
                            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                                Formats acceptés : JPG, PNG, GIF (max 5MB)
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};