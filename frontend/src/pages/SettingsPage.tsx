import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import AppSidebar from '../components/AppSidebar';
import { useBoardsList } from '../hooks/useBoardsList';
import { useInvites } from '../hooks/useInvites';
import { overlayStyle, dialogStyle, dialogButtonsStyle } from '../components/modalStyles';
import InvitesModal from './boards/components/InvitesModal';

function SettingsPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { boards: navBoards } = useBoardsList({ user });
  const {
    invites,
    loading: loadingInvites,
    error: invitesError,
    acceptInvite,
    declineInvite,
  } = useInvites({ user });
  const [showInvitesModal, setShowInvitesModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchMe = async () => {
      try {
        setLoading(true);
        const res = await api.get('/auth/me');
        const u = res.data.user;
        setUser(u);
        setName(u.name || '');
        localStorage.setItem('user', JSON.stringify(u));
      } catch (err: any) {
        console.error('Fetch /auth/me error ====>', err);
        setError('Unable to load profile.');
        if (err?.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      setSaving(true);
      const res = await api.put('/auth/me', { name });
      const u = res.data.user;
      setUser(u);
      localStorage.setItem('user', JSON.stringify(u));
      setMessage('Profile updated.');
    } catch (err) {
      console.error('Update /auth/me error ====>', err);
      setError('Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleAcceptInviteAndOpen = async (inviteId: number) => {
    const acceptedBoardId = await acceptInvite(inviteId);
    if (acceptedBoardId) {
      setShowInvitesModal(false);
      navigate(`/boards/${acceptedBoardId}`);
    }
  };

  if (loading) {
    return <p style={{ padding: 24 }}>Loading...</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="app-shell">
      <AppSidebar
        boards={navBoards}
        activeBoardId={null}
        activeSection="settings"
        userName={user.name}
        userEmail={user.email}
        onHome={() => navigate('/boards')}
        onSelectBoard={(id) => navigate(`/boards/${id}`)}
        onOpenSettings={() => navigate('/settings')}
        onLogout={handleLogout}
        onOpenInvites={() => setShowInvitesModal(true)}
        invitesCount={invites.length}
      />
      <div className="app-main">
        <div className="boards-page">
          <header className="boards-header">
            <div>
              <h1 className="boards-title">Account settings</h1>
              <p className="boards-user">Signed in as {user.email}</p>
            </div>
          </header>

          <section className="card" style={{ maxWidth: 520 }}>
            <h2 style={{ marginTop: 0, fontSize: 18 }}>Profile</h2>
            <p className="text-muted" style={{ marginBottom: 12 }}>
              Update the name displayed in the app.
            </p>

            <form
              onSubmit={handleSave}
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              <label style={{ fontSize: 13 }}>
                Email address
                <input
                  className="input"
                  type="email"
                  value={user.email}
                  disabled
                  style={{ marginTop: 4, opacity: 0.8, cursor: 'not-allowed' }}
                />
              </label>

              <label style={{ fontSize: 13 }}>
                Display name
                <input
                  className="input"
                  type="text"
                  placeholder="Your name or nickname"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ marginTop: 4 }}
                />
              </label>

              {error && <div className="text-error">{error}</div>}
              {message && (
                <div
                  style={{
                    fontSize: 13,
                    color: '#bbf7d0',
                    marginTop: 2,
                  }}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="button button-primary"
                disabled={saving}
                style={{ marginTop: 6 }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </form>

            <p className="text-muted" style={{ marginTop: 16, fontSize: 12 }}>
              Account created on{' '}
              {new Date(user.createdAt).toLocaleString('en-US', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            </p>
          </section>

          <InvitesModal
            open={showInvitesModal}
            invites={invites}
            loading={loadingInvites}
            error={invitesError}
            onAccept={handleAcceptInviteAndOpen}
            onDecline={declineInvite}
            onClose={() => setShowInvitesModal(false)}
            overlayStyle={overlayStyle}
            dialogStyle={dialogStyle}
            dialogButtonsStyle={dialogButtonsStyle}
          />
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
