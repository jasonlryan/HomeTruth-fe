import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, ChevronDown, FileText, MoreVertical, Sparkles } from "lucide-react";
import PageTitle from "../components/PageTitle";
import { getUserDocuments, deleteDocument, uploadDocument, askDocumentAI, getDocumentPreview, getDocumentChats } from "../api/api";

export default function Documents() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("earliest"); // "earliest" | "latest" | "name"
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(null);
  const [showAskAI, setShowAskAI] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [askAIQuestion, setAskAIQuestion] = useState("");
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatPagination, setChatPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [isLoadingChatHistory, setIsLoadingChatHistory] = useState(false);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: [],
    status: [],
    type: [],
    tags: [],
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [processingMessage, setProcessingMessage] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fileInputRef = useRef(null);
  const filterRef = useRef(null);
  const sortRef = useRef(null);
  const contextMenuRef = useRef(null);

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        sort_by: sortBy === "name" ? "name" : "created_at",
        sort_order: sortBy === "latest" ? "DESC" : "ASC",
      };
      if (filters.category.length > 0) params.category = filters.category[0];
      if (filters.status.length > 0) params.status = filters.status[0];
      if (filters.type.length > 0) params.type = filters.type[0];

      const response = await getUserDocuments(params);

      let documentsData = [];
      if (response?.data?.documents) documentsData = Array.isArray(response.data.documents) ? response.data.documents : [];
      else if (Array.isArray(response?.data)) documentsData = response.data;
      else if (Array.isArray(response)) documentsData = response;

      setDocuments(documentsData);
      setPagination((prev) => ({
        ...prev,
        total: (response && (response.total || response.count)) || 0,
      }));
    } catch (e) {
      setError("Failed to fetch documents");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy, filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Handle preview parameter from URL
  useEffect(() => {
    const previewId = searchParams.get('preview');
    if (previewId && documents.length > 0) {
      const documentToPreview = documents.find(doc => doc.id.toString() === previewId);
      if (documentToPreview) {
        handleDocumentClick(documentToPreview);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run when URL or documents change
  }, [searchParams, documents]);

  // Lock background scroll when Ask AI is open
  useEffect(() => {
    if (showAskAI) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => (document.body.style.overflow = prev);
    }
  }, [showAskAI]);

  // ESC to close
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setShowAskAI(false);
    if (showAskAI) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAskAI]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside any context menu button or menu dropdown
      const isClickInsideMenu = event.target.closest('.context-menu-container');
      
      if (!isClickInsideMenu && showContextMenu) {
        setShowContextMenu(null);
      }
    };

    if (showContextMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showContextMenu]);

  // Handlers
  const handleDeleteDocument = async (documentId) => {
    try {
      await deleteDocument(documentId);
      setDocuments((prev) => prev.filter((d) => d.id !== documentId));
    } catch {
      setError("Failed to delete document");
    }
  };

  const handleFileUpload = async (files) => {
    const validFiles = Array.from(files).filter((file) => {
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/jpg",
      ];
      const maxSize = 10 * 1024 * 1024;
      return validTypes.includes(file.type) && file.size <= maxSize;
    });

    if (validFiles.length === 0) {
      setError("No valid files to upload");
      return;
    }

    setLoading(true);
    setError(null);
    setProcessingMessage("Reviewing your document…");

    let uploadSuccess = false;
    for (const file of validFiles) {
      try {
        const formData = new FormData();
        formData.append("documents", file);
        await uploadDocument(formData);
        uploadSuccess = true;
      } catch {
        setError(`Failed to upload ${file.name}`);
        setProcessingMessage(null);
      }
    }

    if (uploadSuccess) {
      setTimeout(async () => {
        await fetchDocuments();
      }, 1000);
      setSuccessMessage(`Successfully uploaded ${validFiles.length} file(s)`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }

    setUploadedFiles([]);
    setLoading(false);
    setProcessingMessage(null);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files || []);
    handleFileUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const removeFile = (index) => setUploadedFiles((prev) => prev.filter((_, i) => i !== index));

  const handleDocumentClick = async (document) => {
    setSelectedDocument(document);
    setDocuments((prev) => prev.map((d) => ({ ...d, selected: d.id === document.id })));
    setShowAskAI(true);
    
    // Load chat history for this document
    await loadChatHistory(document.id);
  };

  const handleContextMenu = (e, documentId) => {
    e.preventDefault();
    setShowContextMenu(documentId);
  };

  const handleOpenDocument = async (document) => {
    setSelectedDocument(document);
    setShowContextMenu(null);
    setShowDocumentModal(true);
    setDocumentPreview(null);
    setPreviewError(null);
    
    // Fetch document preview
    if (document?.id) {
      setIsLoadingPreview(true);
      try {
        const preview = await getDocumentPreview(document.id);
        setDocumentPreview(preview);
      } catch (error) {
       
        setPreviewError(`Failed to load document preview: ${error.response?.data?.message || error.message}`);
      } finally {
        setIsLoadingPreview(false);
      }
    }
  };

  const handleSortChange = (sortType) => {
    setSortBy(sortType);
    setShowSortDropdown(false);
  };


  const handleCloseAskAI = () => {
    setShowAskAI(false);
    setAskAIQuestion("");
    setChatHistory([]);
  };

  const loadChatHistory = async (documentId, page = 1) => {
    setIsLoadingChatHistory(true);
    try {
      const response = await getDocumentChats(documentId, {
        page,
        limit: chatPagination.limit
      });
      
      if (response?.data?.chats && Array.isArray(response.data.chats)) {
        const formattedHistory = response.data.chats.map(chat => ({
          id: chat.id,
          question: chat.question || chat.user_message,
          answer: chat.answer || chat.assistant_reply,
          created_at: chat.created_at,
          has_context: chat.has_context || false
        }));
        
        setChatHistory(formattedHistory);
        setChatPagination(prev => ({
          ...prev,
          page,
          total: response.data.total || response.total || 0
        }));
      } else {
        setChatHistory([]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      setChatHistory([]);
    } finally {
      setIsLoadingChatHistory(false);
    }
  };

  const handleAskAISubmit = async () => {
    if (!askAIQuestion.trim() || !selectedDocument?.id || isAskingAI) return;
    
    setIsAskingAI(true);
    
    try {
      const response = await askDocumentAI(selectedDocument.id, askAIQuestion);
      
      // Handle new API response structure
      if (response?.success && response?.data) {
        const { current_answer } = response.data;
        
        // Add the new Q&A to chat history immediately
        const newChatEntry = {
          id: `temp_${Date.now()}`,
          question: askAIQuestion,
          answer: current_answer || "No response received",
          created_at: new Date().toISOString(),
          has_context: false
        };
        
        setChatHistory(prev => [newChatEntry, ...prev]);
        
        // Clear the input field after successful response
        setAskAIQuestion("");
        
        // Reload chat history to get the updated list from server
        setTimeout(async () => {
          await loadChatHistory(selectedDocument.id);
        }, 1000);
      } else {
        // Fallback for old API structure
        
        // Add the new Q&A to chat history immediately
        const newChatEntry = {
          id: `temp_${Date.now()}`,
          question: askAIQuestion,
          answer: response?.data?.answer || response?.answer || "No response received",
          created_at: new Date().toISOString(),
          has_context: false
        };
        
        setChatHistory(prev => [newChatEntry, ...prev]);
        
        // Clear the input field after successful response
        setAskAIQuestion("");
      }
    } catch (error) {
      console.error("Error asking AI:", error);
    } finally {
      setIsAskingAI(false);
    }
  };

  const filterOptions = {
    category: ["Financial", "Legal", "Maintenance", "Compliance", "Surveys & Reports", "Property Details"],
    status: ["Processing", "Urgent", "Expiring", "Ready", "Error"],
    type: [
      "Lease Agreement",
      "Title Deed",
      "EPC Certificate",
      "Property Survey Report",
      "Mortgage in Principle Letter",
      "Proof of Identity",
      "Proof of Address",
      "Financial Statement",
    ],
    tags: ["Lease", "Tenant", "Ownership", "EPC", "Energy", "Survey", "Mortgage", "Utilities", "Bank"],
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter((x) => x !== value)
        : [...prev[filterType], value],
    }));
  };

  const clearAllFilters = () => setFilters({ category: [], status: [], type: [], tags: [] });

  const applyFilters = () => {
    setShowFilters(false);
    // fetchDocuments(); // if needed
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "ready":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "expiring":
        return "bg-yellow-100 text-yellow-800";
      case "urgent":
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <div className="w-full max-w-[1440px] mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <PageTitle>Documents</PageTitle>
          {/* <button
            onClick={handleAskAIClick}
            className="flex items-center gap-2 px-4 py-2 bg-customActiveText text-white rounded-lg hover:bg-sky-500 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            Ask HomeTruth
          </button> */}
        </div>

        {/* Search + Filter + Sort */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative w-full sm:flex-1 sm:min-w-[18rem] sm:max-w-3xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search document..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 whitespace-nowrap"
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>

              {showFilters && (
                <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                      <button onClick={clearAllFilters} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Clear all
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Category */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Category</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {filterOptions.category.map((option) => (
                            <label key={option} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={filters.category.includes(option)}
                                onChange={() => handleFilterChange("category", option)}
                                className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Status</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {filterOptions.status.map((option) => (
                            <label key={option} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={filters.status.includes(option)}
                                onChange={() => handleFilterChange("status", option)}
                                className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Type */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Type</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {filterOptions.type.map((option) => (
                            <label key={option} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={filters.type.includes(option)}
                                onChange={() => handleFilterChange("type", option)}
                                className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Tags */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Tags</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {filterOptions.tags.map((option) => (
                            <label key={option} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={filters.tags.includes(option)}
                                onChange={() => handleFilterChange("tags", option)}
                                className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-8">
                      <button onClick={applyFilters} className="px-6 py-2 bg-[#4A90E2] text-white rounded-lg hover:bg-blue-700 transition">
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 whitespace-nowrap"
              >
                Sort {sortBy === "earliest" ? "Earliest" : sortBy === "latest" ? "Latest" : "Name"}
                <ChevronDown className="w-4 h-4" />
              </button>

              {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => handleSortChange("earliest")}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${sortBy === "earliest" ? "bg-blue-50 text-blue-600" : ""}`}
                  >
                    Earliest
                  </button>
                  <button
                    onClick={() => handleSortChange("latest")}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${sortBy === "latest" ? "bg-blue-50 text-blue-600" : ""}`}
                  >
                    Latest
                  </button>
                  <button
                    onClick={() => handleSortChange("name")}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${sortBy === "name" ? "bg-blue-50 text-blue-600" : ""}`}
                  >
                    Name
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upload area */}
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center bg-white mb-8 cursor-pointer transition-colors ${
            isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-gray-400 text-7xl">upload</span>
            </div>
            <p className="text-gray-700 text-lg mb-2">Drag and drop your documents here</p>
            <p className="text-gray-500 text-sm">Supports PDF, DOCX, JPG (max 10MB)</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.jpg,.jpeg"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </div>

        {/* Uploaded (local) list */}
        {uploadedFiles.length > 0 && (
          <div className="mb-8 bg-white rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Uploaded Files</h3>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={`uploaded-${file.name}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing Message */}
        {processingMessage && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-blue-600 font-medium">{processingMessage}</p>
            </div>
          </div>
        )}

        {/* Error / Success / Loading */}
        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"><p className="text-red-600">{error}</p></div>}
        {successMessage && <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg"><p className="text-green-600">{successMessage}</p></div>}
        {loading && (
          <div className="flex flex-col justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading documents...</p>
          </div>
        )}

        {/* Documents */}
        {!loading && (
          <div className="space-y-4">
            {!Array.isArray(documents) || documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No documents found</p>
              </div>
            ) : (
              documents.map((document) => (
                <div
                  key={document.id}
                  className={`flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-customActive cursor-pointer ${
                    document.selected ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleDocumentClick(document)}
                >
                  <FileText className="w-8 h-8 text-gray-400 mr-4" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{document.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{document.doc_type || document.category || "Document"}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                      {document.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {document.created_at ? new Date(document.created_at).toLocaleDateString() : "No date"}
                    </span>

                    <div className="relative context-menu-container" ref={contextMenuRef}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContextMenu(e, document.id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>

                      {showContextMenu === document.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-10">
                          <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDocument(document);
                            }}
                          >
                            Open
                          </button>
                          <button
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDocument(document.id);
                              setShowContextMenu(null);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pro banner */}
        <div className="mt-8 bg-gradient-to-r from-sky-500/95 via-indigo-400/95 to-violet-400/95 rounded-xl p-6 text-white text-center">
          <div className="mb-4">
            <h3 className="text-3xl font-semibold mb-2">Upload Reminder</h3>
            <p className="text-white/90 text-2xl max-w-5xl mx-auto">
              {/* You have 28 days left in your 3-month free upload period. Upgrade to Pro for unlimited document uploads. */}
You’ve got 3 months of unlimited questions , explore freely while it’s active!






            </p>
          </div>
          {/* <button className="bg-white text-customActiveText px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition border border-customActiveText">
            Upgrade to Pro
          </button> */}
        </div>
      </div>

      {/* Ask HomeTruth overlay */}
      {showAskAI && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={handleCloseAskAI} />
          <div
            className="absolute right-0 top-0 h-full w-full sm:w-[28rem] lg:w-[32rem] bg-white border-l border-gray-200 shadow-2xl
                       transform transition-transform duration-300 ease-out translate-x-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-inter h-full overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Ask HomeTruth about {selectedDocument ? selectedDocument.name : "Document"}
                </h2>
                <button onClick={handleCloseAskAI} className="text-gray-400 hover:text-gray-600" aria-label="Close">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedDocument ? selectedDocument.name : "No document selected"}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedDocument ? selectedDocument.doc_type || selectedDocument.category || "Document" : "Select a document"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ask a Question related to your document:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={askAIQuestion}
                    onChange={(e) => setAskAIQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAskAISubmit()}
                    placeholder="e.g. 'When does my tenancy agreement expire?'"
                    className="w-full px-4 py-3 pr-14 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAskAISubmit}
                    disabled={isAskingAI || !askAIQuestion.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-customActiveText text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAskingAI ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                    <Sparkles className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Chat History - No scroll, full display */}
              {chatHistory.length > 0 && (
                <div className="mb-6">
                  <div className="space-y-4">
                    {chatHistory.map((chat, index) => (
                      <div key={chat.id || index} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="mb-2">
                          <p className="font-semibold text-gray-900">Q: {chat.question}</p>
                        </div>
                        <div className="mb-2">
                          <p className="font-semibold text-gray-900">A: {chat.answer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading Chat History */}
              {isLoadingChatHistory && (
                <div className="mb-6">
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading chat history...</span>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isAskingAI && (
                <div className="mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-gray-600">Reviewing your question…</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowDocumentModal(false)} />
          <div
            className="absolute inset-0 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-gray-400" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedDocument?.name}</h2>
                    <p className="text-sm text-gray-500">{selectedDocument?.doc_type || selectedDocument?.category || "Document"}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDocumentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Document Preview Area */}
                <div className="mb-6">
                  <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                    {isLoadingPreview ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading document preview...</p>
                      </div>
                    ) : previewError ? (
                      <div className="text-center">
                        <FileText className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <p className="text-red-500 text-lg">Preview Error</p>
                        <p className="text-red-400 text-sm">{previewError}</p>
                      </div>
                    ) : documentPreview ? (
                      <div className="w-full h-full flex items-center justify-center">
                        {documentPreview.imageUrl || documentPreview.image || documentPreview.preview_url ? (
                          <img 
                            src={documentPreview.imageUrl || documentPreview.image || documentPreview.preview_url} 
                            alt="Document Preview" 
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : documentPreview.preview_content ? (
                          <div className="p-4 text-left w-full h-full overflow-auto">
                            <div className="whitespace-pre-wrap text-sm text-gray-700">
                              {documentPreview.preview_content}
                            </div>
                          </div>
                        ) : documentPreview.text || documentPreview.content ? (
                          <div className="p-4 text-left w-full h-full overflow-auto">
                            <div className="whitespace-pre-wrap text-sm text-gray-700">
                              {documentPreview.text || documentPreview.content}
                            </div>
                          </div>
                        ) : documentPreview.url || documentPreview.previewUrl ? (
                          <iframe 
                            src={documentPreview.url || documentPreview.previewUrl} 
                            className="w-full h-full border-0"
                            title="Document Preview"
                          />
                        ) : (
                          <div className="text-center">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">Document Preview</p>
                            <p className="text-gray-400 text-sm">Preview format not supported</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">First Page Preview</p>
                        <p className="text-gray-400 text-sm">Document preview will be available here</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Document Details */}
                <div className="mb-6">
                  <div className="space-y-3">
                    {/* Document Name */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-medium">{selectedDocument?.name}</span>
                      <span className="text-gray-600">{selectedDocument?.doc_type || selectedDocument?.category || "Document"}</span>
                    </div>
                    
                    {/* Status */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDocument?.status)}`}>
                        {selectedDocument?.status || "Ready"}
                      </span>
                    </div>
                    
                    {/* File Size */}
                    {selectedDocument?.file_size && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">File Size</span>
                        <span className="text-gray-900">{selectedDocument.file_size}</span>
                      </div>
                    )}
                    
                    {/* File Type */}
                    {selectedDocument?.file_type && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">File Type</span>
                        <span className="text-gray-900">{selectedDocument.file_type}</span>
                      </div>
                    )}
                    
                    {/* Tags */}
                    {selectedDocument?.tags && Array.isArray(selectedDocument.tags) && selectedDocument.tags.length > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Tags</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedDocument.tags.map((tag, index) => (
                            <span key={`tag-${selectedDocument.id}-${index}`} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Added Date */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Added</span>
                      <span className="text-gray-900">
                        {selectedDocument?.created_at ? new Date(selectedDocument.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        }) : "No date"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowDocumentModal(false);
                      setShowAskAI(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-customActiveBlue text-white rounded-lg hover:bg-sky-500 active:bg-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 transition-colors"
                  >
                    <Sparkles className="w-5 h-5" />
                    Ask HomeTruth
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
