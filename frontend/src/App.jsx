import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Loading your notes...');

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/notes`);
      if (!response.ok) throw new Error('Unable to load notes');
      const data = await response.json();
      setNotes(Array.isArray(data) ? data : []);
      setStatus(data.length ? 'Notes synced from your API.' : 'No notes yet — create the first one.');
    } catch (error) {
      setStatus('Could not connect to the API. Start the backend on port 8000, then refresh.');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const totalWords = useMemo(() => {
    return notes.reduce((sum, note) => sum + (note.content?.split(/\s+/).filter(Boolean).length || 0), 0);
  }, [notes]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      setStatus('Title and note content are both required.');
      return;
    }

    try {
      const payload = { title: trimmedTitle, content: trimmedContent };

      if (editingId) {
        const response = await fetch(`${API_BASE_URL}/notes/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Update failed');
        setStatus('Note updated successfully.');
      } else {
        const response = await fetch(`${API_BASE_URL}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Create failed');
        setStatus('Note created successfully.');
      }

      setTitle('');
      setContent('');
      setEditingId(null);
      await loadNotes();
    } catch (error) {
      setStatus('The note could not be saved. Check the backend connection and try again.');
    }
  };

  const beginEdit = (note) => {
    setEditingId(note._id);
    setTitle(note.title || '');
    setContent(note.content || '');
    setStatus('Editing note…');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/notes/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      setStatus('Note deleted.');
      await loadNotes();
    } catch (error) {
      setStatus('The note could not be deleted.');
    }
  };

  return (
    <main className="app-shell">
      <section className="hero-card glass-card">
        <div>
          <p className="eyebrow">Notes App</p>
          <h1>Capture ideas, keep your notes tidy, and sync them with your API.</h1>
          <p className="lede">
            This React interface connects directly to the FastAPI notes backend and gives you a faster, cleaner way to create and manage notes.
          </p>
        </div>
        <div className="badge-grid">
          <article className="badge-card">
            <span>Total notes</span>
            <strong>{notes.length}</strong>
          </article>
          <article className="badge-card">
            <span>Words stored</span>
            <strong>{totalWords}</strong>
          </article>
          <article className="badge-card">
            <span>API base</span>
            <strong>{API_BASE_URL}</strong>
          </article>
        </div>
      </section>

      <section className="content-grid">
        <article className="glass-card composer-card">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Compose</p>
              <h2>{editingId ? 'Update your note' : 'Create a fresh note'}</h2>
            </div>
            {editingId ? (
              <button className="ghost-button" onClick={() => { setEditingId(null); setTitle(''); setContent(''); setStatus('New note form ready.'); }}>
                Cancel edit
              </button>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} className="composer-form">
            <label>
              Title
              <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="A quick title" />
            </label>
            <label>
              Note
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={6}
                placeholder="Write your notes here..."
              />
            </label>
            <div className="form-actions">
              <button className="primary-button" type="submit">{editingId ? 'Save changes' : 'Add note'}</button>
              <button className="secondary-button" type="button" onClick={() => { setTitle(''); setContent(''); setEditingId(null); }}>
                Clear
              </button>
            </div>
          </form>

          <p className="status-pill">{status}</p>
        </article>

        <article className="glass-card notes-card">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Library</p>
              <h2>Your notes</h2>
            </div>
            <span className="mini-chip">Live</span>
          </div>

          {loading ? (
            <div className="empty-state">Loading notes…</div>
          ) : notes.length === 0 ? (
            <div className="empty-state">No notes found yet. Start by writing one on the left.</div>
          ) : (
            <div className="note-list">
              {notes.map((note) => (
                <article key={note._id} className="note-card">
                  <div>
                    <p className="note-title">{note.title || 'Untitled note'}</p>
                    <p className="note-body">{note.content || 'No description added yet.'}</p>
                  </div>
                  <div className="note-actions">
                    <button className="ghost-button" onClick={() => beginEdit(note)}>Edit</button>
                    <button className="danger-button" onClick={() => handleDelete(note._id)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  );
}
