import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { Send, Plus } from 'lucide-react';

const Messages = () => {
  const { user } = useAuth();
  const userId = user?.id ?? user?._id;
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    fetchMessages();
    fetchUsers();
  }, [userId]);

  const fetchMessages = async () => {
    if (!userId) return;
    try {
      const response = await api.get(`/messages/${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!userId) return;
    try {
      let response;
      try {
        response = await api.get('/users/for-messaging');
      } catch (err) {
        response = await api.get('/users');
      }
      const filtered = response.data
        .filter((u) => String(u.id || u._id) !== String(userId))
        .map((u) => ({
          id: String(u.id || u._id),
          name: u.name,
          email: u.email,
          role: u.role,
        }));
      
      setUsers(filtered);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users for messaging');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const recipientId = selectedUser ? String(selectedUser) : null;
    if (!recipientId || !newMessage.trim()) {
      toast.error('Please select a recipient and enter a message');
      return;
    }

    try {
      await api.post('/messages', {
        receiver: recipientId,
        message: newMessage.trim(),
      });
      toast.success('Message sent successfully');
      setNewMessage('');
      setShowCompose(false);
      // Keep the recipient selected so the new conversation opens
      setSelectedUser(recipientId);
      await fetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await api.put(`/messages/${messageId}/read`);
      fetchMessages();
    } catch (error) {
      console.error('Failed to mark as read');
    }
  };

  const getConversation = (otherUserId) => {
    return messages
      .filter(
        (m) =>
          (String(m.sender._id) === String(otherUserId) && String(m.receiver._id) === String(userId)) ||
          (String(m.sender._id) === String(userId) && String(m.receiver._id) === String(otherUserId))
      )
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  };

  const getConversationPartners = () => {
    const partners = new Set();
    messages.forEach((m) => {
      if (String(m.sender._id) !== String(userId)) {
        partners.add(String(m.sender._id));
      }
      if (String(m.receiver._id) !== String(userId)) {
        partners.add(String(m.receiver._id));
      }
    });
    return Array.from(partners).map((id) => {
      const message = messages.find((m) => String(m.sender._id) === id || String(m.receiver._id) === id);
      return String(message.sender._id) === id ? message.sender : message.receiver;
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-2">Communicate with teachers, students, and parents</p>
          </div>
          <button
            onClick={() => setShowCompose(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>New Message</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1 card">
            <h2 className="text-lg font-semibold mb-4">Conversations</h2>
            {!userId ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
              </div>
            ) : loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : getConversationPartners().length === 0 ? (
              <p className="text-gray-500 text-center py-8">No conversations yet</p>
            ) : (
              <div className="space-y-2">
                {getConversationPartners().map((partner) => {
                  const conversation = getConversation(partner._id);
                  const lastMessage = conversation[conversation.length - 1];
                  const unreadCount = conversation.filter(
                    (m) => !m.isRead && String(m.receiver._id) === String(userId)
                  ).length;

                  return (
                    <button
                      key={partner._id}
                      onClick={() => setSelectedUser(String(partner._id))}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        String(selectedUser) === String(partner._id)
                          ? 'bg-primary-50 border-primary-300'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{partner.name}</p>
                          <p className="text-sm text-gray-600 truncate">
                            {lastMessage?.message || 'No messages'}
                          </p>
                        </div>
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="lg:col-span-2 card flex flex-col h-[600px]">
            {selectedUser ? (
              <>
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {getConversation(selectedUser).map((message) => {
                    const isSender = String(message.sender._id) === String(userId);
                    if (!isSender && !message.isRead) {
                      markAsRead(message._id);
                    }

                    return (
                      <div
                        key={message._id}
                        className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isSender
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isSender ? 'text-primary-100' : 'text-gray-500'
                            }`}
                          >
                            {new Date(message.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <form onSubmit={sendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="input flex-1"
                  />
                  <button type="submit" className="btn btn-primary">
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a conversation to view messages
              </div>
            )}
          </div>
        </div>

        {/* Compose Modal */}
        {showCompose && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Compose Message</h2>
              <form onSubmit={sendMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                  <select
                    value={selectedUser ? String(selectedUser) : ''}
                    onChange={(e) => setSelectedUser(e.target.value || null)}
                    required
                    className="input"
                  >
                    <option value="">Select a user</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    required
                    rows="4"
                    className="input"
                    placeholder="Type your message..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="flex-1 btn btn-primary">
                    Send
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCompose(false);
                      setNewMessage('');
                    }}
                    className="flex-1 btn btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Messages;
