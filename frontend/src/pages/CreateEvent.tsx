import '../styles/index.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Send, X, Image as ImageIcon } from 'lucide-react';

export const CreateEvent = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_date: '',
        max_participants: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Obtenir la date/heure actuelle au format datetime-local
    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Vérifier la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("L'image ne doit pas dépasser 5MB");
            return;
        }

        // Vérifier le type
        if (!file.type.startsWith('image/')) {
            toast.error("Le fichier doit être une image");
            return;
        }

        setImageFile(file);

        // Créer un aperçu
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Vérification supplémentaire côté client
        const selectedDate = new Date(formData.event_date);
        const now = new Date();

        if (selectedDate < now) {
            toast.error("Impossible de créer un événement dans le passé ! ⏰");
            return;
        }

        const token = localStorage.getItem('token');

        // Créer un FormData pour envoyer les données + l'image
        const submitData = new FormData();
        submitData.append('title', formData.title);
        submitData.append('description', formData.description);
        submitData.append('event_date', formData.event_date);
        submitData.append('max_participants', formData.max_participants);

        if (imageFile) {
            submitData.append('event_image', imageFile);
        }

        const res = await fetch('/api/events', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // Ne PAS mettre 'Content-Type' pour FormData, le navigateur le fera automatiquement
            },
            body: submitData
        });

        const data = await res.json();

        if (res.ok) {
            toast.success("Événement créé avec succès ! 🚀");
            navigate('/profile');
        } else {
            toast.error(data.message || "Erreur lors de la création");
        }
    };

    return (
        <div className="card">
            <h1>Créer un événement</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text" placeholder="Titre" required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
                <textarea
                    placeholder="Description"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
                <input
                    type="datetime-local"
                    required
                    min={getMinDateTime()}
                    value={formData.event_date}
                    onChange={e => setFormData({ ...formData, event_date: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Nombre de places maximum"
                    required
                    min="1"
                    value={formData.max_participants}
                    onChange={e => {
                        const val = parseInt(e.target.value);
                        if (val > 0 || e.target.value === '') {
                            setFormData({ ...formData, max_participants: e.target.value });
                        }
                    }}
                />

                {/* Upload d'image */}
                <div className="image-upload-container">
                    {imagePreview ? (
                        <div className="image-preview">
                            <img src={imagePreview} alt="Aperçu" />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="image-remove-btn"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    ) : (
                        <label className="image-upload-label">
                            <ImageIcon size={24} />
                            <span>Ajouter une image (optionnel)</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                        </label>
                    )}
                </div>

                <div className="form-actions">
                    <button type="submit" className="create-event-btn">
                        <Send size={18} strokeWidth={2.5} />
                        Lancer l'événement
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/profile')}
                        className="cancel-btn"
                    >
                        <X size={18} strokeWidth={2.5} />
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
};