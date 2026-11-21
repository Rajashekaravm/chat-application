import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../services/api';
import { connectWebSocket } from '../services/websocketService';
import ChatRoom from './ChatRoom';
import '../styles/dashboard.css';

const getInitials = (name) => (name || '?')
  .split(/\s+/)
  .slice(0, 2)
  .map((part) => part.charAt(0))
  .join('')
  .toUpperCase();

const getChatTime = (timestamp) => {
  if (!timestamp) {
    return '';
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const today = new Date();
  const isToday = date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate();

  return isToday
    ? date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : date.toLocaleDateString([], { month: 'numeric', day: 'numeric' });
};

function Dashboard() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [chatError, setChatError] = useState('');
  const [search, setSearch] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [openingChatUserId, setOpeningChatUserId] = useState(null);
  const activeChatId = useRef(chatId);
  activeChatId.current = chatId;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [currentUserResponse, usersResponse, chatsResponse] = await Promise.all([
          API.get('/users/me'),
          API.get('/users/all'),
          API.get('/chats/me')
        ]);
        setCurrentUser(currentUserResponse.data);
        setUsers(usersResponse.data || []);
        setChats(chatsResponse.data || []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setLoadError('Unable to load your account and chats. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const currentUserId = currentUser?.id;
  const chatIdsKey = chats.map((chat) => chat.id).filter(Boolean).join('|');
  const chatContacts = chats.map((chat) => {
    const otherUserId = chat.participants?.find((id) => String(id) !== String(currentUserId));
    const user = users.find((item) => String(item.id) === String(otherUserId));
    return user ? { chat, user } : null;
  }).filter(Boolean).sort((first, second) => {
    const firstTime = Date.parse(first.chat.lastMessage?.timestamp);
    const secondTime = Date.parse(second.chat.lastMessage?.timestamp);
    return (Number.isNaN(secondTime) ? 0 : secondTime)
      - (Number.isNaN(firstTime) ? 0 : firstTime);
  });
  const chatContactIds = new Set(chatContacts.map(({ user }) => String(user.id)));
  const newChatUsers = users.filter((user) => (
    String(user.id) !== String(currentUserId)
    && !chatContactIds.has(String(user.id))
  ));
  const visibleContacts = (showNewChat ? newChatUsers : chatContacts)
    .filter((contact) => {
      const user = showNewChat ? contact : contact.user;
      const query = search.trim().toLowerCase();
      return !query
        || user.name?.toLowerCase().includes(query)
        || user.phoneNumber?.toLowerCase().includes(query);
    });

  const activeChat = chats.find((chat) => String(chat.id) === chatId);
  const activeUserId = activeChat?.participants
    ?.find((id) => String(id) !== String(currentUserId));
  const activeUser = users.find((user) => String(user.id) === String(activeUserId));
  const hasSelectedChat = Boolean(chatId);

  useEffect(() => {
    if (!currentUserId || !chatIdsKey) {
      return undefined;
    }

    const unsubscribe = chatIdsKey.split('|').map((subscribedChatId) => (
      connectWebSocket(subscribedChatId, (msg) => {
        const isIncoming = String(msg.senderId) !== String(currentUserId);
        const isOpenChat = String(activeChatId.current) === String(subscribedChatId);

        setChats((previousChats) => previousChats.map((chat) => (
          String(chat.id) === String(subscribedChatId)
            ? {
              ...chat,
              lastMessage: msg,
              unreadCount: isIncoming && !isOpenChat
                ? (chat.unreadCount || 0) + 1
                : 0
            }
            : chat
        )));
      })
    ));

    return () => unsubscribe.forEach((stop) => stop());
  }, [chatIdsKey, currentUserId]);

  useEffect(() => {
    if (chatId) {
      setChats((previousChats) => previousChats.map((chat) => (
        String(chat.id) === String(chatId)
          ? { ...chat, unreadCount: 0 }
          : chat
      )));
    }
  }, [chatId]);

  const openChat = async (user) => {
    setChatError('');
    setOpeningChatUserId(user.id);
    try {
      const existingChat = chats.find((chat) => (
        chat.participants?.some((id) => String(id) === String(currentUserId))
        && chat.participants?.some((id) => String(id) === String(user.id))
      ));
      const chat = existingChat
        || (await API.post(`/chats/with/${user.id}`)).data;

      if (!existingChat) {
        setChats((previousChats) => [
          ...previousChats,
          { ...chat, lastMessage: null, unreadCount: 0 }
        ]);
      }
      setShowNewChat(false);
      navigate(`/chat/${chat.id}`);
    } catch (err) {
      console.error('Failed to open chat:', err);
      setChatError('Unable to open this conversation. Please try again.');
    } finally {
      setOpeningChatUserId(null);
    }
  };

  const toggleNewChat = () => {
    setSearch('');
    setChatError('');
    setShowNewChat((showing) => !showing);
  };

  return (
    <main className={`dashboard${hasSelectedChat ? ' dashboard--chat-open' : ''}`}>
      <aside className="contacts-panel">
        <header className="contacts-header">
          <div className="contacts-brand">
            <div className="account-avatar" aria-hidden="true">
              {getInitials(currentUser?.name)}
            </div>
            <div className="account-details">
              <h1>{currentUser?.name || 'Your account'}</h1>
              <p>{currentUser?.phoneNumber || 'Signed in'}</p>
            </div>
          </div>
          <button className="logout-button" onClick={logout} title="Log out">
            Log out
          </button>
        </header>

        <div className="contacts-search">
          <label className="sr-only" htmlFor="contact-search">
            {showNewChat ? 'Search users' : 'Search chats'}
          </label>
          <span aria-hidden="true">⌕</span>
          <input
            id="contact-search"
            type="search"
            placeholder={showNewChat ? 'Search people' : 'Search your chats'}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="contacts-heading">
          <span>{showNewChat ? 'START A CHAT' : 'CHATS'}</span>
          <div className="contacts-heading-actions">
            <span className="contacts-count">
              {showNewChat ? newChatUsers.length : chatContacts.length}
            </span>
            <button className="new-chat-button" onClick={toggleNewChat}>
              {showNewChat ? 'Chats' : '+ New'}
            </button>
          </div>
        </div>

        {loadError && <p className="contacts-state contacts-state--error">{loadError}</p>}
        {chatError && <p className="contacts-state contacts-state--error">{chatError}</p>}

        <nav className="contacts-list" aria-label={showNewChat ? 'Users' : 'Chats'}>
          {loading ? (
            <p className="contacts-state">Loading your chats...</p>
          ) : !loadError && visibleContacts.length === 0 ? (
            <p className="contacts-state">
              {showNewChat
                ? 'No people found.'
                : 'No conversations yet. Select “New” to start chatting.'}
            </p>
          ) : (
            visibleContacts.map((contact) => {
              const chat = showNewChat ? null : contact.chat;
              const user = showNewChat ? contact : contact.user;
              const isActive = chat && String(chat.id) === chatId;
              const unreadCount = isActive ? 0 : chat?.unreadCount || 0;
              const preview = chat?.lastMessage?.content
                || user.phoneNumber
                || 'Tap to open conversation';

              return (
                <button
                  className={`contact-item${isActive ? ' contact-item--active' : ''}`}
                  key={user.id}
                  onClick={() => openChat(user)}
                  disabled={String(openingChatUserId) === String(user.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="contact-avatar" aria-hidden="true">
                    {getInitials(user.name)}
                  </span>
                  <span className="contact-copy">
                    <span className="contact-name">{user.name || 'Unknown contact'}</span>
                    <span className="contact-preview">{preview}</span>
                  </span>
                  {chat && (
                    <span className="contact-meta">
                      {chat.lastMessage?.timestamp && (
                        <time>{getChatTime(chat.lastMessage.timestamp)}</time>
                      )}
                      {unreadCount > 0 && (
                        <span className="unread-badge">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </nav>
        <footer className="contacts-footer">Your conversations, all in one place.</footer>
      </aside>

      <section className="conversation-panel" aria-label="Conversation">
        {hasSelectedChat && activeChat && activeUser && currentUser ? (
          <ChatRoom
            key={activeChat.id}
            chatId={activeChat.id}
            contactName={activeUser.name}
            currentUserId={currentUser.id}
          />
        ) : hasSelectedChat ? (
          <div className="conversation-empty">
            <p>{loading ? 'Loading conversation...' : 'This conversation is not available.'}</p>
          </div>
        ) : (
          <div className="conversation-empty">
            <div className="empty-illustration" aria-hidden="true">
              <span className="empty-bubble empty-bubble--one" />
              <span className="empty-bubble empty-bubble--two" />
              <span className="empty-spark">✦</span>
            </div>
            <h2>Make room for a good conversation</h2>
            <p>Select a chat from the list to send a message and pick up where you left off.</p>
            <span className="end-to-end-note">
              <span aria-hidden="true">⌑</span> Private conversations made simple
            </span>
          </div>
        )}
      </section>
    </main>
  );
}

export default Dashboard;
