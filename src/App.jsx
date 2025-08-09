import { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css'; // Ensure Tailwind CSS is imported here

const App = () => {
  const [messages, setMessages] = useState([]);
  const [liveChatId, setLiveChatId] = useState('');
  const [videoId, setVideoId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLiveChatId = async () => {
    if (!videoId || !apiKey) return;
    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}&key=${apiKey}`
      );
      const chatId = response.data.items[0]?.liveStreamingDetails?.activeLiveChatId;
      if (chatId) {
        setLiveChatId(chatId);
        setError(null);
      } else {
        setError('No active live chat found for this video.');
      }
    } catch (err) {
      setError('Error fetching live chat ID: ' + err.message);
    }
    setIsLoading(false);
  };

  const fetchMessages = async () => {
    if (!liveChatId || !apiKey) return;
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${liveChatId}&part=snippet,authorDetails&key=${apiKey}`
      );
      setMessages((prev) => {
        const newMessages = response.data.items.filter(
          (msg) => !prev.some((m) => m.id === msg.id)
        );
        return [...newMessages, ...prev].slice(0, 50); // Keep last 50 messages
      });
    } catch (err) {
      setError('Error fetching messages: ' + err.message);
    }
  };

  useEffect(() => {
    if (liveChatId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 2000); // Poll every 2 seconds
      return () => clearInterval(interval);
    }
  }, [liveChatId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchLiveChatId();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white font-sans">
      <header className="bg-gray-900/80 backdrop-blur-md p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <img
            src="https://yt3.googleusercontent.com/5rRScxeAXjq0TW0RYV-K6YGXQut5p957LulXx_blG_j_zU1FEZ1TWtbuMQPxCdyG6T3qAnuzY0U=s160-c-k-c0x00ffffff-no-rj"
            alt="Billa Solo Gaming Logo"
            className="w-12 h-12 rounded-full object-cover"
          />
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-red-600">
            Billa Solo Gaming Live Chat
          </h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-4">
        <div className="mb-6 bg-gray-800/50 p-4 rounded-lg shadow-xl border border-purple-500/30">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Enter YouTube Video ID"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              className="p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
            <input
              type="text"
              placeholder="Enter YouTube API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="p-3 bg-gradient-to-r from-purple-600 to-red-600 rounded-lg hover:from-purple-700 hover:to-red-700 disabled:opacity-50 transition-all duration-300"
            >
              {isLoading ? 'Loading...' : 'Load Chat'}
            </button>
          </div>
          {error && <p className="text-red-400 mt-4 animate-pulse">{error}</p>}
        </div>
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-xl border border-purple-500/30 max-h-[70vh] overflow-y-auto">
          {messages.length === 0 && !error && (
            <p className="text-gray-400 text-center">Enter a valid Video ID and API Key to see live chat.</p>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="mb-4 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/80 transition-all duration-200 border-l-4 border-purple-500 animate-slide-in"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-purple-400">
                  {msg.authorDetails.displayName}:
                </span>
                <span className="text-gray-200">{msg.snippet.displayMessage}</span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(msg.snippet.publishedAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;