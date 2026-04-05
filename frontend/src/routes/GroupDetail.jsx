import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGroup, useJoinGroup, useLeaveGroup, useGroupPosts, useCreatePost, useDeletePost } from '../hooks/useGroups';
import { useAuth } from '../hooks/useAuth';
import { UsersRound, ArrowLeft, Loader2, Send, Trash2, Edit2, ShieldAlert } from 'lucide-react';

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const { data: group, isLoading, isError } = useGroup(id);
  const { data: posts, isLoading: isLoadingPosts } = useGroupPosts(id);
  
  const joinMutation = useJoinGroup();
  const leaveMutation = useLeaveGroup();
  const createPostMutation = useCreatePost();
  const deletePostMutation = useDeletePost();

  const [postBody, setPostBody] = useState('');
  const [postTitle, setPostTitle] = useState('');
  
  if (isLoading) return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  if (isError || !group) return <div className="text-center py-20 font-bold text-slate-700">Group not found</div>;

  const isMemberRow = group.members?.find(m => m.id === currentUser?.id);
  const isMember = !!isMemberRow;
  const isAdmin = isMemberRow?.role === 'admin';

  const handleCreatePost = (e) => {
    e.preventDefault();
    if(!postTitle || !postBody || !currentUser) return;
    
    createPostMutation.mutate({ 
      groupId: id, 
      data: { author_id: currentUser.id, title: postTitle, body: postBody } 
    }, {
      onSuccess: () => {
        setPostTitle('');
        setPostBody('');
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate('/groups')} className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 transition-colors w-fit">
        <ArrowLeft size={16} /> Back to Groups
      </button>

      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <UsersRound className="absolute -bottom-10 -right-10 w-64 h-64 text-white opacity-5" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold tracking-widest uppercase mb-4">Book Club Group</span>
            <h1 className="text-4xl font-extrabold mb-2">{group.name}</h1>
            <p className="text-indigo-100 max-w-2xl">{group.description}</p>
          </div>
          
          <div className="bg-white/10 p-5 rounded-xl backdrop-blur-sm border border-white/20 md:w-72 flex flex-col flex-shrink-0">
             <div className="text-center mb-4">
                <span className="block text-3xl font-bold">{group.members?.length || 0}</span>
                <span className="text-xs uppercase tracking-widest text-indigo-200">Active Members</span>
             </div>
             
             {!currentUser ? (
               <div className="text-xs text-center text-indigo-200 italic">Select active user to join</div>
             ) : isMember ? (
               <button 
                 onClick={() => leaveMutation.mutate({ id, member_id: currentUser.id })}
                 disabled={leaveMutation.isPending}
                 className="w-full py-2 bg-indigo-50/10 hover:bg-rose-500/20 hover:text-rose-200 border border-indigo-200/20 rounded-lg text-sm font-medium transition-colors"
               >
                 {isAdmin ? "Cannot Leave as Admin" : "Leave Group"}
               </button>
             ) : (
               <button 
                 onClick={() => joinMutation.mutate({ id, member_id: currentUser.id })}
                 disabled={joinMutation.isPending}
                 className="w-full py-2 bg-white text-indigo-900 hover:bg-indigo-50 rounded-lg text-sm font-bold shadow transition-colors"
               >
                 Join Group
               </button>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Posts Feed */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2">Discussion Forum</h2>
          
          {isMember && (
            <form onSubmit={handleCreatePost} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-3">
              <input type="text" placeholder="Post Title" required value={postTitle} onChange={e=>setPostTitle(e.target.value)} className="w-full px-4 py-2 border-none bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-lg font-medium text-slate-900" />
              <textarea placeholder="Write something to the group..." required value={postBody} onChange={e=>setPostBody(e.target.value)} rows="3" className="w-full px-4 py-2 border-none bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 rounded-lg text-sm"></textarea>
              <div className="flex justify-end">
                <button type="submit" disabled={createPostMutation.isPending} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50">
                   <Send size={16} /> Post
                </button>
              </div>
            </form>
          )}

          {!isMember && (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center text-slate-500">
              You must join the group to participate in discussions.
            </div>
          )}

          <div className="space-y-4">
            {isLoadingPosts ? <div className="text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-500"/></div> : null}
            {posts?.map(post => (
              <div key={post.id} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-slate-900 leading-tight">{post.title}</h3>
                  {(isAdmin || currentUser?.id === post.author_id) && (
                     <button onClick={() => deletePostMutation.mutate({ groupId: id, postId: post.id, deleter_id: currentUser.id })} className="text-slate-300 hover:text-rose-500 transition-colors p-1" title="Delete Post">
                       <Trash2 size={16} />
                     </button>
                  )}
                </div>
                <p className="text-slate-600 text-sm whitespace-pre-wrap">{post.body}</p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-700">By {post.author_name}</span>
                  <span>{new Date(post.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
            {posts?.length === 0 && <p className="text-center text-slate-400 text-sm">No posts yet. Be the first to start a discussion!</p>}
          </div>
        </div>

        {/* Sidebar Roster */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <h3 className="px-5 py-4 border-b border-slate-100 font-bold text-slate-900 bg-slate-50 flex items-center justify-between">
              Member Roster
            </h3>
            <ul className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {group.members?.map(m => (
                <li key={m.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.email}</p>
                  </div>
                  {m.role === 'admin' && <ShieldAlert size={16} className="text-indigo-500" title="Admin"/>}
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
