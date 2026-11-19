import HTGlyph from "../components/HTGlyph";
import DocumentWorkspace from '../components/DocumentWorkspace';
import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import PageTitle from "../components/PageTitle";
import { Status } from "../components/homepage/HomeTruth";
import "../components/workspace.css";
import { getUserDocuments, getFollowUpPassage, getUserDocumentRecord, deleteDocument, uploadDocument } from "../api/api";

export default function Documents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { state } = useLocation();
  const followUpId = searchParams.get("followUp");
  const sourcePropertyId = Number(followUpId ? searchParams.get("propertyId") : state?.sourcePropertyId);
  const fromControlCentre = Boolean(followUpId || state?.fromControlCentre);
  const [passageResult, setPassageResult] = useState(null);
  const hasSourceProperty = Number.isSafeInteger(sourcePropertyId) && sourcePropertyId > 0;
  const returnState = followUpId && hasSourceProperty ? { sourcePropertyId, fromControlCentre: true } : state;
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("earliest"); // "earliest" | "latest" | "name"
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(null);
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
  const requestVersion = useRef(0);

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    const version = ++requestVersion.current;
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
      if (version !== requestVersion.current) return;

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
      if (version !== requestVersion.current) return;
      setError("Failed to fetch documents");
      setDocuments([]);
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, [searchQuery, sortBy, filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchDocuments();
    return () => { requestVersion.current += 1; };
  }, [fetchDocuments]);

  // Resolve deep links independently of the current list page/filter.
  useEffect(() => {
    const id = searchParams.get('preview');
    if (!id || searchParams.has('followUp')) { setSelectedDocument(null); return; }
    const controller = new AbortController();
    let active = true;
    setSelectedDocument(current => String(current?.id) === id ? current : null);
    getUserDocumentRecord(id, controller.signal).then(response => {
      if (!active) return;
      if (!response?.success || !response?.data?.id) throw new Error('Unavailable');
      setSelectedDocument(response.data);
    }).catch(err => {
      if (active && err.code !== 'ERR_CANCELED') {
        setSelectedDocument(null);
        setError('This document could not be opened. It may be unavailable or outside your access.');
      }
    });
    return () => { active = false; controller.abort(); };
  }, [searchParams]);

  useEffect(() => {
    if (!followUpId || !hasSourceProperty) return;
    const controller = new AbortController();
    const resultKey = `${sourcePropertyId}:${followUpId}`;
    async function openPassage() {
      try {
        const passage = await getFollowUpPassage(sourcePropertyId, followUpId, controller.signal);
        const response = await getUserDocumentRecord(passage.documentId, controller.signal);
        if (!response?.success || !response.data?.id) throw new Error("Document unavailable");
        if (!controller.signal.aborted) setPassageResult({ resultKey, passage, document: response.data });
      } catch {
        if (!controller.signal.aborted) setPassageResult({ resultKey, error: true });
      }
    }
    openPassage();
    return () => controller.abort();
  }, [followUpId, hasSourceProperty, sourcePropertyId]);

  const activePassage = passageResult?.resultKey === `${sourcePropertyId}:${followUpId}` ? passageResult : null;
  const openDocument = followUpId ? activePassage?.document : selectedDocument;

  function closeWorkspace() {
    setSelectedDocument(null);
    setPassageResult(null);
    const next = new URLSearchParams(searchParams);
    next.delete("preview");
    next.delete("followUp");
    next.delete("propertyId");
    setSearchParams(next, { replace: true, state: returnState });
  }

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

  const handleDocumentClick = (doc) => {
    setSelectedDocument(doc);
    if (followUpId || searchParams.get('preview') !== String(doc.id)) {
      const next = new URLSearchParams(searchParams);
      next.delete('followUp');
      next.delete('propertyId');
      next.set('preview', String(doc.id));
      setSearchParams(next, { replace: true, state: returnState });
    }
    setShowContextMenu(null);
  };

  const handleContextMenu = (e, documentId) => {
    e.preventDefault();
    setShowContextMenu(documentId);
  };

  const handleOpenDocument = handleDocumentClick;

  const handleSortChange = (sortType) => {
    setSortBy(sortType);
    setShowSortDropdown(false);
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

  const getStatusTone = (status) => {
    switch ((status || "").toLowerCase()) {
      case "ready":
        return "success";
      case "processing":
        return "progress";
      case "expiring":
        return "review";
      case "urgent":
      case "error":
        return "error";
      default:
        return "neutral";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="ht-workspace-page">
        {/* Header */}
        <header className="ht-workspace-title-row">
          <PageTitle>Vault</PageTitle>
          {hasSourceProperty && (
            <Link className="ht-workspace-control" to={fromControlCentre ? `/control-centre?propertyId=${sourcePropertyId}` : `/property-profile?propertyId=${sourcePropertyId}#property-next-actions`}>
              <HTGlyph name="arrow-left" size={16} /> {fromControlCentre ? "Back to Control centre" : "Back to home record"}
            </Link>
          )}
        </header>

        {followUpId && (!hasSourceProperty || activePassage?.error) && (
          <p role="alert" className="ht-workspace-state mb-4">The saved passage couldn’t be opened. The document may have been removed or may no longer be available to you.</p>
        )}
        {followUpId && hasSourceProperty && !activePassage && (
          <p role="status" className="ht-workspace-state mb-4">Opening the saved passage…</p>
        )}

        {/* Search + Filter + Sort */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative w-full sm:flex-1 sm:min-w-[18rem] sm:max-w-3xl">
              <HTGlyph name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                aria-label="Search documents"
                placeholder="Search documents"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ht-workspace-input w-full pl-10"
              />
            </div>

            {/* Filter */}
            <div className="relative" ref={filterRef} onKeyDown={event => {
              if (event.key !== "Escape" || !showFilters) return;
              setShowFilters(false);
              filterRef.current.querySelector("button").focus();
            }}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
                aria-controls="vault-filters"
                className="ht-workspace-control"
              >
                <HTGlyph name="filter" className="w-4 h-4" />
                Filter
              </button>

              {showFilters && (
                <div id="vault-filters" className="ht-panel ht-vault-filters">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                      <button onClick={clearAllFilters} className="text-ht-cyan hover:text-ht-cyan-light text-sm font-medium">
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
                                className="mr-3 rounded border-gray-300 text-ht-cyan focus:ring-ht-cyan"
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
                                className="mr-3 rounded border-gray-300 text-ht-cyan focus:ring-ht-cyan"
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
                                className="mr-3 rounded border-gray-300 text-ht-cyan focus:ring-ht-cyan"
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
                                className="mr-3 rounded border-gray-300 text-ht-cyan focus:ring-ht-cyan"
                              />
                              <span className="text-sm text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-8">
                      <button onClick={applyFilters} className="ht-workspace-primary">
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
                aria-expanded={showSortDropdown}
                className="ht-workspace-control"
              >
                Sort {sortBy === "earliest" ? "Earliest" : sortBy === "latest" ? "Latest" : "Name"}
                <HTGlyph name="chevron-down" className="w-4 h-4" />
              </button>

              {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => handleSortChange("earliest")}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${sortBy === "earliest" ? "bg-sky-50 text-ht-cyan" : ""}`}
                  >
                    Earliest
                  </button>
                  <button
                    onClick={() => handleSortChange("latest")}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${sortBy === "latest" ? "bg-sky-50 text-ht-cyan" : ""}`}
                  >
                    Latest
                  </button>
                  <button
                    onClick={() => handleSortChange("name")}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${sortBy === "name" ? "bg-sky-50 text-ht-cyan" : ""}`}
                  >
                    Name
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <section
          aria-label="Upload to Vault"
          className="ht-panel ht-vault-upload"
          data-dragging={isDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <HTGlyph name="upload" className="ht-workspace-muted" />
          <p>Drag and drop documents here, or choose files.</p>
          <p className="ht-workspace-muted">PDF, DOCX or JPG · up to 10 MB each</p>
          <button type="button" className="ht-workspace-control" onClick={() => fileInputRef.current?.click()}>Choose files</button>
          <input ref={fileInputRef} type="file" multiple accept=".pdf,.docx,.jpg,.jpeg" onChange={handleFileInput} hidden />
        </section>

        {/* Uploaded (local) list */}
        {uploadedFiles.length > 0 && (
          <div className="mb-8 bg-white rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Uploaded Files</h3>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={`uploaded-${file.name}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <HTGlyph name="document" size={20} className="text-gray-500" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button aria-label={`Remove ${file.name}`} onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 transition">
                    <HTGlyph name="close" size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing Message */}
        {processingMessage && (
          <div className="mb-4 p-4 bg-sky-50 border border-sky-100 rounded-lg">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-ht-cyan mr-3"></div>
              <p className="text-ht-cyan font-medium">{processingMessage}</p>
            </div>
          </div>
        )}

        {/* Error / Success / Loading */}
        {error && <p className="ht-workspace-state mb-4" role="alert">{error}</p>}
        {successMessage && <p className="ht-workspace-state mb-4" role="status">{successMessage}</p>}
        {loading && (
          <div className="ht-workspace-state" role="status">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ht-cyan mb-4"></div>
            <p className="text-gray-600">Loading documents...</p>
          </div>
        )}

        {/* Documents */}
        {!loading && (
          <div className="space-y-4">
            {!Array.isArray(documents) || documents.length === 0 ? (
              <div className="ht-workspace-state text-center">
                <HTGlyph name="document" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No documents found</p>
              </div>
            ) : (
              documents.map((document) => (
                <div
                  key={document.id}
                  className={`ht-panel flex flex-wrap items-center gap-2 ${
                    document.selected ? "bg-sky-50" : ""
                  }`}
                >
                  <button type="button" aria-label={`Open ${document.name}`} onClick={() => handleDocumentClick(document)} className="flex min-w-[100px] flex-1 items-center text-left">
                  <HTGlyph name="document" className="w-8 h-8 text-gray-400 mr-4" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{document.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{document.doc_type || document.category || "Document"}</p>
                  </div>
                  </button>

                  <div className="flex items-center gap-4">
                    <Status tone={getStatusTone(document.status)} appearance="pill">{document.status || "Unknown"}</Status>
                    <span className="text-sm text-gray-500">
                      {document.created_at ? new Date(document.created_at).toLocaleDateString() : "No date"}
                    </span>

                    <div className="relative context-menu-container" ref={contextMenuRef}>
                      <button aria-label="Document actions"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContextMenu(e, document.id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <HTGlyph name="more" className="w-4 h-4 text-gray-400" />
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
        <div className="mt-8 bg-ht-gradient-cool rounded-xl p-6 text-white text-center">
          <div className="mb-4">
            <h3 className="text-3xl font-semibold mb-2">Upload Reminder</h3>
            <p className="text-white/90 text-2xl max-w-5xl mx-auto">
              {/* You have 28 days left in your 3-month free upload period. Upgrade to Pro for unlimited document uploads. */}
You’ve got 3 months of unlimited questions , explore freely while it’s active!






            </p>
          </div>
          {/* <button className="bg-white text-ht-cyan px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition border border-ht-cyan">
            Upgrade to Pro
          </button> */}
        </div>
      </div>

      {openDocument && (
        <DocumentWorkspace key={followUpId ? `follow-up-${followUpId}` : openDocument.id} document={openDocument}
          propertyId={hasSourceProperty ? sourcePropertyId : undefined} savedPassage={activePassage?.passage} onClose={closeWorkspace} />
      )}
    </div>
  );
}
