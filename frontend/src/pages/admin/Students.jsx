import { useEffect, useState, useRef } from 'react';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import StudentAvatar from '../../components/StudentAvatar';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [classes, setClasses] = useState([]);
  const [parents, setParents] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    class: '',
    parent: '',
    dateOfBirth: '',
    gender: 'male',
    photo: '',
  });
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
    fetchParents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Failed to fetch classes');
    }
  };

  const fetchParents = async () => {
    try {
      const response = await api.get('/parents');
      setParents(response.data);
    } catch (error) {
      console.error('Failed to fetch parents');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent._id}`, formData);
        toast.success('Student updated successfully');
      } else {
        await api.post('/students', formData);
        toast.success('Student created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.user.name,
      email: student.user.email,
      password: '',
      class: student.class._id,
      parent: student.parent?._id || '',
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
      gender: student.gender,
      photo: student.photo || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      class: '',
      parent: '',
      dateOfBirth: '',
      gender: 'male',
      photo: '',
    });
    setEditingStudent(null);
    setPhotoUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, GIF, or WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB.');
      return;
    }
    setPhotoUploading(true);
    try {
      const form = new FormData();
      form.append('photo', file);
      const { data } = await api.post('/students/upload-photo', form, {
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

  const filteredStudents = students.filter((student) =>
    student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Students
            </h1>
            <p className="mt-1 text-sm text-gray-500 sm:text-base">
              Manage all students and their profiles
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <Plus className="h-5 w-5" />
            Add Student
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50/80 px-4 py-3 sm:px-6">
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
              <p className="mt-3 text-sm text-gray-500">Loading students...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 sm:pl-6">Name</th>
                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Email</th>
                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Class</th>
                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Gender</th>
                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 sm:pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-16 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                            <Search className="h-7 w-7 text-gray-400" />
                          </div>
                          <p className="mt-3 text-sm font-medium text-gray-900">No students found</p>
                          <p className="mt-1 text-sm text-gray-500">
                            {students.length === 0
                              ? 'Get started by adding your first student.'
                              : 'Try a different search term.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student._id} className="transition hover:bg-gray-50/80">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                          <div className="flex items-center gap-3">
                            <StudentAvatar student={student} size={40} />
                            <span className="font-medium text-gray-900">{student.user.name}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">{student.user.email}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">{student.class?.name || '—'}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm capitalize text-gray-600">{student.gender}</td>
                        <td className="whitespace-nowrap px-3 py-4 sm:pr-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(student)}
                              className="rounded p-2 text-primary-600 transition hover:bg-primary-50"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(student._id)}
                              className="rounded p-2 text-red-600 transition hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 py-4">
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
              <h2 className="mb-4 text-2xl font-bold">
                {editingStudent ? 'Edit Student' : 'Add Student'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="input"
                  />
                </div>
                {!editingStudent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="input"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    required
                    className="input"
                  >
                    <option value="">Select a class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent</label>
                  <select
                    value={formData.parent}
                    onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                    className="input"
                  >
                    <option value="">Select a parent (optional)</option>
                    {parents.map((parent) => (
                      <option key={parent._id} value={parent._id}>
                        {parent.user.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    required
                    className="input"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photo (optional)</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handlePhotoUpload}
                        disabled={photoUploading}
                        className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
                      />
                      {photoUploading && (
                        <span className="text-sm text-gray-500">Uploading…</span>
                      )}
                    </div>
                    {formData.photo && (
                      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <img
                          src={formData.photo}
                          alt="Preview"
                          className="h-14 w-14 rounded-full object-cover"
                        />
                        <span className="text-sm text-gray-600">Photo added</span>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, photo: '' }))}
                          className="ml-auto rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                          aria-label="Remove photo"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <input
                      type="url"
                      value={formData.photo}
                      onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                      placeholder="Or paste image URL..."
                      className="input text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                    {editingStudent ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminStudents;
