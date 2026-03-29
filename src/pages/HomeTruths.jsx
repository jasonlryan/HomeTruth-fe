import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getPublicArticles } from "../api/api";
import { Calendar, User, ChevronLeft, ChevronRight, Search } from "lucide-react";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "article", label: "Articles" },
  { value: "insight", label: "Insights" },
  { value: "guide", label: "Guides" },
  { value: "template", label: "Templates" },
  { value: "educational", label: "Educational" },
  { value: "document", label: "Documents" },
];

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

export default function HomeTruths() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeCategory]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await getPublicArticles({
        page,
        limit: 12,
        category: activeCategory || undefined,
      });
      setArticles(res.data?.articles || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching articles:", err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white min-h-screen font-gill">
      <Navbar />

      {/* Hero Section */}
      <section className="w-full flex items-center justify-center bg-white">
        <div className="relative w-full max-w-9xl h-[35vh] min-h-[320px] overflow-hidden shadow-lg">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/assets/aboutUs.png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-3">Home Truths</h1>
            <p className="text-base md:text-lg max-w-2xl text-white/90">
              Expert insights, guides, and resources to help you navigate every step of your property journey.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="max-w-7xl mx-auto px-6 pt-8 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setActiveCategory(cat.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.value
                  ? "bg-[#00bfff] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00bfff]"></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No articles yet</h3>
            <p className="text-gray-500">
              Check back soon — we're working on fresh content for you.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.id}
                to={`/home-truths/${article.slug}`}
                className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Image */}
                <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                  {article.featured_image ? (
                    <img
                      src={`${API_BASE_URL}${article.featured_image}`}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
                      <span className="text-4xl text-[#00bfff]/30 font-bold">HT</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Category Badge */}
                  <span className="inline-block px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-[#00bfff] rounded-full capitalize mb-3">
                    {article.category}
                  </span>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#00bfff] transition-colors">
                    {article.title}
                  </h3>

                  {article.excerpt && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                      {article.excerpt}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                      <User size={12} />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{formatDate(article.published_at)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
