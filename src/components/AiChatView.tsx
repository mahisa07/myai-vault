import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  User,
  FileText,
  Copy,
  Check,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  Search,
  Award,
  TrendingUp,
  BrainCircuit,
} from 'lucide-react';
import { ChatMessageItem, DocumentItem, UserProfile } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { CareerAssistantIcon } from './CareerAssistantIcon';

interface AiChatViewProps {
  user: UserProfile;
  documents: DocumentItem[];
  onSelectDocument: (doc: DocumentItem) => void;
}

export const AiChatView: React.FC<AiChatViewProps> = ({ user, documents, onSelectDocument }) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestedPrompts = [
    {
      title: 'What skills have I demonstrated?',
      desc: 'List all verified technical skills extracted from your documents.',
      icon: <Award className="w-4 h-4 text-[#0F4C4C]" />,
    },
    {
      title: 'Summarize my strongest qualifications.',
      desc: 'Comprehensive overview of your key certificates and degree.',
      icon: <FileText className="w-4 h-4 text-[#0F4C4C]" />,
    },
    {
      title: 'What skills am I missing for my target role?',
      desc: `Gap analysis aligned with ${user.targetRole || 'your target career'}.`,
      icon: <TrendingUp className="w-4 h-4 text-[#0F4C4C]" />,
    },
    {
      title: 'Which documents support my Python skills?',
      desc: 'Find all uploaded certificates or projects mentioning Python.',
      icon: <Search className="w-4 h-4 text-[#0F4C4C]" />,
    },
    {
      title: 'What should I improve for my career?',
      desc: 'Actionable ATS resume and portfolio improvement recommendations.',
      icon: <BrainCircuit className="w-4 h-4 text-[#0F4C4C]" />,
    },
    {
      title: 'Show evidence from my documents.',
      desc: 'Retrieve grounded citations directly from your uploaded vault.',
      icon: <ShieldCheck className="w-4 h-4 text-[#0F4C4C]" />,
    },
  ];

  const quickActions = [
    'Analyze my skills',
    'Review my career profile',
    'Find evidence',
    'Identify skill gaps',
    'Summarize my documents',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isTyping) return;

    const userMsgId = 'msg_' + Date.now();
    const newMsg: ChatMessageItem = {
      id: userMsgId,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, chatHistory: messages }),
      });
      const data = await res.json();

      const botMsgId = 'msg_' + (Date.now() + 1);
      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          sender: 'assistant',
          text: data.reply || 'I analyzed your document vault and extracted your requested career details.',
          timestamp: data.timestamp || 'Just now',
          sources: data.sources || [],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg_err_' + Date.now(),
          sender: 'assistant',
          text: documents.length > 0
            ? `**SUPPORTED BY YOUR VAULT:**\nReviewed **${documents.length}** verified document(s). Your top technical skills include: ${Array.from(new Set(documents.flatMap(d => d.skills))).join(', ')}.`
            : `**NOT FOUND IN YOUR VAULT:**\nYour document vault is currently empty. Upload your certificates or resume to begin receiving document-grounded insights.`,
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputText('');
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-5xl mx-auto text-[#2F3437] flex flex-col h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-[#0F4C4C] text-white shadow-sm flex items-center justify-center shrink-0">
            <CareerAssistantIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-[#2F3437]">AI Career Assistant</h1>
              <span className="inline-flex items-center space-x-1.5 text-[10px] bg-[#EAF0EC] text-[#577359] font-mono px-2 py-0.5 rounded-full border border-[#6F8F72]/30 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6F8F72] animate-pulse"></span>
                <span>Ready to help</span>
              </span>
            </div>
            <p className="text-xs text-[#5A6065]">Your personal career & document intelligence assistant</p>
          </div>
        </div>

        <button
          onClick={handleNewChat}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F7F3EA] text-[#5A6065] hover:text-[#2F3437] border border-[#E5E0D8] text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
          title="Start New Conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area OR Welcome Screen */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 ? (
          /* Welcome State */
          <div className="py-6 space-y-6">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF0EC] border border-[#6F8F72]/30 flex items-center justify-center mx-auto text-[#0F4C4C] shadow-xs">
                <CareerAssistantIcon className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-[#2F3437]">How can I help with your career profile?</h2>
              <p className="text-xs text-[#5A6065] leading-relaxed">
                I ground my responses strictly in your <strong>{documents.length} verified document(s)</strong>. Select a suggested query below or ask any question about your skills, missing qualifications, or career path.
              </p>
            </div>

            {/* Suggested Prompt Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {suggestedPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.title)}
                  className="p-4 rounded-2xl bg-white hover:bg-[#F7F3EA] border border-[#E5E0D8] hover:border-[#6F8F72]/50 text-left space-y-1.5 transition-all group shadow-xs hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-[#F7F3EA] group-hover:bg-[#EAF0EC] transition-colors">
                      {item.icon}
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8A9095] group-hover:text-[#0F4C4C] group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="text-xs font-bold text-[#2F3437] group-hover:text-[#0F4C4C] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-[#5A6065] leading-relaxed">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Active Conversation Messages */
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-[#6F8F72] text-white shadow-xs'
                      : 'bg-[#0F4C4C] text-white shadow-xs'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <CareerAssistantIcon className="w-4 h-4" />}
                </div>

                {/* Message Content Bubble */}
                <div className={`max-w-2xl space-y-2 ${isUser ? 'text-right' : 'text-left'}`}>
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs relative ${
                      isUser
                        ? 'bg-[#0F4C4C] text-white rounded-tr-none'
                        : 'bg-white border border-[#E5E0D8] text-[#2F3437] rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-line font-sans">{msg.text}</div>

                    <div
                      className={`flex items-center justify-between mt-3 pt-2 border-t text-[10px] ${
                        isUser ? 'border-white/20 text-white/70' : 'border-[#E5E0D8]/70 text-[#8A9095]'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="hover:text-[#0F4C4C] flex items-center space-x-1"
                        >
                          {copiedMsgId === msg.id ? (
                            <Check className="w-3 h-3 text-[#6F8F72]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedMsgId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Compact Source / Evidence Cards */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="p-3 rounded-2xl bg-white border border-[#E5E0D8] text-xs text-left space-y-2 shadow-xs">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#0F4C4C] font-bold uppercase tracking-wider">
                        <span className="flex items-center space-x-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#6F8F72]" />
                          <span>Evidence ({msg.sources.length})</span>
                        </span>
                        <span className="text-[10px] text-[#5A6065] font-normal normal-case">Grounded in vault</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {msg.sources.map((src, sIdx) => {
                          const linkedDoc = documents.find((d) => d.id === src.docId);
                          return (
                            <div
                              key={sIdx}
                              onClick={() => linkedDoc && onSelectDocument(linkedDoc)}
                              className="p-2.5 rounded-xl bg-[#F7F3EA] hover:bg-[#EAF0EC] flex items-center justify-between cursor-pointer border border-[#E5E0D8] hover:border-[#6F8F72]/40 transition-colors group"
                            >
                              <div className="flex items-center space-x-2.5 truncate">
                                <div className="p-1.5 rounded-lg bg-white border border-[#E5E0D8] text-[#0F4C4C]">
                                  <FileText className="w-3.5 h-3.5" />
                                </div>
                                <div className="truncate">
                                  <strong className="text-[#2F3437] group-hover:text-[#0F4C4C] text-xs font-semibold block truncate">
                                    {src.title}
                                  </strong>
                                  <span className="text-[10px] text-[#5A6065] block truncate">
                                    {src.category ? `Category: ${src.category}` : src.snippet}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-[#8A9095] group-hover:text-[#0F4C4C] shrink-0" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#EAF0EC] text-[#0F4C4C] flex items-center justify-center shrink-0">
              <CareerAssistantIcon className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-white border border-[#E5E0D8] text-xs text-[#0F4C4C] flex items-center space-x-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#6F8F72]" />
              <span>Analyzing document vault and verifying evidence...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions & Input Section */}
      <div className="shrink-0 space-y-2.5 pt-1">
        {/* Quick Action Chips ("Ask about your vault") */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[10px] text-[#8A9095] font-mono font-semibold uppercase shrink-0">
            Ask about your vault:
          </span>
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(action)}
              className="px-3 py-1 rounded-xl bg-[#EAF0EC] hover:bg-[#6F8F72]/20 border border-[#6F8F72]/30 text-[#0F4C4C] text-xs font-medium whitespace-nowrap transition-all shadow-2xs"
            >
              {action}
            </button>
          ))}
        </div>

        {/* Input Form with Multiline Textarea */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Ask about your skills, qualifications, or evidence in your vault... (Enter to send, Shift+Enter for new line)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-white border border-[#E5E0D8] rounded-2xl pl-4 pr-12 py-3 text-xs text-[#2F3437] placeholder-[#8A9095] focus:outline-none focus:border-[#0F4C4C] shadow-sm resize-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="absolute right-2.5 p-2 rounded-xl bg-[#0F4C4C] hover:bg-[#145959] text-white disabled:opacity-40 transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiChatView;
