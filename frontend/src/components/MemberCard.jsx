import { Link } from 'react-router-dom';
import { User, Mail, Calendar } from 'lucide-react';

export default function MemberCard({ member }) {
  // Format standard date
  const joinedDate = new Date(member.created_at).toLocaleDateString('en-US', {
    target: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <Link 
      to={`/members/${member.id}`}
      className="block bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group"
    >
      <div className="p-5 border-b border-slate-100 flex items-start gap-4">
        <div className="bg-indigo-50 text-indigo-600 rounded-full p-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
          <User size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-slate-900 truncate">
            {member.name}
          </p>
          <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
            <Mail size={14} className="flex-shrink-0" />
            <span className="truncate">{member.email}</span>
          </div>
        </div>
      </div>
      <div className="bg-slate-50 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium uppercase tracking-wider">
          <Calendar size={12} />
          Joined {joinedDate}
        </div>
        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full group-hover:bg-indigo-100 transition-colors">
          View Profile
        </span>
      </div>
    </Link>
  );
}
