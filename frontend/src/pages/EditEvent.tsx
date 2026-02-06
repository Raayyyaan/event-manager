import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { X, Image as ImageIcon } from 'lucide-react';

export const EditEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_date: '',
        max_participants: '',
        event_image: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Obtenir la date/heure actuelle au format datetime-local
    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch(`/api/events/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                const date = new Date(data.event_date).toISOString().slice(0, 16);
                setFormData({ ...data, event_date: date });
                if (data.event_image) {
                    setImagePreview(`/uploads/${data.event_image}`);
                }
            })
            .catch(err => console.error(err));
    }, [id]);

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
        setFormData({ ...formData, event_image: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Vérification supplémentaire côté client
        const selectedDate = new Date(formData.event_date);
        const now = new Date();

        if (selectedDate < now) {
            toast.error("Impossible de programmer un événement dans le passé ! ⏰");
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
        } else if (formData.event_image === '' && !imagePreview) {
            // Image supprimée
            submitData.append('remove_image', 'true');
        }

        const res = await fetch(`/api/events/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: submitData
        });

        if (res.ok) {
            toast.success("Modifications enregistrées ! ✨");
            navigate('/profile');
        } else {
            const data = await res.json();
            toast.error(data.message || "Erreur lors de la modification");
        }
    };

    return (
        <div className="card">
            <h1>Modifier l'événement</h1>
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
                    placeholder="Places max"
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
                            <span>Changer l'image (optionnel)</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                        </label>
                    )}
                </div>

                <button type="submit" className="create-event-btn">Enregistrer les modifications</button>
                <button type="button" onClick={() => navigate('/profile')} style={{ marginTop: '10px', backgroundColor: '#6b7280' }}>Annuler</button>
            </form>
        </div>
    );
};