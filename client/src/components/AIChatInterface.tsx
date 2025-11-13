import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Loader2, Mic, X } from "lucide-react";
import { Streamdown } from "streamdown";

interface Message {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

export default function AIChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Fetch chat history
  const historyQuery = trpc.ai.getHistory.useQuery();
  const chatMutation = trpc.ai.chat.useMutation();

  // Load history on mount
  useEffect(() => {
    if (historyQuery.data) {
      const loadedMessages = historyQuery.data.map((msg) => ({
        id: msg.id.toString(),
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
        timestamp: new Date(msg.createdAt),
      }));
      setMessages(loadedMessages.reverse());
    }
  }, [historyQuery.data]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await chatMutation.mutateAsync({ message: input });
      const assistantMessage: Message = {
        role: "assistant",
        content: response.message,
        timestamp: response.timestamp,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        // TODO: Send audio to Whisper API for transcription
        // For now, just show a placeholder
        const userMessage: Message = {
          role: "user",
          content: "[Voice message - transcription coming soon]",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access error:", error);
      alert("Unable to access microphone. Please check permissions.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center z-40"
        title="Ask HomeBrain"
      >
        <MessageIcon />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div>
          <h3 className="font-semibold">HomeBrain Assistant</h3>
          <p className="text-sm text-blue-100">Your family AI helper</p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="text-white hover:bg-blue-700"
          onClick={() => setIsOpen(false)}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
            <div className="text-4xl mb-3">🤖</div>
            <p className="font-semibold">Hi! I'm HomeBrain</p>
            <p className="text-sm mt-2">Ask me to manage your calendar, tasks, meals, and more!</p>
            <div className="mt-4 space-y-2 text-xs">
              <p>Try saying:</p>
              <ul className="text-left">
                <li>• "Add dentist appointment Thursday 3 PM"</li>
                <li>• "What's our meal plan for today?"</li>
                <li>• "Mark homework as done"</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Streamdown>{msg.content}</Streamdown>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800 rounded-b-lg">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask HomeBrain..."
            className="flex-1"
            disabled={chatMutation.isPending || isRecording}
          />
          <Button
            type="button"
            size="icon"
            variant={isRecording ? "default" : "outline"}
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={chatMutation.isPending}
            title={isRecording ? "Stop recording" : "Start voice input"}
          >
            <Mic className={`w-4 h-4 ${isRecording ? "animate-pulse" : ""}`} />
          </Button>
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || chatMutation.isPending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}

function MessageIcon() {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}
