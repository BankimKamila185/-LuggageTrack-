import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Shield, User, X, AlertTriangle } from "lucide-react";
import { apiService } from "../services/api";

const ROLES = ["Administrator", "Manager", "Operations Staff", "Executive"];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Null for Add, user object for Edit
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Operations Staff",
    status: "Active"
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await apiService.getUsers();
      setUsers(res.data);
    } catch (err) {
      setError("Failed to load users database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openAddModal = () => {
    setCurrentUser(null);
    setFormData({ name: "", email: "", role: "Operations Staff", status: "Active" });
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setCurrentUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, status: user.status });
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Name and Email are required.");
      return;
    }

    try {
      if (currentUser) {
        // Edit Mode
        await apiService.updateUser(currentUser.id, formData);
      } else {
        // Add Mode
        await apiService.addUser(formData);
      }
      setModalOpen(false);
      loadUsers();
    } catch (err) {
      setError(err.message || "Failed to save user.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this user's cloud access?")) {
      try {
        await apiService.deleteUser(id);
        loadUsers();
      } catch (err) {
        setError("Failed to delete user.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-white m-0">User Accounts</h1>
          <p className="text-sm text-slate-400 mt-1">Manage personnel profiles, identity directories, and RBAC clearances.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-500 transition-all cursor-pointer self-start"
        >
          <Plus className="h-4 w-4" />
          Add Access Profile
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-xs font-medium text-red-400">
          {error}
        </div>
      )}

      {/* Main Table Card */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/20 backdrop-blur-sm">
        <table className="w-full border-collapse text-left text-sm text-slate-300">
          <thead className="bg-slate-900/60 font-heading text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-6 py-4">User Details</th>
              <th className="px-6 py-4">Role Clearance</th>
              <th className="px-6 py-4">Network Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <span className="text-xs text-slate-500">Querying user credentials store...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-xs text-slate-500">
                  No registered profiles found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center bg-slate-800 rounded-full">
                        <User className="h-4.5 w-4.5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span className="text-xs font-semibold text-slate-300">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                        user.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                        title="Edit Profile"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="rounded p-1.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
                        title="Revoke Profile"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          
          {/* Form Container */}
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl backdrop-blur-md z-10">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-heading text-lg font-bold text-white mb-4">
              {currentUser ? "Modify Access Credentials" : "Provision Cloud Identity Profile"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. Liam Sterling"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Corporate Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. liam.s@luggagetrack.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Role Authorization Clearance
                </label>
                <select
                  name="role"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Network Connectivity Status
                </label>
                <select
                  name="status"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500 transition-colors cursor-pointer"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                <span>
                  Adding profiles triggers email initialization verification procedures immediately.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors cursor-pointer"
                >
                  Confirm Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
