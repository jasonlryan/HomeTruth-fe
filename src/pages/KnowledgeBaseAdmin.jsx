import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { uploadDocument, addKnowledgeBaseEntry, getKnowledgeBaseDocuments, getKnowledgeBaseStats, deleteKnowledgeBaseDocument, getKnowledgeBaseDocumentPreview, downloadKnowledgeBaseDocument } from "../api/api";
import { useAuth } from "../context/AuthContext";
import jsPDF from "jspdf";

export default function KnowledgeBaseAdmin() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [kbRecords] = useState(1215); // This would come from an API call
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [urlInputs, setUrlInputs] = useState([""]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [source, setSource] = useState("");
  const [tags, setTags] = useState([]);
  const [customTag, setCustomTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [showDocumentLibrary, setShowDocumentLibrary] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [deletingDocId, setDeletingDocId] = useState(null);
  const [previewDocId, setPreviewDocId] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [allDocuments, setAllDocuments] = useState([]); // Store all documents for searching
  const [filteredDocuments, setFilteredDocuments] = useState([]); // Filtered search results
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef(null);

  // Helper function to extract clear error messages from API errors
  const getErrorMessage = (error, defaultMessage = "An error occurred. Please try again.") => {
    // If error is a string, return it directly
    if (typeof error === 'string') {
      return error;
    }

    // Helper to extract error message from HTML
    const extractFromHTML = (htmlString) => {
      if (!htmlString || typeof htmlString !== 'string') return null;
      
      // Check if it's HTML
      if (!htmlString.includes('<') || !htmlString.includes('>')) {
        return null;
      }
      
      // Try to extract from <pre> tags (common error format)
      const preMatch = htmlString.match(/<pre[^>]*>(.*?)<\/pre>/is);
      if (preMatch) {
        let errorText = preMatch[1];
        // First, replace <br> tags with spaces (not newlines) to keep error message on one line
        errorText = errorText.replace(/<br\s*\/?>/gi, ' ');
        // Remove other HTML tags
        errorText = errorText.replace(/<[^>]+>/g, '');
        // Decode HTML entities
        errorText = errorText.replace(/&nbsp;/g, ' ');
        errorText = errorText.replace(/&lt;/g, '<');
        errorText = errorText.replace(/&gt;/g, '>');
        errorText = errorText.replace(/&amp;/g, '&');
        errorText = errorText.replace(/&quot;/g, '"');
        // Clean up multiple spaces
        errorText = errorText.replace(/\s+/g, ' ').trim();
        
        // Extract the first error line (before stack trace which starts with "at")
        if (errorText.includes('Error:')) {
          // Extract just the error message part (before "at" which indicates stack trace)
          const errorMatch = errorText.match(/Error:\s*(.+?)(?:\s+at\s|$)/i);
          if (errorMatch) {
            return errorMatch[1].trim();
          }
          // Or just take everything after "Error:" up to the first "at" or end
          const simpleMatch = errorText.match(/Error:\s*(.+?)(?:\s+at\s|$)/i);
          if (simpleMatch) {
            return simpleMatch[1].trim();
          }
          // Fallback: just take everything after "Error:" and before "at"
          const errorPart = errorText.match(/Error:\s*(.+)/i);
          if (errorPart) {
            return errorPart[1].split(/\s+at\s+/i)[0].trim();
          }
        }
        // If no "Error:" prefix, return first meaningful line
        return errorText.split('\n')[0]?.trim() || errorText;
      }
      
      // Try to extract from <body> or just find "Error:" pattern
      const errorMatch = htmlString.match(/Error:\s*([^<]+)/i);
      if (errorMatch) {
        return errorMatch[1].trim();
      }
      
      return null;
    };

    // Try to extract error message from various possible locations
    const errorData = error?.response?.data;
    
    if (errorData) {
      // Try different possible error message fields
      if (errorData.message) {
        return errorData.message;
      }
      if (errorData.error) {
        const errorMsg = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
        // Check if it's HTML
        const htmlExtracted = extractFromHTML(errorMsg);
        if (htmlExtracted) return htmlExtracted;
        return errorMsg;
      }
      if (errorData.detail) {
        return errorData.detail;
      }
      if (errorData.msg) {
        return errorData.msg;
      }
      // If errorData is a string, check if it's HTML
      if (typeof errorData === 'string') {
        const htmlExtracted = extractFromHTML(errorData);
        if (htmlExtracted) return htmlExtracted;
        return errorData;
      }
    }

    // Check for status code and provide helpful messages
    const status = error?.response?.status;
    if (status === 500) {
      // Try to extract actual error message from HTML response
      if (errorData) {
        const htmlExtracted = extractFromHTML(typeof errorData === 'string' ? errorData : JSON.stringify(errorData));
        if (htmlExtracted) {
          return htmlExtracted;
        }
      }
      return "Server error: The server encountered an unexpected error. Please try again later or contact support if the issue persists.";
    }
    if (status === 404) {
      return "Resource not found. Please check your request and try again.";
    }
    if (status === 403) {
      return "Access denied. You don't have permission to perform this action.";
    }
    if (status === 401) {
      return "Authentication required. Please log in again.";
    }
    if (status === 400) {
      return error?.response?.statusText || "Bad request. Please check your input and try again.";
    }

    // Try statusText
    if (error?.response?.statusText) {
      return `${error.response.statusText}${status ? ` (${status})` : ''}`;
    }

    // Fall back to error.message
    if (error?.message) {
      // Don't show generic axios error messages, show default instead
      if (error.message.includes('Request failed') || error.message.includes('Network Error')) {
        return defaultMessage;
      }
      return error.message;
    }

    // Final fallback
    return defaultMessage;
  };

  // Check if user is admin
  useEffect(() => {
    if (!loading) {
      const userRole = user?.role || localStorage.getItem("user_role");
      if (!user || userRole !== "admin") {
        // User is not admin, redirect to dashboard
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Show nothing while checking or if not admin
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const userRole = user?.role || localStorage.getItem("user_role");
  if (!user || userRole !== "admin") {
    return null; // Don't render anything if not admin
  }

  const suggestedTags = [
    "homebuying",
    "mortgage",
    "legal",
    "first-time-buyer",
    "uk",
    "property",
    "survey",
    "costs",
    "process"
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // If search is empty, show all documents
      setFilteredDocuments([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // If document library is not open, open it to show results
    if (!showDocumentLibrary) {
      setShowDocumentLibrary(true);
      setShowAddForm(false);
      setShowStats(false);
    }
    
    // If documents aren't loaded yet, fetch them first
    if (documents.length === 0 && allDocuments.length === 0) {
      await fetchDocuments(1, 10);
    }
    
    // Search through all documents
    const documentsToSearch = allDocuments.length > 0 ? allDocuments : documents;
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = documentsToSearch.filter((doc) => {
      // Search in title
      const titleMatch = doc.title ? String(doc.title).toLowerCase().includes(query) : false;
      
      // Search in document ID (convert to string first in case it's a number)
      const docIdMatch = 
        (doc.document_id ? String(doc.document_id).toLowerCase().includes(query) : false) ||
        (doc.document_hash ? String(doc.document_hash).toLowerCase().includes(query) : false) ||
        (doc.id ? String(doc.id).toLowerCase().includes(query) : false);
      
      // Search in tags
      const tagsMatch = doc.tags?.some(tag => 
        tag && String(tag).toLowerCase().includes(query)
      ) || false;
      
      // Search in category
      const categoryMatch = doc.category ? String(doc.category).toLowerCase().includes(query) : false;
      
      // Search in source
      const sourceMatch = 
        (doc.source ? String(doc.source).toLowerCase().includes(query) : false) ||
        (doc.source_url ? String(doc.source_url).toLowerCase().includes(query) : false);
      
      return titleMatch || docIdMatch || tagsMatch || categoryMatch || sourceMatch;
    });
    
    setFilteredDocuments(filtered);
  };

  const handleAddKnowledge = () => {
    setShowAddForm(true);
    setSubmitError("");
    setSubmitSuccess("");
    setSelectedFile(null);
    setUrlInputs([""]);
    setTitle("");
    setContent("");
    setCategory("");
    setDocumentId("");
    setPriority("Normal");
    setSource("");
    setTags([]);
    setCustomTag("");
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "text/markdown",
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(file.type) || file.size > maxSize) {
        setSubmitError("Invalid file. Only PDF, DOCX, TXT, and MD files up to 10MB are allowed.");
        // Reset the file input so user can select a different file
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      setSelectedFile(file);
      setSubmitError("");
    }
  };

  const handleAddSuggestedTag = (tag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddCustomTag = () => {
    const tag = customTag.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setCustomTag("");
    }
  };

  const handleAddUrlField = () => {
    setUrlInputs([...urlInputs, ""]);
  };

  const handleRemoveUrlField = (index) => {
    if (urlInputs.length > 1) {
      setUrlInputs(urlInputs.filter((_, i) => i !== index));
    }
  };

  const handleUrlInputChange = (index, value) => {
    const newUrls = [...urlInputs];
    newUrls[index] = value;
    setUrlInputs(newUrls);
  };

  const handleAISuggestMetadata = () => {
    // TODO: Implement AI metadata suggestion
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitSuccess("");

    // Validation - All fields are required
    if (!title.trim()) {
      setSubmitError("Please enter a title.");
      return;
    }

    if (!category.trim()) {
      setSubmitError("Please enter a category.");
      return;
    }

    if (!documentId.trim()) {
      setSubmitError("Please enter a document ID.");
      return;
    }

    if (!source.trim()) {
      setSubmitError("Please enter a source.");
      return;
    }

    if (tags.length === 0) {
      setSubmitError("Please add at least one tag.");
      return;
    }

    // Get all non-empty URLs
    const urls = urlInputs
      .map(url => url.trim())
      .filter(url => url.length > 0 && (url.startsWith('http://') || url.startsWith('https://')));

    // At least one of URL, file, or content must be provided
    if (urls.length === 0 && !selectedFile && !content.trim()) {
      setSubmitError("Please provide either a URL, upload a document, or enter content.");
      return;
    }

    // Validate URLs if provided
    if (urlInputs.some(url => url.trim().length > 0) && urls.length === 0) {
      setSubmitError("Please enter valid URLs (must start with http:// or https://).");
      return;
    }

    setIsSubmitting(true);
    try {

      // Process multiple URLs - submit each URL separately
      if (urls.length > 0) {
        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const url of urls) {
          try {
            // Prepare payload for each URL
            const payload = {
              title: title.trim(),
              category: category.trim() || undefined,
              documentId: `${documentId.trim()}_${urls.indexOf(url) + 1}` || undefined,
              priority: priority || "Normal",
              source: source.trim() || undefined,
              tags: tags.length > 0 ? tags : undefined,
              url: url,
            };

            // If content is provided, add it to payload
            if (content.trim()) {
              payload.content = content.trim();
            }

            // Call the API to add knowledge base entry for this URL
            await addKnowledgeBaseEntry(payload);
            successCount++;
          } catch (error) {
            console.error(`Error adding URL ${url}:`, error);
            errorCount++;
            errors.push(`${url}: ${getErrorMessage(error, "Failed to add")}`);
          }
        }

        // Show success/error message based on results
        if (successCount > 0 && errorCount === 0) {
          setSubmitSuccess(`Successfully added ${successCount} URL${successCount > 1 ? 's' : ''} to knowledge base!`);
        } else if (successCount > 0 && errorCount > 0) {
          setSubmitSuccess(`Successfully added ${successCount} URL${successCount > 1 ? 's' : ''}, but ${errorCount} failed.`);
          setSubmitError(`Failed URLs:\n${errors.join('\n')}`);
        } else {
          setSubmitError(`Failed to add URLs:\n${errors.join('\n')}`);
          setIsSubmitting(false);
          return;
        }

        // Refresh documents if library is open
        if (showDocumentLibrary) {
          fetchDocuments(currentPage, 10);
        }

        setTimeout(() => {
          setShowAddForm(false);
          // Reset form
          setSelectedFile(null);
          setUrlInputs([""]);
          setTitle("");
          setContent("");
          setCategory("");
          setDocumentId("");
          setPriority("Normal");
          setSource("");
          setTags([]);
          setCustomTag("");
        }, 3000);
        setIsSubmitting(false);
        return;
      }

      // If no URLs, proceed with file/content submission
      // Prepare payload for knowledge base API
      const payload = {
        title: title.trim(),
        category: category.trim() || undefined,
        documentId: documentId.trim() || undefined,
        priority: priority || "Normal",
        source: source.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      };

      // If content is provided, add it to payload
      // Note: The API might handle content differently, adjust if needed
      if (content.trim()) {
        payload.content = content.trim();
      }

      // Handle file upload separately if file is selected
      // The file upload might be a separate step, or we might need to include it in the payload
      // For now, we'll upload the file first if selected, then add the knowledge entry
      if (selectedFile) {
        const formData = new FormData();
        formData.append("documents", selectedFile);
        await uploadDocument(formData);
        // If file is uploaded, we might not need URL - adjust logic as needed
        // For now, we'll proceed with the knowledge base entry
      }

      // Call the API to add knowledge base entry
      await addKnowledgeBaseEntry(payload);

      setSubmitSuccess("Knowledge entry added successfully!");
      
      // Refresh documents if library is open
      if (showDocumentLibrary) {
        fetchDocuments(currentPage, 10);
      }
      
      setTimeout(() => {
        setShowAddForm(false);
        // Reset form
        setSelectedFile(null);
        setUrlInputs([""]);
        setTitle("");
        setContent("");
        setCategory("");
        setDocumentId("");
        setPriority("Normal");
        setSource("");
        setTags([]);
        setCustomTag("");
      }, 2000);
    } catch (error) {
      console.error("Error adding knowledge entry:", error);
      setSubmitError(getErrorMessage(error, "Failed to add knowledge entry. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setSelectedFile(null);
    setUrlInputs([""]);
    setTitle("");
    setContent("");
    setCategory("");
    setDocumentId("");
    setPriority("Normal");
    setSource("");
    setTags([]);
    setCustomTag("");
    setSubmitError("");
    setSubmitSuccess("");
  };

  const fetchDocuments = async (page = 1, limit = 10) => {
    setDocumentsLoading(true);
    setDocumentsError("");
    try {
      const response = await getKnowledgeBaseDocuments({ page, limit });
      
      // Handle different possible response structures
      let documentsData = [];
      if (response?.data?.documents) {
        documentsData = Array.isArray(response.data.documents) ? response.data.documents : [];
      } else if (response?.documents) {
        documentsData = Array.isArray(response.documents) ? response.documents : [];
      } else if (Array.isArray(response?.data)) {
        documentsData = response.data;
      } else if (Array.isArray(response)) {
        documentsData = response;
      }
      
      setDocuments(documentsData);
      setAllDocuments(documentsData); // Store all documents for searching
      
      // If searching, apply search filter
      if (isSearching && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const filtered = documentsData.filter((doc) => {
          // Search in title
          const titleMatch = doc.title ? String(doc.title).toLowerCase().includes(query) : false;
          
          // Search in document ID (convert to string first in case it's a number)
          const docIdMatch = 
            (doc.document_id ? String(doc.document_id).toLowerCase().includes(query) : false) ||
            (doc.document_hash ? String(doc.document_hash).toLowerCase().includes(query) : false) ||
            (doc.id ? String(doc.id).toLowerCase().includes(query) : false);
          
          // Search in tags
          const tagsMatch = doc.tags?.some(tag => 
            tag && String(tag).toLowerCase().includes(query)
          ) || false;
          
          // Search in category
          const categoryMatch = doc.category ? String(doc.category).toLowerCase().includes(query) : false;
          
          // Search in source
          const sourceMatch = 
            (doc.source ? String(doc.source).toLowerCase().includes(query) : false) ||
            (doc.source_url ? String(doc.source_url).toLowerCase().includes(query) : false);
          
          return titleMatch || docIdMatch || tagsMatch || categoryMatch || sourceMatch;
        });
        setFilteredDocuments(filtered);
      } else {
        setFilteredDocuments([]);
      }
      
      // Calculate total pages if total count is provided
      const total = response?.data?.total || response?.total || response?.count || documentsData.length;
      setTotalPages(Math.ceil(total / limit));
    } catch (error) {
      console.error("Error fetching documents:", error);
      setDocumentsError(getErrorMessage(error, "Failed to load documents."));
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleDocumentLibraryClick = () => {
    setShowDocumentLibrary(true);
    setShowAddForm(false);
    setShowStats(false);
    if (documents.length === 0) {
      fetchDocuments(currentPage, 10);
    }
    // If there's a search query, apply it
    if (searchQuery.trim()) {
      handleSearch();
    }
  };

  const _handlePreviewDocument = async (doc) => {
    const docId = doc.id || doc.document_id || doc.document_hash;
    if (!docId) {
      setSubmitError("Document ID not found.");
      setTimeout(() => setSubmitError(""), 5000);
      return;
    }

    setPreviewDocId(docId);
    setPreviewContent(null);
    setPreviewError("");
    setPreviewLoading(true);
    setShowPreviewModal(true);

    try {
      const response = await getKnowledgeBaseDocumentPreview(docId);
      const previewData = response?.data || response;
      
      // Handle different preview data formats
      if (previewData.preview_content || previewData.content || previewData.text) {
        setPreviewContent({
          type: 'text',
          content: previewData.preview_content || previewData.content || previewData.text,
        });
      } else if (previewData.preview_url || previewData.url || previewData.image_url) {
        setPreviewContent({
          type: 'url',
          url: previewData.preview_url || previewData.url || previewData.image_url,
        });
      } else if (previewData.file_url || previewData.download_url) {
        // If we have a file URL, we can embed it or show download link
        setPreviewContent({
          type: 'file',
          url: previewData.file_url || previewData.download_url,
          filename: doc.title || 'document',
        });
      } else {
        // Fallback: show document metadata
        setPreviewContent({
          type: 'metadata',
          metadata: doc,
        });
      }
    } catch (error) {
      console.error("Error fetching document preview:", error);
      setPreviewError(getErrorMessage(error, "Failed to load document preview. The document may not be available for preview."));
      
      // Fallback: show document metadata if preview fails
      setPreviewContent({
        type: 'metadata',
        metadata: doc,
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownloadDocument = async (doc) => {
    const docId = doc.id || doc.document_id || doc.document_hash;
    if (!docId) {
      setSubmitError("Document ID not found.");
      setTimeout(() => setSubmitError(""), 5000);
      return;
    }

    // Helper function to convert content to PDF
    const convertToPDF = (content, title) => {
      const pdf = new jsPDF();
      
      // Set title
      const documentTitle = title || 'Document';
      pdf.setFontSize(16);
      pdf.text(documentTitle, 14, 20);
      
      // Add line
      pdf.setLineWidth(0.5);
      pdf.line(14, 25, 196, 25);
      
      // Prepare content
      const text = String(content);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 14;
      const maxWidth = pageWidth - (margin * 2);
      const lineHeight = 7;
      
      // Split text into lines that fit the page width
      pdf.setFontSize(10);
      const lines = pdf.splitTextToSize(text, maxWidth);
      
      let y = 35;
      lines.forEach((line) => {
        // Check if we need a new page
        if (y + lineHeight > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(line, margin, y);
        y += lineHeight;
      });
      
      return pdf;
    };

    try {
      // First, try the dedicated download endpoint
      try {
        const response = await downloadKnowledgeBaseDocument(docId);
        const contentType = response.headers['content-type'] || '';
        
        // If it's already a PDF, download it directly
        if (contentType.includes('application/pdf') || contentType.includes('pdf')) {
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          
          let filename = doc.title || 'document';
          filename = filename.replace(/[<>:"/\\|?*]/g, '_').trim();
          if (!filename || filename.length === 0) {
            filename = 'document';
          }
          if (!filename.toLowerCase().endsWith('.pdf')) {
            filename = `${filename}.pdf`;
          }
          
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          setSubmitSuccess("Document downloaded successfully!");
          setTimeout(() => setSubmitSuccess(""), 3000);
          return;
        }
        
        // If not PDF, convert the blob to text and then to PDF
        let text = '';
        if (response.data instanceof Blob) {
          text = await response.data.text();
        } else {
          text = String(response.data);
        }
        const pdf = convertToPDF(text, doc.title);
        const pdfBlob = pdf.output('blob');
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        
        let filename = doc.title || 'document';
        filename = filename.replace(/[<>:"/\\|?*]/g, '_').trim();
        if (!filename || filename.length === 0) {
          filename = 'document';
        }
        if (!filename.toLowerCase().endsWith('.pdf')) {
          filename = `${filename}.pdf`;
        }
        
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        setSubmitSuccess("Document downloaded as PDF!");
        setTimeout(() => setSubmitSuccess(""), 3000);
        return;
      } catch (downloadError) {
        // If download endpoint fails, try to get content from preview
      }

      // Get content from preview endpoint and download as text file
      try {
        const previewResponse = await getKnowledgeBaseDocumentPreview(docId);
        const previewData = previewResponse?.data || previewResponse;
        
        
        // Try to extract content from various possible fields
        let content = previewData?.preview_content || 
                      previewData?.content || 
                      previewData?.text || 
                      previewData?.body ||
                      previewData?.data ||
                      previewData?.document_content ||
                      previewData?.file_content;
        
        // If content is an object, try to stringify it
        if (content && typeof content === 'object') {
          try {
            content = JSON.stringify(content, null, 2);
          } catch {
            content = String(content);
          }
        }
        
        // Also check if the document itself has content
        if (!content || (typeof content === 'string' && content.length === 0)) {
          content = doc.content || doc.text || doc.body || doc.document_content;
        }
        
        if (content && typeof content === 'string' && content.length > 0) {
          // Convert content to PDF
          const pdf = convertToPDF(content, doc.title);
          const pdfBlob = pdf.output('blob');
          const url = window.URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          
          let filename = doc.title || 'document';
          filename = filename.replace(/[<>:"/\\|?*]/g, '_').trim();
          if (!filename || filename.length === 0) {
            filename = 'document';
          }
          if (!filename.toLowerCase().endsWith('.pdf')) {
            filename = `${filename}.pdf`;
          }
          link.download = filename;
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          setSubmitSuccess("Document downloaded as PDF!");
          setTimeout(() => setSubmitSuccess(""), 3000);
          return;
        }
      } catch (previewError) {
        console.error("Preview endpoint error:", previewError);
      }

      // Fallback: Create a PDF with document metadata
      const documentInfo = [
        `Document: ${doc.title || 'Untitled'}`,
        `Document ID: ${doc.document_id || doc.document_hash || doc.id || 'N/A'}`,
        `Category: ${doc.category || 'N/A'}`,
        `Source: ${doc.source || doc.source_url || 'N/A'}`,
        `Tags: ${doc.tags?.join(', ') || 'N/A'}`,
        `Chunks: ${doc.chunks_count || 0}`,
        `Created: ${doc.created_at || doc.processed_at_raw || 'N/A'}`,
        `File Type: ${doc.file_type || doc.file_extension || 'N/A'}`,
        '',
        'Note: Document content is not available for download.',
        'Please contact the administrator or use the preview feature to view the document.',
      ].join('\n');
      
      const pdf = convertToPDF(documentInfo, `${doc.title || 'Document'} - Metadata`);
      const pdfBlob = pdf.output('blob');
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      
      let filename = `${doc.title || 'document'}_info`;
      filename = filename.replace(/[<>:"/\\|?*]/g, '_').trim();
      if (!filename || filename.length === 0) {
        filename = 'document_info';
      }
      filename = `${filename}.pdf`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSubmitSuccess("Document information downloaded as PDF.");
      setTimeout(() => setSubmitSuccess(""), 3000);
    } catch (error) {
      console.error("Error downloading document:", error);
      setSubmitError(getErrorMessage(error, "Failed to download document."));
      setTimeout(() => setSubmitError(""), 5000);
    }
  };

  const handleDeleteClick = (doc) => {
    setDocToDelete(doc);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!docToDelete) return;

    const docId = docToDelete.id || docToDelete.document_id || docToDelete.document_hash;
    setDeletingDocId(docId);
    setShowDeleteModal(false);
    
    try {
      await deleteKnowledgeBaseDocument(docId);
      
      // Remove from local state - handle different ID fields
      setDocuments((prev) => prev.filter((doc) => 
        doc.id !== docId && doc.document_id !== docId && doc.document_hash !== docId
      ));
      setAllDocuments((prev) => prev.filter((doc) => 
        doc.id !== docId && doc.document_id !== docId && doc.document_hash !== docId
      ));
      setFilteredDocuments((prev) => prev.filter((doc) => 
        doc.id !== docId && doc.document_id !== docId && doc.document_hash !== docId
      ));
      
      // Show success message
      setSubmitSuccess("Document deleted successfully!");
      setTimeout(() => setSubmitSuccess(""), 3000);
    } catch (error) {
      console.error("Error deleting document:", error);
      setSubmitError(getErrorMessage(error, "Failed to delete document."));
      setTimeout(() => setSubmitError(""), 5000);
    } finally {
      setDeletingDocId(null);
      setDocToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDocToDelete(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };


  const fetchStats = async () => {
    setStatsLoading(true);
    setStatsError("");
    try {
      const response = await getKnowledgeBaseStats();
      const statsData = response?.data || {};
      
      // Transform API response to match component structure
      const transformedStats = {
        totalRecords: statsData.total_records || 0,
        generalNamespace: statsData.general_namespace || 0,
        embeddingDimension: statsData.embedding_dimension || 768,
        totalDocuments: statsData.total_documents || 0,
        totalChunks: statsData.total_chunks || 0,
        vectorStoreStatus: statsData.vector_store_status || "unknown",
        namespaces: (statsData.namespace_breakdown || []).map(ns => ({
          name: ns.namespace || ns.name,
          vectorCount: ns.vector_count || ns.vectorCount || 0,
        })),
        vectorStoreInfo: statsData.vector_store_info || {},
        updatedAt: statsData.updated_at,
        updatedAtFormatted: statsData.updated_at_formatted,
      };
      
      setStats(transformedStats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStatsError(getErrorMessage(error, "Failed to load statistics."));
    } finally {
      setStatsLoading(false);
    }
  };

  const handleViewStatsClick = () => {
    setShowStats(true);
    setShowDocumentLibrary(false);
    if (!stats) {
      fetchStats();
    }
  };

  const quickActions = [
    {
      id: 1,
      title: "Bulk Upload",
      description: "Queue multiple documents for ingestion (coming soon).",
      icon: "menu_book",
      onClick: () => console.log("Bulk Upload clicked"),
      comingSoon: true,
    },
    {
      id: 2,
      title: "Document Library",
      description: "Review uploaded files, chunk counts, and manage deletions.",
      icon: "folder",
      onClick: handleDocumentLibraryClick,
      comingSoon: false,
    },
    {
      id: 3,
      title: "View Stats",
      description: "Monitor Pinecone capacity and recent ingestion activity.",
      icon: "database",
      onClick: handleViewStatsClick,
      comingSoon: false,
    },
    {
      id: 4,
      title: "Export Data",
      description: "Download knowledge records for offline review (coming soon).",
      icon: "download",
      comingSoon: true,
    },
    {
      id: 5,
      title: "Reporting Dashboard",
      description: "View product metrics, usage charts, and recent activity.",
      icon: "bar_chart",
      onClick: () => navigate("/admin/dashboard"),
      comingSoon: false,
    },
    {
      id: 6,
      title: "User Data Access",
      description: "Search, inspect, and export user records and onboarding data.",
      icon: "group",
      onClick: () => navigate("/admin/data-access"),
      comingSoon: false,
    },
    {
      id: 7,
      title: "Article Management",
      description: "Create, edit, and publish content for the Home Truths section.",
      icon: "article",
      onClick: () => navigate("/admin/articles"),
      comingSoon: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] px-8 py-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">database</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Knowledge Base Admin - STAGING</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Manage the RAG knowledge base for HomeTruth assistant.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddKnowledge}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Add Knowledge
          </button>
          <button
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Logout
          </button>
        </div>
      </div>

      {/* Show Add Form or Regular Content */}
      {showAddForm ? (
        /* Add New Knowledge Form */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Form Header */}
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-purple-600 text-2xl">upload</span>
            <h2 className="text-xl font-semibold text-gray-900">Add New Knowledge</h2>
          </div>

          <div className="space-y-6">
            {/* URLs to Scrape - Multi-Link Upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Enter URLs to Scrape <span className="text-xs text-gray-500">(at least one of URL, File, or Content required)</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddUrlField}
                  className="text-xs text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Add URL
                </button>
              </div>
              <div className="space-y-2">
                {urlInputs.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => handleUrlInputChange(index, e.target.value)}
                      placeholder="https://example.com/article"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {urlInputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveUrlField(index)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove URL"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Each URL will be processed separately as a knowledge base entry.
              </p>
            </div>

            {/* Upload Document */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Upload Document <span className="text-xs text-gray-500">(at least one of URL, File, or Content required)</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.docx,.txt,.md"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Choose File
                </button>
                <span className="text-sm text-gray-500">
                  {selectedFile ? selectedFile.name : "No file chosen"}
                </span>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., First-time Buyer Checklist"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Content with Suggest metadata */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Content <span className="text-xs text-gray-500">(at least one of URL, File, or Content required)</span>
                </label>
                <button
                  onClick={handleAISuggestMetadata}
                  className="text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                >
                  Suggest metadata
                </button>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter the knowledge content here..."
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Buying Process, Legal, Financial, Property Types"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Document ID and Priority (side by side) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  placeholder="e.g., lease_agreement_001"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g., Government Website, Legal Firm, Internal"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">Suggested tags (click to add):</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleAddSuggestedTag(tag)}
                    disabled={tags.includes(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                      tags.includes(tag)
                        ? "bg-purple-100 text-purple-700 cursor-not-allowed"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    {tag}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddCustomTag();
                    }
                  }}
                  placeholder="Add tag and press Enter"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleAddCustomTag}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Add
                </button>
              </div>
              {/* Selected Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-purple-900"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{submitError}</p>
              </div>
            )}

            {/* Success Message */}
            {submitSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{submitSuccess}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Adding...
                  </>
                ) : (
                  "Add to Knowledge Base"
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Quick Actions Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Quick Actions</h2>
              <p className="text-gray-500 text-sm">
                Switch between workspace tools without leaving the page.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  disabled={action.comingSoon}
                  className="bg-white border border-gray-200 rounded-lg p-5 text-left hover:shadow-md transition-shadow hover:border-purple-300 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-gray-600 text-xl">
                      {action.icon}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {action.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Document Library Section */}
          {showDocumentLibrary && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-purple-600 text-2xl">folder</span>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Document Library</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Browse uploaded knowledge files, inspect metadata, and delete specific documents when they go out of date.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchDocuments(currentPage, 10)}
                    disabled={documentsLoading}
                    className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-base">refresh</span>
                    Refresh
                  </button>
                  <button
                    onClick={() => setShowDocumentLibrary(false)}
                    className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                    Hide
                  </button>
                </div>
              </div>

              {/* Search Knowledge Base Section */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-gray-500 text-lg">search</span>
                  <h3 className="text-base font-semibold text-gray-900">Search Documents</h3>
                </div>
                
                <div className="mb-3">
                  <p className="text-gray-600 text-xs">
                    KB records: <span className="font-semibold text-gray-900">{kbRecords.toLocaleString()}</span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    placeholder="Search by title, tags, document ID, category, or source..."
                    className="flex-1 text-sm bg-white h-10 pl-4 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  <button
                    onClick={handleSearch}
                    className="bg-blue-400 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Search
                  </button>
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setIsSearching(false);
                        setFilteredDocuments([]);
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Success/Error Messages */}
              {submitSuccess && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-600 text-sm">{submitSuccess}</p>
                </div>
              )}
              {submitError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{submitError}</p>
                </div>
              )}

              {documentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading documents...</p>
                  </div>
                </div>
              ) : documentsError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-600">{documentsError}</p>
                  <button
                    onClick={() => fetchDocuments(currentPage, 10)}
                    className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
                  >
                    Try again
                  </button>
                </div>
              ) : (isSearching && filteredDocuments.length === 0) ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">search_off</span>
                  <p className="text-gray-500 text-lg mb-2">No documents found</p>
                  <p className="text-gray-400 text-sm">No documents match your search query "{searchQuery}".</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setIsSearching(false);
                      setFilteredDocuments([]);
                    }}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    Clear search
                  </button>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">folder_off</span>
                  <p className="text-gray-500 text-lg mb-2">No documents found</p>
                  <p className="text-gray-400 text-sm">Documents uploaded to the knowledge base will appear here.</p>
                </div>
              ) : (
                <>
                  {/* Search Results Indicator */}
                  {isSearching && filteredDocuments.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                      <p className="text-sm text-blue-700">
                        Found {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} matching "{searchQuery}"
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setIsSearching(false);
                          setFilteredDocuments([]);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 underline"
                      >
                        Clear search
                      </button>
                    </div>
                  )}
                  {/* Documents List */}
                  <div className="space-y-3">
                    {(isSearching && filteredDocuments.length > 0 ? filteredDocuments : documents).map((doc, index) => (
                      <div
                        key={doc.id || doc.document_id || doc.document_hash || `doc-${index}`}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            {/* Document Title and ID */}
                            <div className="flex items-start gap-2 mb-3">
                              <span className="material-symbols-outlined text-gray-600 text-xl mt-0.5">description</span>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                                  {doc.title || "Untitled"}
                                </h3>
                                <p className="text-xs text-gray-500 font-mono truncate">
                                  {doc.document_id || doc.document_hash || "—"}
                                </p>
                              </div>
                            </div>

                            {/* Metadata Row */}
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                              {/* Chunks */}
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">link</span>
                                <span>{doc.chunks_count || 0} chunks</span>
                              </div>

                              {/* Namespace/Tags */}
                              {doc.entry_method === "url_scrape" || doc.source_url ? (
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className="material-symbols-outlined text-sm">link</span>
                                  {doc.entry_method === "url_scrape" ? (
                                    <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">urls</span>
                                  ) : doc.tags && doc.tags.length > 0 ? (
                                    doc.tags.map((tag, tagIdx) => (
                                      <span key={tagIdx} className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                                        {tag}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">general</span>
                                  )}
                                </div>
                              ) : doc.tags && doc.tags.length > 0 ? (
                                <div className="flex items-center gap-1 flex-wrap">
                                  {doc.tags.map((tag, tagIdx) => (
                                    <span key={tagIdx} className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              ) : null}

                              {/* Processed Date */}
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                <span>{formatDate(doc.processed_at_raw || doc.created_at)}</span>
                              </div>

                              {/* File Type */}
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">description</span>
                                <span>{doc.file_type || doc.file_extension || "—"}</span>
                              </div>

                              {/* Source URL */}
                              {doc.source_url && (
                                <div className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm">public</span>
                                  <a
                                    href={doc.source_url.startsWith("http") ? doc.source_url : `https://${doc.source_url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline truncate max-w-xs"
                                    title={doc.source_url}
                                  >
                                    {doc.source_url.replace(/^https?:\/\//, "").replace(/^www\./, "")}
                                  </a>
                                </div>
                              )}

                              {/* Status Badge */}
                              {doc.entry_method === "manual_entry" && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">new</span>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons - Stacked Vertically */}
                          <div className="flex flex-col gap-2 ml-4">
                            <button
                              onClick={() => handleDownloadDocument(doc)}
                              className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded text-xs font-medium transition-colors flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-sm">download</span>
                              Download
                            </button>
                            <button
                              onClick={() => handleDeleteClick(doc)}
                              disabled={deletingDocId === (doc.id || doc.document_id || doc.document_hash)}
                              className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-300 rounded text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deletingDocId === (doc.id || doc.document_id || doc.document_hash) ? (
                                <>
                                  <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></span>
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                  Delete
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          const newPage = currentPage - 1;
                          if (newPage >= 1) {
                            setCurrentPage(newPage);
                            fetchDocuments(newPage, 10);
                          }
                        }}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => {
                          const newPage = currentPage + 1;
                          if (newPage <= totalPages) {
                            setCurrentPage(newPage);
                            fetchDocuments(newPage, 10);
                          }
                        }}
                        disabled={currentPage >= totalPages}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Knowledge Base Stats Section */}
          {showStats && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-purple-600 text-2xl">database</span>
                  <h2 className="text-xl font-semibold text-gray-900">Knowledge Base Stats</h2>
                </div>
                <div className="flex items-center gap-3">
                  {stats && stats.updatedAtFormatted && (
                    <span className="text-sm text-gray-500">
                      Updated {stats.updatedAtFormatted}
                    </span>
                  )}
                  <button
                    onClick={fetchStats}
                    disabled={statsLoading}
                    className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-base">refresh</span>
                    Refresh
                  </button>
                  <button
                    onClick={() => setShowStats(false)}
                    className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                    Hide
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                Snapshot of your Pinecone index health and recent uploads
              </p>

              {statsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading statistics...</p>
                  </div>
                </div>
              ) : statsError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">{statsError}</p>
                  <button
                    onClick={fetchStats}
                    className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
                  >
                    Try again
                  </button>
                </div>
              ) : stats ? (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Total Records */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <div className="text-3xl font-bold text-blue-700 mb-2">
                        {stats.totalRecords.toLocaleString()}
                      </div>
                      <div className="text-sm text-blue-600 font-medium">Total Records</div>
                      <div className="text-xs text-blue-500 mt-1">Combined across all namespaces</div>
                    </div>

                    {/* General Namespace */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="text-3xl font-bold text-gray-700 mb-2">
                        {stats.generalNamespace.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">General Namespace</div>
                      <div className="text-xs text-gray-500 mt-1">Vectors stored for application defaults</div>
                    </div>

                    {/* Embedding Dimension */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="text-3xl font-bold text-gray-700 mb-2">
                        {stats.embeddingDimension.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Embedding Dimension</div>
                      <div className="text-xs text-gray-500 mt-1">Model vector size for this index</div>
                    </div>
                  </div>

                  {/* Namespace Breakdown Table */}
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Namespace breakdown
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Track how content is distributed across namespaces.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">NAMESPACE</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">VECTOR COUNT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.namespaces && stats.namespaces.length > 0 ? (
                            stats.namespaces.map((ns, idx) => (
                              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4">
                                  <span className="text-sm text-gray-900 font-mono">{ns.name}</span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm text-gray-600">{ns.vectorCount.toLocaleString()}</span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={2} className="py-4 text-center text-sm text-gray-500">
                                No namespace data available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* Preview Modal */}
          {showPreviewModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Document Preview</h2>
                    {previewDocId && (
                      <p className="text-xs text-gray-500 mt-1 font-mono">ID: {previewDocId}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowPreviewModal(false);
                      setPreviewDocId(null);
                      setPreviewContent(null);
                      setPreviewError("");
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-2xl">close</span>
                  </button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                  {previewLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading preview...</p>
                      </div>
                    </div>
                  ) : previewError ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <p className="text-red-600 text-sm">{previewError}</p>
                    </div>
                  ) : previewContent ? (
                    <>
                      {previewContent.type === 'text' && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="whitespace-pre-wrap text-sm text-gray-700 font-mono max-h-[60vh] overflow-y-auto">
                            {previewContent.content}
                          </div>
                        </div>
                      )}
                      {previewContent.type === 'url' && (
                        <div className="w-full h-[60vh] border border-gray-200 rounded-lg overflow-hidden">
                          {previewContent.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img 
                              src={previewContent.url} 
                              alt="Document Preview" 
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                          ) : (
                            <iframe 
                              src={previewContent.url} 
                              className="w-full h-full border-0"
                              title="Document Preview"
                              onError={() => {
                                setPreviewError("Failed to load preview URL. The document may not be accessible.");
                              }}
                            />
                          )}
                          <div style={{ display: 'none' }} className="p-4 text-center text-gray-500">
                            Failed to load preview. <a href={previewContent.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Open in new tab</a>
                          </div>
                        </div>
                      )}
                      {previewContent.type === 'file' && (
                        <div className="text-center py-8">
                          <p className="text-gray-600 mb-4">Document file available for download</p>
                          <a
                            href={previewContent.url}
                            download={previewContent.filename}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <span className="material-symbols-outlined text-base">download</span>
                            Download {previewContent.filename}
                          </a>
                        </div>
                      )}
                      {previewContent.type === 'metadata' && (
                        <div className="space-y-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Document Metadata</h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex">
                                <span className="font-medium text-gray-700 w-32">Title:</span>
                                <span className="text-gray-600">{previewContent.metadata.title || 'N/A'}</span>
                              </div>
                              <div className="flex">
                                <span className="font-medium text-gray-700 w-32">Document ID:</span>
                                <span className="text-gray-600 font-mono text-xs">{previewContent.metadata.document_id || previewContent.metadata.document_hash || previewContent.metadata.id || 'N/A'}</span>
                              </div>
                              {previewContent.metadata.source_url && (
                                <div className="flex">
                                  <span className="font-medium text-gray-700 w-32">Source URL:</span>
                                  <a 
                                    href={previewContent.metadata.source_url.startsWith("http") ? previewContent.metadata.source_url : `https://${previewContent.metadata.source_url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline truncate max-w-md"
                                  >
                                    {previewContent.metadata.source_url}
                                  </a>
                                </div>
                              )}
                              {previewContent.metadata.category && (
                                <div className="flex">
                                  <span className="font-medium text-gray-700 w-32">Category:</span>
                                  <span className="text-gray-600">{previewContent.metadata.category}</span>
                                </div>
                              )}
                              {previewContent.metadata.tags && previewContent.metadata.tags.length > 0 && (
                                <div className="flex">
                                  <span className="font-medium text-gray-700 w-32">Tags:</span>
                                  <div className="flex flex-wrap gap-2">
                                    {previewContent.metadata.tags.map((tag, idx) => (
                                      <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div className="flex">
                                <span className="font-medium text-gray-700 w-32">Chunks:</span>
                                <span className="text-gray-600">{previewContent.metadata.chunks_count || 0}</span>
                              </div>
                              {previewContent.metadata.processed_at_raw || previewContent.metadata.created_at ? (
                                <div className="flex">
                                  <span className="font-medium text-gray-700 w-32">Processed:</span>
                                  <span className="text-gray-600">{formatDate(previewContent.metadata.processed_at_raw || previewContent.metadata.created_at)}</span>
                                </div>
                              ) : null}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500">
                            Preview content is not available for this document. You can view the metadata above or download the document.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No preview available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-red-600 text-2xl">warning</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Delete Document</h2>
                      <p className="text-sm text-gray-500 mt-1">This action cannot be undone</p>
                    </div>
                  </div>
                  
                  {docToDelete && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {docToDelete.title || "Untitled Document"}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {docToDelete.document_id || docToDelete.document_hash || docToDelete.id}
                      </p>
                    </div>
                  )}

                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this document? All associated data, chunks, and vectors will be permanently removed from the knowledge base.
                  </p>

                  <div className="flex items-center gap-3 justify-end">
                    <button
                      onClick={handleDeleteCancel}
                      disabled={deletingDocId !== null}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      disabled={deletingDocId !== null}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingDocId ? (
                        <>
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">delete</span>
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
