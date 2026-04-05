import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMember, useUpdateMember, useDeleteMember, useMemberBooks, useMemberGroups } from '../hooks/useMembers';
import MemberForm from '../components/MemberForm';
import { User, Mail, Phone, Calendar, ArrowLeft, Edit2, Trash2, Library, UsersRound, Loader2, X } from 'lucide-react';

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: member, isLoading: isLoadingMember, isError: isErrorMember } = useMember(id);
  const { data: books, isLoading: isLoadingBooks } = useMemberBooks(id);
  const { data: groups, isLoading: isLoadingGroups } = useMemberGroups(id);
  
  const updateMutation = useUpdateMember();
  const deleteMutation = useDeleteMember();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  if (isLoadingMember) {
    return (
      <div className="flex justify-center items-center py-20 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-lg font-medium">Loading member profile...</span>
      </div>
    );
  }

  if (isErrorMember || !member) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Member not found</h2>
        <button onClick={() => navigate('/members')} className="mt-4 text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-2 mx-auto">
          <ArrowLeft size={16} /> Back to Directory
        </button>
      </div>
    );
  }

  const handleUpdate = (data) => {
    updateMutation.mutate({ id, data }, {
      onSuccess: () => setIsEditing(false)
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => navigate('/members')
    });
  };

  const joinedDate = new Date(member.created_at).toLocaleDateString('en-US', {
    dateStyle: 'long'
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/members')} 
        className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 group transition-colors"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        Back to Directory
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        <div className="px-6 pb-6 lg:px-8 relative">
          <div className="-mt-16 sm:-mt-20 sm:flex sm:items-end sm:space-x-5">
            <div className="relative inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full border-4 border-white shadow-md">
              <User size={48} className="text-indigo-200" strokeWidth={1.5} />
            </div>
            <div className="mt-6 sm:mt-0 sm:flex-1 sm:pb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 truncate">{member.name}</h1>
              <div className="mt-1 flex items-center gap-2 text-slate-500">
                <Calendar size={14} />
                <span className="text-sm">Joined {joinedDate}</span>
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:mt-0 sm:pb-2">
              <button 
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <Edit2 size={16} className="mr-2 text-slate-400" />
                Edit Profile
              </button>
              <button 
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
                <Mail size={16} className="text-slate-400" /> Email Address
              </h3>
              <p className="text-slate-700">{member.email}</p>
            </div>
            {member.phone && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
                  <Phone size={16} className="text-slate-400" /> Phone Number
                </h3>
                <p className="text-slate-700">{member.phone}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Library className="text-indigo-500 w-5 h-5" /> Books Library
          </h2>
          {isLoadingBooks ? (
            <div className="py-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
          ) : books?.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {books.map(book => (
                <li key={book.id} className="py-3 flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{book.title}</p>
                    <p className="text-xs text-slate-500">{book.author}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium h-fit ${book.status === 'available' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {book.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-slate-500 py-4 text-center border-2 border-dashed border-slate-100 rounded-lg">No books in library yet (Phase 4).</div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <UsersRound className="text-indigo-500 w-5 h-5" /> Groups
          </h2>
          {isLoadingGroups ? (
            <div className="py-4 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
          ) : groups?.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {groups.map(group => (
                <li key={group.id} className="py-3">
                  <p className="text-sm font-medium text-slate-900">{group.name}</p>
                  <p className="text-xs text-slate-500 capitalize">Role: {group.role}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-slate-500 py-4 text-center border-2 border-dashed border-slate-100 rounded-lg">Not a member of any groups yet (Phase 6).</div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-900">Edit Profile</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {updateMutation.isError && (
                <div className="mb-4 bg-rose-50 p-3 rounded-md border border-rose-100 text-rose-700 text-sm">
                  {updateMutation.error?.message || "Update failed."}
                </div>
              )}
              <MemberForm 
                initialData={member}
                onSubmit={handleUpdate} 
                isLoading={updateMutation.isPending} 
              />
            </div>
          </div>
        </div>
      )}

      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 mb-4">
              <Trash2 className="h-6 w-6 text-rose-600" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Delete Member?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to completely remove {member.name}? All of their books, groups, and lend history will also be permanently deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg text-white bg-rose-600 hover:bg-rose-700 focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors flex items-center justify-center disabled:bg-rose-400"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
