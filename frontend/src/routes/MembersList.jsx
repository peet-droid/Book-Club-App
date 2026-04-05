import { useState } from 'react';
import { useMembers, useCreateMember } from '../hooks/useMembers';
import MemberCard from '../components/MemberCard';
import MemberForm from '../components/MemberForm';
import { Users, UserPlus, X, Search, Loader2 } from 'lucide-react';

export default function MembersList() {
  const { data: members, isLoading, isError, error } = useMembers();
  const createMemberMutation = useCreateMember();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateMember = (data) => {
    createMemberMutation.mutate(data, {
      onSuccess: () => {
        setIsModalOpen(false);
      }
    });
  };

  const filteredMembers = members?.filter((member) => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <Users className="text-indigo-600 h-8 w-8" />
            Member Directory
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Meet the people in your book club community.
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
        >
          <UserPlus size={18} />
          Add Member
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search members by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-20 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-lg font-medium">Loading members...</span>
        </div>
      )}

      {isError && (
        <div className="bg-rose-50 p-4 rounded-lg border border-rose-100 text-rose-700">
          <p className="font-semibold">Failed to load members.</p>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      )}

      {filteredMembers && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map(member => (
            <MemberCard key={member.id} member={member} />
          ))}
          {filteredMembers.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
              No members found matching your search.
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-900">Add New Member</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {createMemberMutation.isError && (
                <div className="mb-4 bg-rose-50 p-3 rounded-md border border-rose-100 text-rose-700 text-sm">
                  {createMemberMutation.error?.message || "Failed to create member."}
                </div>
              )}
              <MemberForm 
                onSubmit={handleCreateMember} 
                isLoading={createMemberMutation.isPending} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
