import { useEffect, useState, useRef } from 'react';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import { User, Mail, Phone, BookOpen, Edit2, X, Check, ImageIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const TeacherProfile = () => {
  const { fetchCurrentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    photo: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/teachers/me');
      setProfile(response.data);
      setFormData({
        name: response.data.user?.name || '',
        email: response.data.user?.email || '',
        password: '',
        phone: response.data.phone || '',
        specialization: response.data.specialization || '',
        photo: response.data.photo || '',
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/teachers/${profile._id}`, formData);
      toast.success('Profile updated successfully');
      setEditing(false);
      setFormData((prev) => ({ ...prev, password: '' }));
      fetchProfile();
      fetchCurrentUser();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, GIF, or WebP).');
      return;
    }
    setPhotoUploading(true);
    try {
      const form = new FormData();
      form.append('photo', file);
      const { data } = await api.post('/teachers/upload-photo', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData((prev) => ({ ...prev, photo: data.url }));
      toast.success('Photo uploaded');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Photo upload failed');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.user?.name || '',
      email: profile?.user?.email || '',
      password: '',
      phone: profile?.phone || '',
      specialization: profile?.specialization || '',
      photo: profile?.photo || '',
    });
    setEditing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const displayPhoto = editing ? formData.photo : profile?.photo;
  const photoUrl = displayPhoto?.startsWith('http')
    ? displayPhoto
    : displayPhoto
      ? `${window.location.origin}${displayPhoto.startsWith('/') ? '' : '/'}${displayPhoto}`
      : null;

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
          <p className="mt-3 text-sm text-gray-500">Loading profile...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-gray-500 sm:text-base">
            Manage your account and professional details
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50/80 px-6 py-6">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-2xl font-semibold text-primary-700">
                  {photoUrl ? (
                    <img src={photoUrl} alt={profile?.user?.name} className="h-full w-full object-cover" />
                  ) : (
                    profile?.user?.name?.charAt(0).toUpperCase() || 'T'
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{profile?.user?.name}</h2>
                  <p className="text-sm text-gray-500">Teacher · {profile?.specialization || '—'}</p>
                </div>
              </div>
              {!editing ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="teacher-profile-form"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
                  >
                    <Check className="h-4 w-4" />
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {editing ? (
              <form id="teacher-profile-form" onSubmit={handleSubmit} className="max-w-md space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    <ImageIcon className="inline h-4 w-4 mr-1" />
                    Profile photo
                  </label>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
                        {formData.photo ? (
                          <img
                            src={formData.photo.startsWith('http') ? formData.photo : `${window.location.origin}${formData.photo.startsWith('/') ? '' : '/'}${formData.photo}`}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-semibold text-gray-500">
                            {formData.name?.charAt(0).toUpperCase() || 'T'}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          onChange={handlePhotoUpload}
                          disabled={photoUploading}
                          className="block w-full text-sm text-gray-500 file:mr-2 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-700"
                        />
                        <p className="text-xs text-gray-500">Or paste image URL:</p>
                        <input
                          type="text"
                          value={formData.photo}
                          onChange={(e) => setFormData({ ...formData, photo: e.target.value.trim() })}
                          placeholder="https://example.com/photo.jpg"
                          className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                        />
                        {photoUploading && <p className="text-xs text-gray-500">Uploading…</p>}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Name</label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">New password (leave blank to keep)</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-4 pr-4 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Phone</label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Specialization</label>
                  <div className="relative">
                    <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      placeholder="e.g. Mathematics, Science"
                      className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>
              </form>
            ) : (
              <dl className="grid gap-4 sm:grid-cols-1">
                <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Name</dt>
                    <dd className="mt-0.5 font-medium text-gray-900">{profile?.user?.name}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Email</dt>
                    <dd className="mt-0.5 font-medium text-gray-900">{profile?.user?.email}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Phone</dt>
                    <dd className="mt-0.5 font-medium text-gray-900">{profile?.phone || '—'}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3">
                  <BookOpen className="h-5 w-5 text-gray-400" />
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">Specialization</dt>
                    <dd className="mt-0.5 font-medium text-gray-900">{profile?.specialization || '—'}</dd>
                  </div>
                </div>
              </dl>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherProfile;
