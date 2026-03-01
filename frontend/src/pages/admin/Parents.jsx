import { useEffect, useState } from 'react';
import api from '../../utils/api';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import { Plus, Search, Edit, Trash2, UserCircle } from 'lucide-react';

const AdminParents = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const response = await api.get('/parents');
      setParents(response.data);
    } catch (error) {
      toast.error('Failed to fetch parents');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingParent) {
        await api.put(`/parents/${editingParent._id}`, formData);
        toast.success('Parent updated successfully');
      } else {
        await api.post('/parents', formData);
        toast.success('Parent created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchParents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (parent) => {
    setEditingParent(parent);
    setFormData({
      name: parent.user.name,
      email: parent.user.email,
      password: '',
      phone: parent.phone,
      address: parent.address || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this parent?')) return;
    try {
      await api.delete(`/parents/${id}`);
      toast.success('Parent deleted successfully');
      fetchParents();
    } catch (error) {
      toast.error('Failed to delete parent');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
    });
    setEditingParent(null);
  };

  const filteredParents = parents.filter(
    (parent) =>
      parent.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Parents
            </h1>
            <p className="mt-1 text-sm text-gray-500 sm:text-base">
              Manage parent accounts and contact information
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
            Add Parent
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
              <p className="mt-3 text-sm text-gray-500">Loading parents...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 sm:pl-6">Name</th>
                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Email</th>
                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Phone</th>
                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Address</th>
                    <th className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 sm:pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredParents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-16 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                            <UserCircle className="h-7 w-7 text-gray-400" />
                          </div>
                          <p className="mt-3 text-sm font-medium text-gray-900">No parents found</p>
                          <p className="mt-1 text-sm text-gray-500">
                            {parents.length === 0
                              ? 'Get started by adding your first parent.'
                              : 'Try a different search term.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredParents.map((parent) => (
                      <tr key={parent._id} className="transition hover:bg-gray-50/80">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                          <span className="font-medium text-gray-900">{parent.user.name}</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">{parent.user.email}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">{parent.phone || '—'}</td>
                        <td className="max-w-xs truncate px-3 py-4 text-sm text-gray-600">{parent.address || '—'}</td>
                        <td className="whitespace-nowrap px-3 py-4 sm:pr-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(parent)}
                              className="rounded p-2 text-primary-600 transition hover:bg-primary-50"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(parent._id)}
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
                {editingParent ? 'Edit Parent' : 'Add Parent'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="input w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="input w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                {!editingParent && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="input w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="input w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                    {editingParent ? 'Update' : 'Create'}
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

export default AdminParents;
