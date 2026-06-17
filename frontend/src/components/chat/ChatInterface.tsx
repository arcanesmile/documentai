"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useChatStore } from "@/store/chatStore";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faTrash,
  faPlus,
  faRobot,
  faUser,
  faChevronLeft,
  faComments,
  faStop,
  faCopy,
  faChevronDown,
  faChevronRight,
  faArrowRotateRight,
  faTriangleExclamation,
  faRotate,
} from "@fortawesome/free-solid-svg-icons";
import type { SearchResult } from "@/types";

const SUGGESTIONS = [
  "What documents have I uploaded?",
  "Summarize my latest document",
  "Search for information about AI",
  "What can you help me with?",
];

export default function ChatInterface() {
  const {
    conversations,
    currentConversation,
    messages,
    isStreaming,
    error,
    fetchConversations,
    createConversation,
    selectConversation,
    sendMessage,
    stopStreaming,
    deleteConversation,
    regenerateLast,
    clearError,
  } = useChatStore();

  const [input, setInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming) return;
    const message = input.trim();
    setInput("");
    await sendMessage(message);
  }, [input, isStreaming, sendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleCopy = useCallback(async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  }, []);

  const handleSelectConversation = (id: string) => {
    selectConversation(id);
    setShowSidebar(false);
  };

  const handleNewChat = () => {
    createConversation();
    setShowSidebar(false);
  };

  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id;

  return (
    <>
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSidebar(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-[280px] bg-white dark:bg-surface-900 border-r border-gray-200/50 dark:border-surface-700/50 z-50 lg:hidden"
          >
            <div className="p-4 border-b border-gray-200/50 dark:border-surface-700/50">
              <button
                onClick={() => setShowSidebar(false)}
                className="p-1.5 rounded-lg text-gray-500 dark:text-surface-400 hover:text-gray-900 dark:hover:text-surface-100 hover:bg-gray-100 dark:hover:bg-surface-800 transition-colors mb-3"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
              </button>
              <button
                onClick={handleNewChat}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 hover:bg-primary-500/20 transition-all text-sm font-medium"
              >
                <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
                New Chat
              </button>
            </div>
            <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
              {conversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => handleSelectConversation(conv._id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all text-sm ${
                    currentConversation?._id === conv._id
                      ? "bg-primary-500/10 border border-primary-500/20 text-primary-400"
                      : "bg-gray-100/30 dark:bg-surface-800/30 border border-transparent text-gray-500 dark:text-surface-400 hover:bg-gray-200/50 dark:hover:bg-surface-800/50 hover:text-gray-700 dark:hover:text-surface-200"
                  }`}
                >
                  <span className="truncate flex-1">{conv.title || "New Chat"}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv._id);
                    }}
                    className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-surface-700 text-gray-400 dark:text-surface-500 hover:text-red-400 transition-all flex-shrink-0 ml-2"
                  >
                    <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                  </button>
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex h-[calc(100vh-8rem)] gap-4">
        <div className="hidden lg:flex lg:flex-col w-72 flex-shrink-0 space-y-2">
          <button
            onClick={createConversation}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 hover:bg-primary-500/20 transition-all text-sm font-medium"
          >
            <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
            New Chat
          </button>
          <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-12rem)]">
            {conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => selectConversation(conv._id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all text-sm ${
                  currentConversation?._id === conv._id
                    ? "bg-primary-500/10 border border-primary-500/20 text-primary-400"
                    : "bg-surface-800/30 border border-transparent text-surface-400 hover:bg-surface-800/50 hover:text-surface-200"
                }`}
              >
                <span className="truncate flex-1">{conv.title || "New Chat"}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv._id);
                  }}
                    className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-surface-700 text-gray-400 dark:text-surface-500 hover:text-red-400 opacity-0 hover:opacity-100 transition-all flex-shrink-0"
                >
                  <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                </button>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white dark:bg-surface-800/30 border border-gray-200/50 dark:border-surface-700/50 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 p-3 border-b border-gray-200/50 dark:border-surface-700/50 lg:hidden">
            <button
              onClick={() => setShowSidebar(true)}
              className="p-2 rounded-lg text-gray-500 dark:text-surface-400 hover:text-gray-900 dark:hover:text-surface-100 hover:bg-gray-100 dark:hover:bg-surface-800 transition-colors"
            >
              <FontAwesomeIcon icon={faComments} className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-gray-600 dark:text-surface-300 truncate">
              {currentConversation?.title || "New Chat"}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-4">
                  <FontAwesomeIcon icon={faRobot} className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-surface-200 mb-2">Start a Conversation</h3>
                <p className="text-sm text-gray-500 dark:text-surface-400 max-w-md mb-6">
                  Ask me anything about your documents. I can search through your uploaded files and provide intelligent answers.
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput("");
                        sendMessage(suggestion);
                      }}
                      disabled={isStreaming}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 text-sm text-gray-600 dark:text-surface-300 hover:bg-gray-100 dark:hover:bg-surface-700 hover:text-gray-900 dark:hover:text-surface-100 hover:border-primary-500/30 transition-all disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                        <FontAwesomeIcon icon={faRobot} className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`group max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-primary-500/10 border border-primary-500/20 text-gray-700 dark:text-surface-200"
                          : "bg-white dark:bg-surface-800/80 border border-gray-200/50 dark:border-surface-700/50 text-gray-700 dark:text-surface-200"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <>
                          <div className="prose-custom text-sm">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content || ""}
                            </ReactMarkdown>
                            {isStreaming && idx === messages.length - 1 && msg.content && (
                              <span className="inline-block w-2 h-4 bg-primary-400 animate-pulse ml-0.5" />
                            )}
                          </div>

                          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleCopy(msg.content, msg.id)}
                              className="p-1.5 rounded-lg text-gray-400 dark:text-surface-500 hover:text-gray-700 dark:hover:text-surface-200 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all text-xs"
                              title="Copy message"
                            >
                              <FontAwesomeIcon icon={copiedId === msg.id ? faCopy : faCopy} className="h-3.5 w-3.5" />
                              {copiedId === msg.id && <span className="ml-1 text-xs text-green-400">Copied</span>}
                            </button>
                            {msg.sources && msg.sources.length > 0 && (
                              <SourcesDropdown sources={msg.sources} />
                            )}
                            {msg.id === lastAssistantId && !isStreaming && (
                              <button
                                onClick={regenerateLast}
                              className="p-1.5 rounded-lg text-gray-400 dark:text-surface-500 hover:text-gray-700 dark:hover:text-surface-200 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all text-xs"
                                title="Regenerate response"
                              >
                                <FontAwesomeIcon icon={faRotate} className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-surface-700 flex items-center justify-center flex-shrink-0">
                        <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-gray-600 dark:text-surface-300" />
                      </div>
                    )}
                  </motion.div>
                ))}
                {isStreaming && messages[messages.length - 1]?.content === "" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <FontAwesomeIcon icon={faRobot} className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-white dark:bg-surface-800/80 border border-gray-200/50 dark:border-surface-700/50 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                        <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 mx-auto max-w-lg"
              >
                <FontAwesomeIcon icon={faTriangleExclamation} className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{error}</span>
                <button
                  onClick={clearError}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 transition-all"
                >
                  <FontAwesomeIcon icon={faArrowRotateRight} className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-gray-200/50 dark:border-surface-700/50">
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question about your documents..."
                rows={1}
                className="flex-1 bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-surface-200 placeholder-gray-400 dark:placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all resize-none max-h-[200px]"
                disabled={isStreaming}
              />
              {isStreaming ? (
                <button
                  type="button"
                  onClick={stopStreaming}
                  className="px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 transition-all flex items-center gap-2 text-sm font-medium text-white"
                >
                  <FontAwesomeIcon icon={faStop} className="h-4 w-4" />
                  Stop
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="px-4 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <FontAwesomeIcon icon={faPaperPlane} className="h-5 w-5 text-white" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function SourcesDropdown({ sources }: { sources: SearchResult[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg text-gray-400 dark:text-surface-500 hover:text-gray-700 dark:hover:text-surface-200 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all text-xs flex items-center gap-1"
        title="View sources"
      >
        <FontAwesomeIcon icon={open ? faChevronDown : faChevronRight} className="h-3 w-3" />
        <span className="text-xs">{sources.length} source{sources.length > 1 ? "s" : ""}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute bottom-full left-0 mb-2 w-72 max-h-60 overflow-y-auto bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-700 rounded-xl shadow-xl p-2 space-y-1"
          >
            {sources.map((source, i) => (
              <div key={source.id || i} className="p-2 rounded-lg bg-gray-50 dark:bg-surface-900/50 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-medium text-gray-700 dark:text-surface-200 truncate">{source.documentName}</span>
                  <span className="text-gray-400 dark:text-surface-500 flex-shrink-0">{(source.similarity * 100).toFixed(0)}%</span>
                </div>
                <p className="text-gray-500 dark:text-surface-400 line-clamp-2">{source.content}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
