'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { api } from '../../../services/api';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';

export default function CMSCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);

  const [name, setName] = useState('');
  const [type, setType] = useState('quran');
  const [description, setDescription] = useState('');
  const [subtopicsText, setSubtopicsText] = useState('');

  const fetchCats = async () => {
    try {
      const res = await api.getCategories();
      if (res.success) setCategories(res.categories);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const openCreateModal = () => {
    setEditCat(null);
    setName('');
    setType('quran');
    setDescription('');
    setSubtopicsText('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditCat(cat);
    setName(cat.name);
    setType(cat.type || 'quran');
    setDescription(cat.description || '');
    setSubtopicsText(cat.subtopics ? cat.subtopics.join(', ') : '');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const subtopics = subtopicsText.split(',').map(s => s.trim()).filter(Boolean);

    try {
      if (editCat) {
        await api.updateCategory(editCat._id, {
          name,
          type,
          description,
          subtopics
        });
      } else {
        await api.createCategory({
          name,
          type,
          description,
          subtopics
        });
      }
      setIsModalOpen(false);
      fetchCats();
    } catch (err) {
      alert(err.message || 'Error saving category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.deleteCategory(id);
      fetchCats();
    } catch (err) {
      alert(err.message || 'Error deleting category');
    }
  };

  if (loading) return <LoadingSpinner text="Loading CMS Categories..." />;

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <AdminSidebar />

          <main className="flex-1 space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-900">CMS - Categories & Subjects</h1>
                <p className="text-xs text-slate-500">
                  Manage Quranic and Academic programs without touching backend code.
                </p>
              </div>

              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Subject Name</th>
                    <th className="p-4">Discipline Type</th>
                    <th className="p-4">Subtopics</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{cat.name}</p>
                        <p className="text-slate-400 text-[11px]">{cat.description}</p>
                      </td>
                      <td className="p-4">
                        <span className="capitalize px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-slate-700">
                          {cat.type === 'quran' ? 'Quran Studies' : 'Academic'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {cat.subtopics?.slice(0, 3).join(', ')}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </main>

        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900">
              {editCat ? 'Edit Category' : 'Create New Category'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tajweed al-Quran"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-800 outline-none"
                >
                  <option value="quran">Quran & Islamic Studies</option>
                  <option value="academic">Academic Tutoring</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Brief summary of syllabus..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subtopics (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Makharij, Sifaat, Waqf Rules"
                  value={subtopicsText}
                  onChange={(e) => setSubtopicsText(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-800 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#b85d34] hover:bg-[#9e4e2a] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

