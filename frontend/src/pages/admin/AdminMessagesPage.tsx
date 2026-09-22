import { useEffect, useState } from 'react';
import {
  MessageSquare,
  Search,
  Mail,
  Send,
  Trash2,
  CheckCircle2,
  X,
  Clock,
  User,
  Phone
} from 'lucide-react';
import api from '../../services/api';

interface ContactMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  subject: string;
  messageText: string;
  date: string;
  status: 'Unread' | 'Replied' | 'Archived';
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    api.get('/messages').then((response) => {
      setMessages((response.data?.data || []).map((message: any) => ({ id: message._id, senderName: message.name, senderEmail: message.email, senderPhone: message.phone || '', subject: message.subject || 'Website contact message', messageText: message.message, date: message.createdAt, status: message.status === 'Replied' ? 'Replied' : message.status === 'Archived' ? 'Archived' : 'Unread' })));
    }).catch(() => setMessages([]));
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const filteredMessages = messages.filter(
    (m) =>
      m.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.senderEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText || !activeMessage) return;

    api.put(`/messages/${activeMessage.id}`, { status: 'Replied' }).then(() => {
      setMessages((current) => current.map((message) => message.id === activeMessage.id ? { ...message, status: 'Replied' } : message));
      triggerToast(`Message marked as replied for ${activeMessage.senderEmail}`);
      setReplyText(''); setActiveMessage(null);
    }).catch(() => triggerToast('Failed to update message.'));
  };

  const handleDelete = (id: string) => {
    api.delete(`/messages/${id}`).then(() => { setMessages((current) => current.filter((message) => message.id !== id)); triggerToast('Message deleted.'); }).catch(() => triggerToast('Failed to delete message.'));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#063B66] text-white px-5 py-3 rounded-lg shadow-xl border border-white/20 flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#063B66]/10 flex items-center justify-center text-[#063B66]">
            <MessageSquare className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#063B66]">Customer Messages & Contact Desk</h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage customer inquiries, support requests, and website contact form submissions</p>
          </div>
        </div>

        <span className="px-3.5 py-1.5 rounded-full bg-[#0B63CE] text-white text-xs font-bold shadow-xs">
          {messages.filter((m) => m.status === 'Unread').length} Unread Messages
        </span>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sender name, email or subject..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0B63CE] focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.map((msg) => (
          <div
            key={msg.id}
            className={`p-6 rounded-xl border transition-all ${
              msg.status === 'Unread'
                ? 'bg-white border-[#0B63CE]/40 shadow-sm border-l-4 border-l-[#0B63CE]'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-bold text-slate-900 text-sm">{msg.senderName}</h3>
                  <span className="text-xs text-slate-500">({msg.senderEmail})</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border border-slate-200 ${
                      msg.status === 'Unread'
                        ? 'bg-white text-slate-700'
                        : 'bg-white text-slate-700'
                    }`}
                  >
                    {msg.status}
                  </span>
                </div>

                <h4 className="font-bold text-[#063B66] text-xs pt-1">{msg.subject}</h4>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{msg.messageText}</p>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-2">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {msg.senderPhone}
                  </span>
                  <span>•</span>
                  <span>{msg.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveMessage(msg)}
                  className="px-4 py-2 bg-[#063B66] hover:bg-[#052d4e] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
                <button
                  onClick={() => handleDelete(msg.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* REPLY MODAL */}
      {activeMessage && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#063B66] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Reply to {activeMessage.senderName}</h3>
              <button onClick={() => setActiveMessage(null)} className="text-slate-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendReply} className="p-6 space-y-4 text-xs">
              <div className="bg-white border border-slate-200 p-4 rounded-lg space-y-1">
                <p className="font-bold text-slate-800">Original Query: {activeMessage.subject}</p>
                <p className="text-slate-600 italic">"{activeMessage.messageText}"</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Email Reply *</label>
                <textarea
                  rows={5}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your official response to the customer..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B63CE] focus:bg-white text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveMessage(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0B63CE] hover:bg-[#0952AD] text-white font-bold shadow-sm flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Response</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
