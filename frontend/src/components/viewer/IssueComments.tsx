import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { issuesApi } from '@/api/issuesApi';
import { useAuthStore } from '@/stores/authStore';
import { IssueComment } from '@/types/issue';
import { MessageSquare, Send, Trash2, Paperclip } from 'lucide-react';

interface IssueCommentsProps {
  issueId: string;
  comments: IssueComment[];
}

export default function IssueComments({ issueId, comments }: IssueCommentsProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [body, setBody] = useState('');

  const addMutation = useMutation({
    mutationFn: () =>
      issuesApi.addComment(issueId, {
        user_id: user?.id || 'unknown',
        user_name: user?.username || user?.email || 'User',
        body,
      }),
    onSuccess: () => {
      setBody('');
      // Invalidate the parent issues query to refresh the comment list embedded in the issue
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => issuesApi.deleteComment(issueId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    addMutation.mutate();
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Comment List */}
      <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 gap-2">
            <MessageSquare size={24} className="opacity-40" />
            <p className="text-sm">No comments yet. Start the conversation.</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-primary-600/30 border border-primary-500/30 flex items-center justify-center text-[10px] font-bold text-primary-400 flex-shrink-0 mt-0.5">
                {getInitials(comment.user_name)}
              </div>

              {/* Bubble */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-white">{comment.user_name}</span>
                  <span className="text-[10px] text-gray-500">{formatTime(comment.timestamp)}</span>
                </div>
                <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl px-3 py-2 text-sm text-gray-200 leading-relaxed break-words">
                  {comment.body}
                </div>
                {/* Attachments */}
                {comment.attachments && comment.attachments.length > 0 && (
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {comment.attachments.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 bg-blue-500/10 rounded-md px-2 py-0.5"
                      >
                        <Paperclip size={10} />
                        Attachment {i + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Delete (own comment or admin) */}
              {(comment.user_id === user?.id || user?.role === 'admin') && (
                <button
                  onClick={() => deleteMutation.mutate(comment.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-600 hover:text-red-400 self-start mt-1"
                  title="Delete comment"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t border-gray-800">
        <div className="w-7 h-7 rounded-full bg-primary-600/30 border border-primary-500/30 flex items-center justify-center text-[10px] font-bold text-primary-400 flex-shrink-0 mt-1">
          {getInitials(user?.username || user?.email || 'U')}
        </div>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-gray-800/50 border border-gray-700 text-white text-sm rounded-xl px-3 py-2 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all placeholder:text-gray-500"
          />
          <button
            type="submit"
            disabled={!body.trim() || addMutation.isPending}
            className="px-3 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}
