"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchStore } from "@/store/searchStore";
import { useDocumentStore } from "@/store/documentStore";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faSpinner, faFileLines, faClockRotateLeft, faFilter, faTimes } from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "@/lib/utils";

export default function SearchPage() {
  const { query, setQuery, results, isSearching, history, search, fetchHistory, selectedDocumentIds, toggleDocumentFilter } = useSearchStore();
  const { documents, fetchDocuments } = useDocumentStore();
  const [showHistory, setShowHistory] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchDocuments();
    fetchHistory();
  }, [fetchDocuments, fetchHistory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      search(query.trim());
      setShowHistory(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Semantic Search</h1>
        <p className="text-gray-500 dark:text-surface-400 mt-1">Search across your documents with AI-powered understanding</p>
      </div>

      <form onSubmit={handleSearch}>
        <div className="relative">
          <Input
            placeholder="Ask anything about your documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-base sm:text-lg py-3 sm:py-4 pr-28 sm:pr-36"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl transition-colors ${showFilters ? 'bg-primary-500/20 text-primary-400' : 'text-gray-500 dark:text-surface-400 hover:text-gray-700 dark:hover:text-surface-200 hover:bg-gray-100 dark:hover:bg-surface-700'}`}
            >
              <FontAwesomeIcon icon={faFilter} className="h-4 w-4" />
            </button>
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="p-2 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {isSearching ? (
                <FontAwesomeIcon icon={faSpinner} className="h-5 w-5 text-white animate-spin" />
              ) : (
                <FontAwesomeIcon icon={faMagnifyingGlass} className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </form>

      {showFilters && documents.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600 dark:text-surface-300">Filter by document</h3>
            {selectedDocumentIds.length > 0 && (
              <button onClick={() => { selectedDocumentIds.forEach(id => toggleDocumentFilter(id)); }} className="text-xs text-primary-400 hover:text-primary-300">
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => toggleDocumentFilter(doc.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  selectedDocumentIds.includes(doc.id)
                    ? "bg-primary-500/10 border-primary-500/30 text-primary-400"
                    : "bg-gray-100/30 dark:bg-surface-700/30 border-gray-200/30 dark:border-surface-600/30 text-gray-500 dark:text-surface-400 hover:text-gray-700 dark:hover:text-surface-200 hover:border-gray-300 dark:hover:border-surface-500"
                }`}
              >
                {doc.originalName}
              </button>
            ))}
          </div>
        </Card>
      )}

      {showHistory && history.length > 0 && !results.length && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <FontAwesomeIcon icon={faClockRotateLeft} className="h-4 w-4 text-gray-500 dark:text-surface-400" />
            <h3 className="text-sm font-medium text-gray-600 dark:text-surface-300">Recent Searches</h3>
          </div>
          <div className="space-y-2">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setQuery(item.query);
                  search(item.query);
                  setShowHistory(false);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white dark:bg-surface-800/50 hover:bg-gray-100 dark:hover:bg-surface-700/50 transition-colors text-left"
              >
                <span className="text-sm text-gray-600 dark:text-surface-300 truncate mr-2">{item.query}</span>
                <span className="text-xs text-gray-400 dark:text-surface-500 flex-shrink-0">{formatDate(item.createdAt)}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {isSearching && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {results.length > 0 && !isSearching && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-surface-400">
              Found {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
          </div>
          {results.map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-4 hover:border-primary-500/30 transition-all">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FontAwesomeIcon icon={faFileLines} className="h-4 w-4 text-primary-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 dark:text-surface-200 truncate">{result.documentName}</span>
                  </div>
                  <Badge variant="info" size="sm" className="flex-shrink-0">
                    {(result.similarity * 100).toFixed(1)}% match
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-surface-300 leading-relaxed break-words">{result.content}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
