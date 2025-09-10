import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, X, Send, User } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { ChatMessage } from '@shared/schema';

interface ChatMessageProps {
  message: string;
  isBot: boolean;
}

function ChatMessageComponent({ message, isBot }: ChatMessageProps) {
  return (
    <div className={`chat-message flex items-start space-x-2 ${isBot ? '' : 'justify-end'}`}>
      {isBot && (
        <Avatar className="w-6 h-6 bg-primary">
          <AvatarFallback>
            <Bot className="text-primary-foreground text-xs" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={`rounded-lg p-3 text-sm max-w-xs whitespace-pre-wrap ${
          isBot
            ? 'bg-muted text-foreground'
            : 'bg-primary text-primary-foreground'
        }`}
        data-testid={isBot ? 'text-bot-message' : 'text-user-message'}
      >
        {message}
      </div>
      {!isBot && (
        <Avatar className="w-6 h-6 bg-secondary">
          <AvatarFallback>
            <User className="text-secondary-foreground text-xs" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<{ message: string; isBot: boolean }[]>([
    {
      message: "Hello! I'm your AI assistant for the Software Development Lifecycle. How can I help you today?",
      isBot: true,
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch chat history
  const { data: chatHistory } = useQuery({
    queryKey: ['/api/chat-history'],
    enabled: isOpen,
  });

  // Load chat history on mount
  useEffect(() => {
    if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
      const historyMessages = chatHistory.map((msg: ChatMessage) => [
        { message: msg.message, isBot: false },
        { message: msg.response, isBot: true },
      ]).flat();
      setMessages([
        {
          message: "Hello! I'm your AI assistant for the Software Development Lifecycle. How can I help you today?",
          isBot: true,
        },
        ...historyMessages,
      ]);
    }
  }, [chatHistory]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/chat', { message });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        { message: data.response, isBot: true },
      ]);
      queryClient.invalidateQueries({ queryKey: ['/api/chat-history'] });
    },
    onError: (error) => {
      setMessages(prev => [
        ...prev,
        { 
          message: "Sorry, I encountered an error processing your request. Please try again.", 
          isBot: true 
        },
      ]);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || sendMessageMutation.isPending) return;

    const userMessage = inputMessage.trim();
    setMessages(prev => [...prev, { message: userMessage, isBot: false }]);
    setInputMessage('');
    
    sendMessageMutation.mutate(userMessage);
  };

  const handleQuickAction = (message: string) => {
    if (sendMessageMutation.isPending) return;
    setMessages(prev => [...prev, { message, isBot: false }]);
    sendMessageMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50" data-testid="floating-chatbot">
      {/* Chat Toggle Button */}
      <Button
        className="w-14 h-14 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-chat-toggle"
      >
        <Bot className="text-xl" />
      </Button>

      {/* Chat Interface */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 h-96 shadow-xl flex flex-col">
          {/* Chat Header */}
          <CardHeader className="p-4 border-b border-border flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8 bg-primary">
                <AvatarFallback>
                  <Bot className="text-primary-foreground text-sm" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="text-sm font-medium text-foreground">AI Assistant</h4>
                <p className="text-xs text-muted-foreground">SDLC Expert</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              data-testid="button-chat-close"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          {/* Chat Messages */}
          <CardContent className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((msg, index) => (
              <ChatMessageComponent
                key={index}
                message={msg.message}
                isBot={msg.isBot}
              />
            ))}
            {sendMessageMutation.isPending && (
              <div className="chat-message flex items-start space-x-2">
                <Avatar className="w-6 h-6 bg-primary">
                  <AvatarFallback>
                    <Bot className="text-primary-foreground text-xs" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3 text-sm max-w-xs processing">
                  <div className="text-muted-foreground">Thinking...</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Chat Input */}
          <div className="p-4 border-t border-border">
            <div className="flex space-x-2">
              <Input
                placeholder="Ask about SDLC, testing, requirements..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sendMessageMutation.isPending}
                data-testid="input-chat-message"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || sendMessageMutation.isPending}
                data-testid="button-send-message"
              >
                <Send className="text-sm" />
              </Button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-2">
              <Button
                variant="secondary"
                size="sm"
                className="text-xs"
                onClick={() => handleQuickAction('Explain SDLC phases')}
                disabled={sendMessageMutation.isPending}
                data-testid="button-quick-sdlc"
              >
                Explain SDLC phases
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="text-xs"
                onClick={() => handleQuickAction('Give me code review tips')}
                disabled={sendMessageMutation.isPending}
                data-testid="button-quick-review"
              >
                Code review tips
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="text-xs"
                onClick={() => handleQuickAction('What are effective testing strategies?')}
                disabled={sendMessageMutation.isPending}
                data-testid="button-quick-testing"
              >
                Testing strategies
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
