import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAllMembers, createMember, updateMember, deleteMember, getDocumentsByMember } from '../db';
import { RELATIONS, AVATAR_COLORS } from '../utils/constants';
import toast from 'react-hot-toast';

export default function Family() {
  const navigate = useNavigate();
  const { cryptoKey } = useAuth();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    relation: 'Self',
    dob: '',
    color: AVATAR_COLORS[0],
    note: '',
  });
  const [memberDocCounts, setMemberDocCounts] = useState({});

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const membersList = await getAllMembers();
      setMembers(membersList);

      // Get doc counts for each member
      const counts = {};
      for (const member of membersList) {
        const docs = await getDocumentsByMember(member.id);
        counts[member.id] = docs.length;
      }
      setMemberDocCounts(counts);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    try {
      if (editingMember) {
        await updateMember(editingMember.id, formData);
        toast.success('Member updated');
      } else {
        await createMember(formData);
        toast.success('Member added');
      }

      setShowModal(false);
      setEditingMember(null);
      setFormData({
        name: '',
        relation: 'Self',
        dob: '',
        color: AVATAR_COLORS[0],
        note: '',
      });
      loadMembers();
    } catch (error) {
      toast.error('Failed to save member');
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      relation: member.relation || 'Self',
      dob: member.dob || '',
      color: member.color || AVATAR_COLORS[0],
      note: member.note || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (member) => {
    const docCount = memberDocCounts[member.id] || 0;
    const confirmText = `Delete ${member.name} and ${docCount} document${docCount !== 1 ? 's' : ''}?`;
    
    if (!window.confirm(confirmText)) return;

    try {
      await deleteMember(member.id);
      toast.success('Member deleted');
      loadMembers();
    } catch (error) {
      toast.error('Failed to delete member');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">My Family</h1>
          <p className="text-slate-600">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => {
            setEditingMember(null);
            setFormData({
              name: '',
              relation: 'Self',
              dob: '',
              color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
              note: '',
            });
            setShowModal(true);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Members Grid */}
      {members.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {members.map(member => (
            <div
              key={member.id}
              className="card p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/family/${member.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
                  style={{ backgroundColor: member.color || '#4f46e5' }}
                >
                  {member.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(member); }}
                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(member); }}
                    className="p-1.5 text-slate-400 hover:text-danger hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-slate-900 truncate">{member.name}</h3>
              <span className="badge badge-primary mt-1">{member.relation}</span>
              
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-sm text-slate-600">
                  <span className="font-medium">{memberDocCounts[member.id] || 0}</span> document{memberDocCounts[member.id] !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Plus className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-heading font-semibold text-slate-900 mb-2">
            No family members yet
          </h3>
          <p className="text-slate-600 mb-4">
            Add family members to organize your documents
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add First Member
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-heading font-semibold text-lg">
                {editingMember ? 'Edit Member' : 'Add Member'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="Enter name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Relation
                </label>
                <select
                  value={formData.relation}
                  onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                  className="input"
                >
                  {RELATIONS.map(rel => (
                    <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Avatar Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        formData.color === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Note
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="input"
                  rows={2}
                  placeholder="Optional note"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1">
                  {editingMember ? 'Update' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
