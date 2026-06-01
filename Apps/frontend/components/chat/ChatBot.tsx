'use client';

import { useState, useRef, useEffect } from 'react';
import { useMapStore } from '../../store/mapStore';
import styles from '@/styles/chatbot.module.css';

interface Message {
  role: 'user' | 'bot';
  content: string;
}

var QUICK_REPLIES = [
  '🗺️ Dimana refill station terdekat?',
  '📍 Bagaimana menuju Fmipa Kering?',
  '💡 Tips hemat sampah plastik',
  '⭐ Cara naik rank ke Eco Warrior?',
];

var WELCOME_MSG: Message = {
  role: 'bot',
  content: 'Halo! 🌿 Saya Wmap Assistant, siap membantu kamu menjelajahi kampus IPB dengan lebih ramah lingkungan. Tanyakan arah ke refill station, tempat sampah terdekat, atau tips sustainability!',
};

export default function ChatBot() {
  var userLocation = useMapStore(function (s) { return s.userLocation; });
  var [isOpen, setIsOpen] = useState(false);
  var [isClosing, setIsClosing] = useState(false);
  var [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  var [input, setInput] = useState('');
  var [isLoading, setIsLoading] = useState(false);
  var messagesEndRef = useRef<HTMLDivElement>(null);
  var inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(function () {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(function () {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  var handleOpen = function () {
    setIsOpen(true);
    setIsClosing(false);
  };

  var handleClose = function () {
    setIsClosing(true);
    setTimeout(function () {
      setIsOpen(false);
      setIsClosing(false);
    }, 200);
  };

  // Shared send logic - works for both normal send and quick replies
  var callChatAPI = function (text: string, currentMessages: Message[]) {
    setIsLoading(true);

    var history = currentMessages.map(function (m) {
      return { role: m.role === 'user' ? 'user' : 'assistant', content: m.content };
    });

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        history: history,
        userLat: userLocation ? userLocation.lat : null,
        userLng: userLocation ? userLocation.lng : null,
      }),
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.error) {
          setMessages(function (prev) {
            return prev.concat([{ role: 'bot', content: 'Maaf, terjadi kesalahan: ' + data.error }]);
          });
        } else if (data.reply) {
          setMessages(function (prev) {
            return prev.concat([{ role: 'bot', content: data.reply }]);
          });
        } else {
          setMessages(function (prev) {
            return prev.concat([{ role: 'bot', content: 'Maaf, saya tidak bisa merespon saat ini.' }]);
          });
        }
      })
      .catch(function () {
        setMessages(function (prev) {
          return prev.concat([{ role: 'bot', content: 'Maaf, terjadi kesalahan jaringan.' }]);
        });
      })
      .finally(function () {
        setIsLoading(false);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      });
  };

  var handleSend = function () {
    var text = input.trim();
    if (!text || isLoading) return;

    var userMsg: Message = { role: 'user', content: text };
    setInput('');
    var newMessages = messages.concat([userMsg]);
    setMessages(newMessages);
    callChatAPI(text, newMessages);
  };

  var handleKeyDown = function (e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  var handleQuickReply = function (text: string) {
    if (isLoading) return;

    var userMsg: Message = { role: 'user', content: text };
    setInput('');
    var newMessages = messages.concat([userMsg]);
    setMessages(newMessages);
    callChatAPI(text, newMessages);
  };

  return (
    <>
      {/* ===== FAB Button ===== */}
      <button
        className={styles['cb-fab'] + (isOpen ? ' ' + styles.hidden : '')}
        onClick={handleOpen}
        aria-label="Open Chat"
      >
        💬
      </button>

      {/* ===== Chat Panel ===== */}
      {isOpen ? (
        <div className={styles['cb-panel'] + (isClosing ? ' ' + styles.closing : '')}>
          {/* Header */}
          <div className={styles['cb-header']}>
            <div className={styles['cb-header-left']}>
              <div className={styles['cb-avatar-icon']}>🌿</div>
              <div>
                <div className={styles['cb-header-title']}>Wmap Assistant</div>
                <div className={styles['cb-header-sub']}>Powered by DeepSeek V4 Flash</div>
              </div>
            </div>
            <button className={styles['cb-close-btn']} onClick={handleClose} aria-label="Close Chat">
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className={styles['cb-messages']}>
            {messages.map(function (msg, idx) {
              return (
                <div
                  key={idx}
                  className={styles['cb-msg'] + ' ' + (msg.role === 'user' ? styles.user : styles.bot)}
                >
                  {msg.content}
                </div>
              );
            })}

            {/* Typing indicator */}
            {isLoading ? (
              <div className={styles['cb-typing']}>
                <span className={styles['cb-typing-dot']}></span>
                <span className={styles['cb-typing-dot']}></span>
                <span className={styles['cb-typing-dot']}></span>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies — only show when no conversation started */}
          {messages.length <= 1 && !isLoading ? (
            <div className={styles['cb-quick-replies']}>
              {QUICK_REPLIES.map(function (reply) {
                return (
                  <button
                    key={reply}
                    className={styles['cb-quick-btn']}
                    onClick={function () { handleQuickReply(reply); }}
                  >
                    {reply}
                  </button>
                );
              })}
            </div>
          ) : null}

          {/* Input */}
          <div className={styles['cb-input-row']}>
            <input
              ref={inputRef}
              className={styles['cb-input']}
              type="text"
              placeholder="Ketik pesan..."
              value={input}
              onChange={function (e) { setInput(e.target.value); }}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button
              className={styles['cb-send-btn']}
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              aria-label="Send"
            >
              ↑
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}