'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { api } from '../../../services/api';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';

export default function CMSLocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editLoc, setEditLoc] = useState(null);

  const [name, setName] = useState('');
  const [province, setProvince] = useState('Punjab');
  const [isMajorCity, setIsMajorCity] = useState(false);

  const fetchLocations = async () => {
    try {
      const res = await api.getLocations();
      if (res.success) setLocations(res.locations);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const openCreateModal = () => {
    setEditLoc(null);
    setName('');
    setProvince('Punjab');
    setIsMajorCity(false);
    setIsModalOpen(true);
  };

  const openEditModal = (loc) => {
    setEditLoc(loc);
    setName(loc.name);
    setProvince(loc.province);
    setIsMajorCity(loc.isMajorCity || false);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editLoc) {
        await api.updateLocation(editLoc._id, {
          name,
          province,
          isMajorCity
        });
      } else {
        await api.createLocation({
          name,
          province,
          isMajorCity
        });
      }
      setIsModalOpen(false);
      fetchLocations();
    } catch (err) {
      alert(err.message || 'Error saving location');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this city/location?')) return;
    try {
      await api.deleteLocation(id);
      fetchLocations();
    } catch (err) {
      alert(err.message || 'Error deleting location');
    }
  };

  if (loading) return <LoadingSpinner text="Loading Pakistani locations CMS..." />;

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <AdminSidebar />

          <main className="flex-1 space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-900">CMS - Pakistani Cities & Regions</h1>
                <p className="text-xs text-slate-500">
                  Manage all supported cities across Punjab, Sindh, KPK, Balochistan, ICT, AJK, and GB.
                </p>
              </div>

              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add City</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">City Name</th>
                    <th className="p-4">Province / Territory</th>
                    <th className="p-4">Homepage Highlight</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {locations.map((loc) => (
                    <tr key={loc._id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{loc.name}</p>
                      </td>
                      <td className="p-4 font-semibold text-slate-700">{loc.province}</td>
                      <td className="p-4">
                        {loc.isMajorCity ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">Yes</span>
                        ) : (
                          <span className="text-slate-400">No</span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(loc)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(loc._id)}
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
              {editLoc ? 'Edit City' : 'Add Pakistani City'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">City Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abbottabad"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Province / Region</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="Punjab">Punjab</option>
                  <option value="Sindh">Sindh</option>
                  <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="Islamabad Capital Territory">Islamabad Capital Territory</option>
                  <option value="Azad Jammu & Kashmir">Azad Jammu & Kashmir</option>
                  <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isMajorCity}
                  onChange={(e) => setIsMajorCity(e.target.checked)}
                  className="accent-emerald-600"
                />
                <span>Highlight on Homepage as Major City</span>
              </label>

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
                  className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Save City
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

