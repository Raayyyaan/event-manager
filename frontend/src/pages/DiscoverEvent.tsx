import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Pencil, ArrowLeft, Check, Info, X } from 'lucide-react';

export const DiscoverEvents = () => {
    const [events, setEvents] = useState<any[]>([]);
    const [registeredEventIds, setRegisteredEventIds] = useState<number[]>([]);
    const [userId, setUserId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [hideFull, setHideFull] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            const token = localStorage.getItem('token');
            if (!token) { navigate('/'); return; }

            try {
                const userRes = await fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
                const userData = await userRes.json();
                setUserId(userData.user.id);

                const eventsRes = await fetch('/api/events', { headers: { 'Authorization': `Bearer ${token}` } });
                const eventsData = await eventsRes.json();
                setEvents(eventsData);

                const registrationsRes = await fetch('/api/events/registrations', { headers: { 'Authorization': `Bearer ${token}` } });
                const registrationsData = await registrationsRes.json();

                if (Array.isArray(registrationsData)) {
                    const ids = registrationsData.map((event: any) => event.id);
                    setRegisteredEventIds(ids);
                }
            } catch (err) {
                console.error("Erreur de chargement :", err);
            }
        };
        loadData();
    }, [navigate]);

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = hideFull ? event.current_participants < event.max_participants : true;
        return matchesSearch && matchesStatus;
    });

    const handleRegister = async (eventId: number) => {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/events/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ event_id: eventId })
        });
        const data = await res.json();
        if (res.ok) {
            toast.success(data.message);
            const eventsRes = await fetch('/api/events', { headers: { 'Authorization': `Bearer ${token}` } });
            setEvents(await eventsRes.json());

            const registrationsRes = await fetch('/api/events/registrations', { headers: { 'Authorization': `Bearer ${token}` } });
            const registrationsData = await registrationsRes.json();
            if (Array.isArray(registrationsData)) {
                const ids = registrationsData.map((event: any) => event.id);
                setRegisteredEventIds(ids);
            }
        } else {
            toast.error(data.message);
        }
    };

    const handleUnregister = async (eventId: number) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/events/unregister/${eventId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            toast.success("Désinscription réussie !");
            setRegisteredEventIds(registeredEventIds.filter(id => id !== eventId));

            const eventsRes = await fetch('/api/events', { headers: { 'Authorization': `Bearer ${token}` } });
            setEvents(await eventsRes.json());
        } else {
            toast.error("Erreur lors de la désinscription");
        }
    };

    const isRegistered = (eventId: number) => registeredEventIds.includes(eventId);

    return (
        <div className="full-page-container">
            <div className="event-list">
                <div className="profile-header">
                    <button
                        onClick={() => navigate('/profile')}
                        className="create-event-btn"
                        style={{ backgroundColor: '#6366f1', marginBottom: '1rem' }}
                    >
                        <ArrowLeft size={18} strokeWidth={2.5} />
                        Retour au profil
                    </button>
                    <h1>Découvrir des événements</h1>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Rechercher un événement..."
                        style={{ flex: 1, minWidth: '250px', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: 'white' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={hideFull}
                            onChange={(e) => setHideFull(e.target.checked)}
                        />
                        Masquer les événements complets
                    </label>
                </div>

                <div>
                    {filteredEvents.length === 0 ? (
                        <p style={{ textAlign: 'center', marginTop: '2rem', color: '#94a3b8' }}>Aucun événement ne correspond à votre recherche.</p>
                    ) : (
                        filteredEvents.map(event => {
                            const userIsRegistered = isRegistered(event.id);
                            const isFull = event.current_participants >= event.max_participants;
                            const isCreator = event.creator_id === userId;

                            return (
                                <div key={event.id} className="event-item">
                                    <div style={{ flex: 1 }}>
                                        <strong>{event.title}</strong> par <em>{event.creator_name}</em><br />
                                        <small>
                                            {new Date(event.event_date).toLocaleDateString()} - {event.current_participants}/{event.max_participants} inscrits
                                            {userIsRegistered && !isCreator && (
                                                <span style={{
                                                    marginLeft: '0.75rem',
                                                    color: '#10b981',
                                                    fontWeight: '600',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem'
                                                }}>
                                                    <Check size={16} strokeWidth={2.5} />
                                                    Inscrit
                                                </span>
                                            )}
                                        </small>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <button
                                            onClick={() => setSelectedEvent(event)}
                                            className="edit-btn"
                                            title="Voir les détails"
                                        >
                                            <Info size={18} color="#94a3b8" />
                                        </button>
                                        {isCreator ? (
                                            <button onClick={() => navigate(`/edit-event/${event.id}`)} className="edit-btn">
                                                <Pencil size={18} color="#94a3b8" />
                                            </button>
                                        ) : userIsRegistered ? (
                                            <button
                                                onClick={() => handleUnregister(event.id)}
                                                className="create-event-btn"
                                                style={{
                                                    backgroundColor: '#ef4444',
                                                    width: 'fit-content'
                                                }}
                                            >
                                                Se désinscrire
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleRegister(event.id)}
                                                className="create-event-btn"
                                                style={{
                                                    backgroundColor: isFull ? '#475569' : '#10b981',
                                                    width: 'fit-content'
                                                }}
                                                disabled={isFull}
                                            >
                                                {isFull ? 'Complet' : "S'inscrire"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            {selectedEvent && (
                <div
                    className="modal-overlay"
                    onClick={() => setSelectedEvent(null)}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>{selectedEvent.title}</h2>
                            <button
                                onClick={() => setSelectedEvent(null)}
                                className="modal-close"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {/* Image de l'événement */}
                            {selectedEvent.event_image && (
                                <img
                                    src={`/uploads/${selectedEvent.event_image}`}
                                    alt={selectedEvent.title}
                                    className="modal-event-image"
                                />
                            )}

                            <div className="modal-info">
                                <p><strong>Organisateur :</strong> {selectedEvent.creator_name}</p>
                                <p><strong>Date :</strong> {new Date(selectedEvent.event_date).toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}</p>
                                <p><strong>Participants :</strong> {selectedEvent.current_participants}/{selectedEvent.max_participants}</p>
                            </div>
                            <div className="modal-description">
                                <h3>Description</h3>
                                <p>{selectedEvent.description || "Aucune description disponible."}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};