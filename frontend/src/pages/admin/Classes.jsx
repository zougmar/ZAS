import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import { Plus, Search, Edit, Trash2, School } from 'lucide-react';

const AdminClasses = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    level: 'primary',
    capacity: 30,
    classTeacher: '',
  });

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data);
    } catch (error) {
      toast.error('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/teachers');
      setTeachers(response.data);
    } catch (error) {
      console.error('Failed to fetch teachers');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await api.put(`/classes/${editingClass._id}`, formData);
        toast.success('Class updated successfully');
      } else {
        await api.post('/classes', formData);
        toast.success('Class created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchClasses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name,
      level: classItem.level,
      capacity: classItem.capacity,
      classTeacher: classItem.classTeacher?._id || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      await api.delete(`/classes/${id}`);
      toast.success('Class deleted successfully');
      fetchClasses();
    } catch (error) {
      toast.error('Failed to delete class');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      level: 'primary',
      capacity: 30,
      classTeacher: '',
    });
    setEditingClass(null);
  };

  const filteredClasses = classes.filter((classItem) =>
    classItem.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Classes
            </h1>
            <p className="mt-1 text-sm text-gray-500 sm:text-base">
              Manage classes, levels, and class teachers
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
            Add Class
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50/80 px-4 py-3 sm:px-6">
            <div className="relative max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
              <p className="mt-3 text-sm text-gray-500">Loading classes...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 sm:pl-6">Name</th>
                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Level</th>
                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Capacity</th>
                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Class Teacher</th>
                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 sm:pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredClasses.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-16 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                            <School className="h-7 w-7 text-gray-400" />
                          </div>
                          <p className="mt-3 text-sm font-medium text-gray-900">No classes found</p>
                          <p className="mt-1 text-sm text-gray-500">
                            {classes.length === 0
                              ? 'Get started by adding your first class.'
                              : 'Try a different search term.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredClasses.map((classItem) => (
                      <tr key={classItem._id} className="transition hover:bg-gray-50/80">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                          <span className="font-medium text-gray-900">{classItem.name}</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm capitalize text-gray-600">{classItem.level}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">{classItem.capacity}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">{classItem.classTeacher?.user?.name || '—'}</td>
                        <td className="whitespace-nowrap px-3 py-4 sm:pr-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(classItem)}
                              className="rounded p-2 text-primary-600 transition hover:bg-primary-50"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(classItem._id)}
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

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 py-4">
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                {editingClass ? 'Edit Class' : 'Add Class'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g., Grade 1A"
                    className="input w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    required
                    className="input w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    required
                    min={1}
                    className="input w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Class Teacher</label>
                  <select
                    value={formData.classTeacher}
                    onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
                    className="input w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="">Select a teacher (optional)</option>
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.user.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                    {editingClass ? 'Update' : 'Create'}
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

export default AdminClasses;
