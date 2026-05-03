import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile, changePassword } from '../api/user.service';
import { useToast, ToastContainer } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Lock } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    getProfile()
      .then(data => {
        setProfile(data);
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
      })
      .catch(() => addToast('Failed to load profile.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await updateProfile({ firstName, lastName });
      setProfile(updated);
      addToast('Profile updated successfully.', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      addToast('Password changed successfully.', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container container animate-fade-in">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="catalog-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">{profile?.email}</p>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>
          <User size={16} /> Personal Info
        </button>
        <button className={`admin-tab ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}>
          <Lock size={16} /> Change Password
        </button>
      </div>

      {tab === 'info' && (
        <form className="profile-form glass-panel" onSubmit={handleProfileSave}>
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input className="form-control" value={firstName} onChange={e => setFirstName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input className="form-control" value={lastName} onChange={e => setLastName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-control" value={profile?.email} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <input className="form-control" value={profile?.role} disabled />
          </div>
          <button type="submit" className="btn btn-primary" disabled={savingProfile}>
            {savingProfile ? <div className="spinner" /> : 'Save Changes'}
          </button>
        </form>
      )}

      {tab === 'password' && (
        <form className="profile-form glass-panel" onSubmit={handlePasswordChange}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input type="password" className="form-control" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={savingPassword}>
            {savingPassword ? <div className="spinner" /> : 'Change Password'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Profile;
