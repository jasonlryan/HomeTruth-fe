import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
  getAdminArticles,
  getAdminArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  publishArticle,
  unpublishArticle,
} from "../api/api";
import {
  ArrowLeft,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Search,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  Save,
  Send,
  FileText,
} from "lucide-react";

const CATEGORIES = [
  { value: "article", label: "Article" },
  { value: "insight", label: "Insight" },
  { value: "guide", label: "Guide" },
  { value: "template", label: "Template" },
  { value: "educational", label: "Educational" },
  { value: "document", label: "Document" },
];

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

export default function AdminArticleManager() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [view, setView] = useState("list");
  const [articles, setArticles] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    excerpt: "",
    content: "",
    category: "article",
    tags: "",
    featured_image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        ["blockquote", "code-block"],
        ["clean"],
      ],
    }),
    []
  );

  useEffect(() => {
    if (!loading) {
      const userRole = user?.role || localStorage.getItem("user_role");
      if (!user || userRole !== "admin") {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (view === "list") fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, pagination.page, categoryFilter, statusFilter]);

  const fetchArticles = async () => {
    setListLoading(true);
    try {
      const res = await getAdminArticles({
        page: pagination.page,
        limit: 20,
        search: searchQuery || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
      });
      setArticles(res.data?.articles || []);
      const p = res.data?.pagination || {};
      setPagination((prev) => ({
        ...prev,
        total: p.total || 0,
        totalPages: p.totalPages || 1,
      }));
    } catch (err) {
      console.error("Error fetching articles:", err);
    } finally {
      setListLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchArticles();
  };

  const openCreateForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      author: user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "",
      excerpt: "",
      content: "",
      category: "article",
      tags: "",
      featured_image: null,
    });
    setImagePreview(null);
    setFormError("");
    setFormSuccess("");
    setView("form");
  };

  const openEditForm = async (id) => {
    try {
      const res = await getAdminArticle(id);
      const article = res.data;
      setEditingId(id);
      setFormData({
        title: article.title || "",
        author: article.author || "",
        excerpt: article.excerpt || "",
        content: article.content || "",
        category: article.category || "article",
        tags: Array.isArray(article.tags) ? article.tags.join(", ") : "",
        featured_image: null,
      });
      setImagePreview(
        article.featured_image ? `${API_BASE_URL}${article.featured_image}` : null
      );
      setFormError("");
      setFormSuccess("");
      setView("form");
    } catch (err) {
      console.error("Error loading article:", err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const valid = ["image/jpeg", "image/png", "image/webp"];
    if (!valid.includes(file.type)) {
      setFormError("Only JPG, PNG, and WebP images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image must be under 5MB.");
      return;
    }
    setFormData((prev) => ({ ...prev, featured_image: file }));
    setImagePreview(URL.createObjectURL(file));
    setFormError("");
  };

  const handleSubmit = async (publishOnSave = false) => {
    setFormError("");
    setFormSuccess("");

    if (!formData.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (!formData.author.trim()) {
      setFormError("Author is required.");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", formData.title.trim());
      fd.append("author", formData.author.trim());
      fd.append("excerpt", formData.excerpt.trim());
      fd.append("content", formData.content);
      fd.append("category", formData.category);
      fd.append("status", publishOnSave ? "published" : "draft");

      const tagsArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      fd.append("tags", JSON.stringify(tagsArray));

      if (formData.featured_image instanceof File) {
        fd.append("featured_image", formData.featured_image);
      }

      if (editingId) {
        await updateArticle(editingId, fd);
        setFormSuccess("Article updated successfully!");
      } else {
        await createArticle(fd);
        setFormSuccess(publishOnSave ? "Article published!" : "Article saved as draft!");
      }

      setTimeout(() => setView("list"), 1500);
    } catch (err) {
      console.error("Error saving article:", err);
      setFormError(err.response?.data?.message || "Failed to save article.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishToggle = async (article) => {
    try {
      if (article.status === "published") {
        await unpublishArticle(article.id);
      } else {
        await publishArticle(article.id);
      }
      fetchArticles();
    } catch (err) {
      console.error("Error toggling publish:", err);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await deleteArticle(deleteModal.id);
      setDeleteModal(null);
      fetchArticles();
    } catch (err) {
      console.error("Error deleting article:", err);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // ---------- FORM VIEW ----------
  if (view === "form") {
    return (
      <div className="min-h-screen bg-[#F5F7FA] px-8 py-8">
        <button
          onClick={() => setView("list")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to Articles</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="text-purple-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              {editingId ? "Edit Article" : "Create New Article"}
            </h2>
          </div>

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                placeholder="Enter article title"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Author + Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData((p) => ({ ...p, author: e.target.value }))}
                  placeholder="Author name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData((p) => ({ ...p, excerpt: e.target.value }))}
                placeholder="Short preview text (max ~300 chars)"
                rows={3}
                maxLength={300}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{formData.excerpt.length}/300</p>
            </div>

            {/* Content (Rich Text) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={(value) => setFormData((p) => ({ ...p, content: value }))}
                  modules={quillModules}
                  placeholder="Write your article content here..."
                  className="bg-white"
                  style={{ minHeight: 250 }}
                />
              </div>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
              <div className="flex items-start gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                  <Upload size={16} />
                  Choose Image
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-20 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setFormData((p) => ({ ...p, featured_image: null }));
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, or WebP. Max 5MB.</p>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData((p) => ({ ...p, tags: e.target.value }))}
                placeholder="e.g. homebuying, mortgage, uk (comma-separated)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Error/Success */}
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{formError}</p>
              </div>
            )}
            {formSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{formSuccess}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                {submitting ? "Saving..." : "Save as Draft"}
              </button>
              <button
                onClick={() => handleSubmit(true)}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <Send size={16} />
                {submitting ? "Publishing..." : "Publish"}
              </button>
              <button
                onClick={() => setView("list")}
                disabled={submitting}
                className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- LIST VIEW ----------
  return (
    <div className="min-h-screen bg-[#F5F7FA] px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/knowledge-base")}
            className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Article Management</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Create, edit, and publish content for the Home Truths section.
            </p>
          </div>
        </div>
        <button
          onClick={openCreateForm}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          New Article
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search articles..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {listLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">No articles found</p>
            <p className="text-gray-400 text-sm">Create your first article to get started.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Published
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {article.featured_image ? (
                            <img
                              src={`${API_BASE_URL}${article.featured_image}`}
                              alt=""
                              className="w-10 h-10 rounded object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                              <FileText size={16} className="text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {article.title}
                            </p>
                            <p className="text-xs text-gray-400">{article.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full capitalize">
                          {article.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            article.status === "published"
                              ? "bg-green-50 text-green-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {article.status === "published" ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {formatDate(article.published_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditForm(article.id)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handlePublishToggle(article)}
                            className={`p-2 rounded-lg transition-colors ${
                              article.status === "published"
                                ? "text-gray-500 hover:text-orange-600 hover:bg-orange-50"
                                : "text-gray-500 hover:text-green-600 hover:bg-green-50"
                            }`}
                            title={article.status === "published" ? "Unpublish" : "Publish"}
                          >
                            {article.status === "published" ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteModal(article)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} articles)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                    disabled={pagination.page >= pagination.totalPages}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Article</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-sm font-medium text-gray-900">{deleteModal.title}</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                disabled={deleting}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
