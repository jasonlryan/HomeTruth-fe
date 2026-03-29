import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getPublicArticleBySlug } from "../api/api";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

function sanitizeHtml(html) {
  if (!html) return "";
  return html
    .replace(/&nbsp;/g, " ")
    .replace(/\u00A0/g, " ");
}

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await getPublicArticleBySlug(slug);
        setArticle(res.data);
      } catch (err) {
        console.error("Error fetching article:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-gill">
      <Navbar />

      <div className="flex-1">
        <div className="max-w-[1344px] mx-auto px-6 sm:px-12 lg:px-16 xl:px-20 2xl:px-24 py-12 text-gray-800">
          {/* Back Link */}
          <Link
            to="/home-truths"
            className="inline-flex items-center gap-2 text-[#00bfff] hover:text-blue-600 text-sm font-medium mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home Truths
          </Link>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00bfff]"></div>
            </div>
          ) : error || !article ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Article not found</h2>
              <p className="text-gray-500 mb-6">
                The article you're looking for doesn't exist or has been removed.
              </p>
              <Link
                to="/home-truths"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00bfff] text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
              >
                <ArrowLeft size={16} />
                Browse all articles
              </Link>
            </div>
          ) : (
            <article>
              {/* Featured Image */}
              {article.featured_image && (
                <div className="w-full max-w-3xl rounded-xl overflow-hidden mb-8 aspect-[2/1]">
                  <img
                    src={`${API_BASE_URL}${article.featured_image}`}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Category Badge */}
              <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-50 text-[#00bfff] rounded-full capitalize mb-4">
                {article.category}
              </span>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 leading-tight">
                {article.title}
              </h1>

              {/* Meta Row */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-1.5">
                  <User size={14} className="shrink-0" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="shrink-0" />
                  <span>{formatDate(article.published_at)}</span>
                </div>
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-8">
                  <Tag size={14} className="text-gray-400 shrink-0" />
                  {article.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Article Body */}
              <div
                className="article-body prose prose-lg max-w-none
                  prose-headings:text-gray-900 prose-headings:font-bold
                  prose-p:text-gray-700 prose-p:leading-relaxed
                  prose-a:text-[#00bfff] prose-a:underline hover:prose-a:text-blue-600
                  prose-strong:text-gray-900
                  prose-li:text-gray-800 prose-li:leading-relaxed
                  prose-blockquote:border-l-[#00bfff] prose-blockquote:bg-blue-50/50 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                  prose-img:rounded-lg prose-img:shadow-sm
                  prose-code:text-sm prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                  prose-hr:border-gray-200"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }}
              />

              {/* Bottom Nav */}
              <div className="mt-12 pt-6 border-t border-gray-200">
                <Link
                  to="/home-truths"
                  className="inline-flex items-center gap-2 text-[#00bfff] hover:text-blue-600 text-sm font-medium transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to all articles
                </Link>
              </div>
            </article>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
