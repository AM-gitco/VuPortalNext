import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Sparkles, BookOpen, GraduationCap, Lightbulb, FileText, Users, Zap, Clock, MessageSquare, ArrowDown, MoreVertical, Copy, RefreshCw, Plus, Trash2, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: Date;
}

export function AIChat({ user }: { user: any }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentQuestions, setRecentQuestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([
    { id: '1', name: 'New Discussion', messages: [], createdAt: new Date() }
  ]);
  const [currentSessionId, setCurrentSessionId] = useState('1');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage.trim();
    setRecentQuestions(prev => {
      const unique = prev.filter(q => q !== userMsg);
      return [userMsg, ...unique].slice(0, 5);
    });

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMsg,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/chat", { message: userMsg });
      const data = await response.json();

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      toast({
        title: "Chat Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      name: `Discussion ${sessions.length + 1}`,
      messages: [],
      createdAt: new Date()
    };
    setSessions(prev => [...prev, newSession]);
    setCurrentSessionId(newSession.id);
    setMessages([]);
    setShowDropdown(false);
  };

  const handleClearChat = () => {
    setMessages([]);
    setShowDropdown(false);
    toast({ title: "Chat cleared" });
  };

  const handleScroll = () => {
    // Scroll handling logic if needed
  };

  const suggestedQuestions = [
    { icon: GraduationCap, text: "Exam preparation tips?", color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/20" },
    { icon: Lightbulb, text: "How to study effectively?", color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/20" },
    { icon: Users, text: "GDB Guidelines", color: "text-violet-500", bg: "bg-violet-100 dark:bg-violet-900/20" },
    { icon: BookOpen, text: "Subject Statistics", color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/20" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-6 p-2 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Dynamic Header Component */}
      <div className="flex-shrink-0 relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 via-violet-400/40 to-indigo-500/40 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex items-center justify-between bg-white/90 dark:bg-gray-900/80 backdrop-blur-2xl rounded-2xl p-4 md:p-6 border border-border dark:border-gray-800 shadow-xl">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg animate-pulse"></div>
              <div className="relative p-3.5 bg-gradient-to-br from-primary to-violet-600 rounded-2xl shadow-lg transform group-hover:rotate-6 transition-transform duration-500">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full shadow-md z-20"></div>
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-violet-600">
                Study AI Assistant
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/20 text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest">
                  AI Online
                </span>
                <span className="text-xs text-muted-foreground font-medium hidden md:inline">• Personalized academic assistance</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden grayscale hover:grayscale-0 transition-all cursor-help">
                  <User size={14} className="text-muted-foreground" />
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary z-10">+12k</div>
            </div>

            <div className="relative" ref={dropdownRef}>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </Button>

              {showDropdown && (
                <div className="absolute right-0 top-12 w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 p-2 animate-in zoom-in-95 duration-200">
                  <DropdownItem icon={Plus} label="New Discussion" onClick={handleNewSession} className="text-primary" />
                  <div className="h-px bg-gray-100 dark:bg-gray-800 my-1.5 mx-2" />
                  <DropdownItem icon={Trash2} label="Clear History" onClick={handleClearChat} className="text-destructive" />
                  <DropdownItem icon={Download} label="Export Chat" onClick={() => toast({ title: "Feature coming soon" })} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Chat Main Area */}
        <Card className="flex-1 flex flex-col border-0 bg-white/40 dark:bg-gray-900/40 backdrop-blur-3xl shadow-3xl overflow-hidden ring-1 ring-gray-200 dark:ring-gray-800 rounded-3xl">
          <div className="flex-1 relative">
            <div
              ref={scrollContainerRef}
              className="absolute inset-0 overflow-y-auto p-4 md:p-8 space-y-8 no-scrollbar scroll-smooth"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-8 opacity-0 animate-in fade-in zoom-in duration-1000 fill-mode-forwards delay-300">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse scale-150"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-tr from-primary/10 to-violet-600/10 rounded-3xl flex items-center justify-center mb-6">
                      <Bot className="w-12 h-12 text-primary" />
                    </div>
                  </div>
                  <div className="max-w-md space-y-3">
                    <h2 className="text-3xl font-bold text-foreground tracking-tight">How can I help you today?</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      I'm your dedicated AI tutor. Ask me about VU subjects, assignment guidelines, or study techniques.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
                    {suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setInputMessage(q.text)}
                        className="flex flex-col items-start p-5 rounded-3xl bg-white dark:bg-gray-800/80 border border-border/50 dark:border-gray-700 hover:border-primary/50 hover:shadow-xl transition-all duration-300 group text-left relative overflow-hidden active:scale-95 shadow-sm"
                      >
                        <div className={`p-3 rounded-2xl ${q.bg} mb-4 group-hover:scale-110 transition-transform`}>
                          <q.icon className={`w-5 h-5 ${q.color}`} />
                        </div>
                        <h3 className="font-bold text-foreground mb-1">{q.text}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">Quick academic help & resources</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-2 duration-500`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {msg.role === 'assistant' ? (
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-lg transform rotate-3">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg transform -rotate-3 overflow-hidden">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>

                    <div className={`flex flex-col gap-2 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                      <div className={`relative px-5 py-4 rounded-3xl shadow-sm text-sm leading-relaxed ${msg.role === 'user'
                        ? 'bg-gradient-to-br from-primary to-indigo-600 text-white rounded-tr-none'
                        : 'bg-muted/50 dark:bg-gray-800 border border-border dark:border-gray-700 font-medium text-foreground rounded-tl-none'
                        }`}>
                        {msg.content}
                        {msg.role === 'assistant' && (
                          <button className="absolute -bottom-6 right-0 p-1 opacity-0 group-hover:opacity-100 hover:text-primary transition-all text-muted-foreground">
                            <Copy size={12} />
                          </button>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground/60 font-bold uppercase tracking-widest px-2">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex items-start gap-4 animate-in fade-in duration-300">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div className="bg-white/50 dark:bg-gray-800/50 p-6 rounded-3xl rounded-tl-none border border-white/20 flex flex-col gap-3 max-w-[200px] backdrop-blur-md">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-duration:0.8s]" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]" />
                    </div>
                    <span className="text-[10px] text-primary/60 font-bold animate-pulse">THINKING...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>

          {/* New Modern Input Panel */}
          <div className="p-4 md:p-8 relative">
            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-t from-background via-background/80 to-transparent z-10 -mt-12 pointer-events-none"></div>

            {/* Contextual Pills */}
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar scroll-smooth pb-1">
              {recentQuestions.length > 0 && (
                <div className="flex items-center bg-primary/5 rounded-2xl border border-primary/10 p-1 pr-3 gap-2 flex-shrink-0 animate-in slide-in-from-left duration-500">
                  <div className="bg-primary/10 p-1.5 rounded-xl"><Clock className="w-3.5 h-3.5 text-primary" /></div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Recent</span>
                  <div className="flex gap-2">
                    {recentQuestions.slice(0, 2).map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setInputMessage(q)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors max-w-[120px] truncate py-1 border-b border-transparent hover:border-primary/30"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative group/input">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-violet-600/30 rounded-[2.5rem] blur opacity-0 group-focus-within/input:opacity-100 transition duration-1000"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-200 dark:border-gray-700 shadow-2xl focus-within:border-primary/50 transition-all duration-300">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type a message or ask for help..."
                  className="min-h-[80px] max-h-[200px] w-full bg-transparent border-0 focus-visible:ring-0 py-6 px-8 text-base md:text-lg resize-none placeholder:text-muted-foreground/50"
                />
                <div className="flex items-center justify-between px-6 pb-4">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all">
                      <Plus className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl hover:bg-orange-100 dark:hover:bg-orange-950/20 hover:text-orange-600 transition-all">
                      <Zap className="w-5 h-5 shrink-0" />
                    </Button>
                  </div>

                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className={`h-12 px-8 rounded-2xl gap-2 font-bold transition-all duration-500 shadow-lg ${inputMessage.trim()
                      ? 'bg-gradient-to-r from-primary to-violet-600 hover:shadow-primary/40 transform hover:-translate-y-1'
                      : 'bg-gray-100 dark:bg-gray-700 text-muted-foreground grayscale cursor-not-allowed opacity-50'
                      }`}
                  >
                    <span>Send</span>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-center mt-4 text-muted-foreground/60 font-medium tracking-tight">
              Study AI Pro uses specialized models for VU curriculum • Always verify critical info
            </p>
          </div>
        </Card>

        {/* Desktop Sidebar - Quick Stats / Recommended */}
        <div className="hidden lg:flex w-80 flex-col gap-6">
          <Card className="border-0 bg-white/40 dark:bg-gray-900/40 backdrop-blur-3xl p-6 rounded-3xl shadow-xl space-y-6">
            <div className="space-y-2">
              <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground/70">Performance</h3>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-foreground">87%</span>
                <Zap className="text-yellow-500 animate-pulse" size={20} />
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full w-[87%] bg-gradient-to-r from-primary to-violet-500"></div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground/70">Recommended</h3>
              <div className="space-y-3">
                {[
                  { title: "Exam Strategy", info: "Last updated 2h ago" },
                  { title: "GPA Calculator", info: "Personal tool available" },
                  { title: "Study Schedule", info: "Based on your subjects" }
                ].map((item, i) => (
                  <button key={i} className="w-full text-left p-4 rounded-2xl hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all group bg-white/20 dark:bg-gray-800/20">
                    <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground">{item.info}</p>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DropdownItem({ icon: Icon, label, onClick, className = "" }: { icon: any, label: string, onClick: () => void, className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all ${className}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

