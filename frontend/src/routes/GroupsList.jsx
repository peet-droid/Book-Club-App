import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGroups, useCreateGroup } from '../hooks/useGroups';
import { useAuth } from '../hooks/useAuth';
import { UsersRound, Plus, X, Search, Loader2 } from 'lucide-react';

export default function GroupsList() {
  const { currentUser } = useAuth();
  const { data: groups, isLoading, isError } = useGroups();
  const createGroupMutation = useCreateGroup();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleCreate = (e) => {
    e.preventDefault();
    createGroupMutation.mutate({
      ...formData,
      created_by: currentUser.id
    }, {
      onSuccess: () => setIsModalOpen(false)
    });
  };

  const filteredGroups = groups?.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <UsersRound className="text-indigo-600 h-8 w-8" />
            Book Clubs & Groups
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Join topical communities or start your own reading group.
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Create Group
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search communities by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading && <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>}

      {filteredGroups && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map(group => (
            <Link 
              key={group.id} 
              to={`/groups/${group.id}`}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group/card flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-50 text-indigo-600 rounded-lg p-3 group-hover/card:bg-indigo-600 group-hover/card:text-white transition-colors">
                  <UsersRound size={24} />
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-full whitespace-nowrap">
                  {group.member_count} Members
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover/card:text-indigo-600 transition-colors mb-2 line-clamp-1">{group.name}</h3>
              <p className="text-sm text-slate-500 flex-grow line-clamp-3 mb-4">{group.description || "No description."}</p>
              <div className="text-xs text-slate-400 mt-auto pt-4 border-t border-slate-100">
                Created by {group.created_by_name}
              </div>
            </Link>
          ))}
          {filteredGroups.length === 0 && <div className="col-span-full text-center text-slate-500 py-10">No groups found.</div>}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-900">Create a New Group</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 text-sm text-slate-600">
              {!currentUser ? (
                <div className="text-amber-700 bg-amber-50 p-3 rounded-md border border-amber-200">
                  You must select an active user in the top right to become the group creator.
                </div>
              ) : (
                <form onSubmit={handleCreate} className="space-y-4">
                  {createGroupMutation.isError && <div className="text-rose-600 bg-rose-50 p-2 rounded">{createGroupMutation.error.message}</div>}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Group Name</label>
                    <input type="text" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="Sci-Fi Readers" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                    <textarea rows="3" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="Discuss the best science fiction..." />
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={createGroupMutation.isPending} className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                      {createGroupMutation.isPending ? 'Processing...' : 'Create Group'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
