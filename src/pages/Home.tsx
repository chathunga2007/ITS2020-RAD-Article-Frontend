import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { createArticle, getAllArticles } from "../service/article"
import "../App.css"

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Form states for quick publish
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tagsInput, setTagsInput] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showQuickPublish, setShowQuickPublish] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Articles & Pagination states
  const [articles, setArticles] = useState<any[]>([])
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [loadingArticles, setLoadingArticles] = useState<boolean>(true)

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string>("All")

  const fetchArticles = async () => {
    try {
      setLoadingArticles(true)
      const res = await getAllArticles(page, 9)
      setArticles(res?.data || [])
      setTotalPages(res?.meta?.totalPages || res?.meta?.totalPage || 1)
    } catch (error) {
      console.error("Fetch articles error:", error)
    } finally {
      setLoadingArticles(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [page])

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN")
    localStorage.removeItem("REFRESH_TOKEN")
    navigate("/login")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      if (!file.type.startsWith("image/")) {
        if (fileInputRef.current) fileInputRef.current.value = ""
        return alert("Please select a valid image file")
      }
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    if (!title.trim() || !content.trim()) {
      return alert("Title and Content are required!")
    }

    const formData = new FormData()
    formData.append("title", title.trim())
    formData.append("content", content.trim())
    if (tagsInput.trim()) {
      formData.append("tags", tagsInput.trim())
    }
    if (imageFile) {
      formData.append("image", imageFile)
    }

    try {
      setSubmitting(true)
      await createArticle(formData)

      alert("🎉 Article published successfully!")
      setTitle("")
      setContent("")
      setTagsInput("")
      removeImage()
      setShowQuickPublish(false)

      if (page === 1) {
        fetchArticles()
      } else {
        setPage(1)
      }
    } catch (error: any) {
      console.error("Failed to create article:", error)
      alert(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to create article. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Extract all unique tags from articles
  const allTags = [
    "All",
    ...Array.from(
      new Set(
        articles.flatMap((art) => (Array.isArray(art.tags) ? art.tags : []))
      )
    )
  ]

  // Filtered articles list based on search and tag
  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.content?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTag =
      selectedTag === "All" ||
      (Array.isArray(art.tags) && art.tags.includes(selectedTag))
    return matchesSearch && matchesTag
  })

  // Helper for initials
  const getUserInitials = (nameOrEmail?: string) => {
    if (!nameOrEmail) return "U"
    return nameOrEmail.slice(0, 2).toUpperCase()
  }

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    } catch {
      return "Recently"
    }
  }

  return (
    <div className="home-dashboard-layout">
      {/* Top Navigation Bar */}
      <header className="article-navbar">
        <div className="nav-container">
          <Link to="/" className="brand-logo">
            <span className="logo-icon">📰</span>
            <span className="logo-text">RAD Articles</span>
          </Link>

          <div className="nav-user-actions">
            {user && (
              <div className="author-info">
                <div className="author-avatar" title={user.email}>
                  {getUserInitials(user.name || user.email)}
                </div>
                <span className="user-greeting">
                  Hi, <strong>{user.name || user.email?.split("@")[0]}</strong>
                </span>
              </div>
            )}

            <Link to="/create-article" className="btn-primary-nav">
              ✍️ Write Article
            </Link>

            <button
              onClick={handleLogout}
              className="btn-logout"
              title="Logout from account"
            >
              Logout ⎋
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-content">
          <span className="hero-badge">RAD Article Hub</span>
          <h1>Explore, Learn & Share Ideas</h1>
          <p>
            A modern publishing platform for tutorials, news, and technical
            insights. Create compelling stories with cover images and tags.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/create-article" className="hero-cta-btn">
              + New Article
            </Link>
            <button
              onClick={() => setShowQuickPublish(!showQuickPublish)}
              className="hero-cta-btn"
              style={{ background: "rgba(255, 255, 255, 0.15)", color: "#fff", border: "1px solid rgba(255, 255, 255, 0.3)" }}
            >
              {showQuickPublish ? "✕ Close Quick Post" : "⚡ Quick Post Here"}
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Dashboard */}
      <main className="dashboard-main">
        {/* Quick Inline Publish Form */}
        {showQuickPublish && (
          <section className="quick-publish-section">
            <div className="form-card-wrapper">
              <div className="form-header">
                <span className="badge-pill">⚡ Fast Publish</span>
                <h2 style={{ fontSize: "24px", fontWeight: 800, marginTop: "8px", color: "#1e293b" }}>
                  Create Article on the Fly
                </h2>
                <p className="form-subtitle">
                  Fill in the details below to publish directly to the community feed.
                </p>
              </div>

              <form onSubmit={submitForm} className="article-create-form">
                <div className="form-field">
                  <label htmlFor="quick-title">
                    Article Title <span className="req-star">*</span>
                  </label>
                  <input
                    id="quick-title"
                    type="text"
                    placeholder="Enter an engaging title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="quick-tags">
                    Tags <span className="label-hint">(comma-separated)</span>
                  </label>
                  <input
                    id="quick-tags"
                    type="text"
                    placeholder="e.g. react, node, tutorial"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>
                    Cover Image <span className="label-hint">(Optional)</span>
                  </label>
                  {!imagePreview ? (
                    <div className="upload-dropzone">
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="quick-file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="file-hidden-input"
                      />
                      <label htmlFor="quick-file" className="upload-dropzone-label">
                        <div className="upload-icon">📷</div>
                        <div className="upload-text">
                          <strong>Click to select an image</strong> or drag and drop
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="image-preview-card">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="preview-img"
                      />
                      <div className="preview-overlay">
                        <span className="file-name">{imageFile?.name}</span>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="btn-remove-img"
                        >
                          Remove ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="quick-content">
                    Article Content <span className="req-star">*</span>
                  </label>
                  <textarea
                    id="quick-content"
                    rows={6}
                    placeholder="Write your article content..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowQuickPublish(false)}
                    className="btn-cancel"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-submit-article"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-inline"></span>
                        Publishing...
                      </>
                    ) : (
                      "Publish Article 🚀"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* Filters & Search Header */}
        <section className="filters-bar">
          <div className="quick-publish-header">
            <h2 className="section-title">Latest Articles</h2>
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search articles by title or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Tag Filter Chips */}
          {allTags.length > 1 && (
            <div className="tag-filters">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`tag-filter-btn ${selectedTag === tag ? "active" : ""}`}
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag === "All" ? "All Topics" : `#${tag}`}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Loading Spinner */}
        {loadingArticles ? (
          <div className="loading-state">
            <div className="spinner-large"></div>
            <p>Loading latest articles...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          /* Empty State */
          <div className="empty-state-card">
            <div className="empty-icon">📝</div>
            <h3>No Articles Found</h3>
            <p>
              {searchQuery
                ? `No results matching "${searchQuery}". Try different keywords.`
                : "No articles published yet. Be the pioneer and share the very first article!"}
            </p>
            <Link to="/create-article" className="btn-empty-cta">
              Write First Article 🚀
            </Link>
          </div>
        ) : (
          /* Articles Grid */
          <div className="articles-grid">
            {filteredArticles.map((art: any) => (
              <article key={art._id} className="article-card">
                <div className="article-card-cover">
                  {art.imageURL ? (
                    <img
                      src={art.imageURL}
                      alt={art.title}
                      className="article-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="placeholder-cover">
                      <span className="placeholder-icon">📄</span>
                    </div>
                  )}
                </div>

                <div className="article-card-body">
                  {Array.isArray(art.tags) && art.tags.length > 0 && (
                    <div className="article-tags-row">
                      {art.tags.map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="tag-badge"
                          onClick={() => setSelectedTag(tag)}
                          title={`Filter by #${tag}`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <h3 className="article-title">{art.title}</h3>

                  <p className="article-snippet">{art.content}</p>

                  <div className="article-card-footer">
                    <div className="author-info">
                      <div className="author-avatar">
                        {getUserInitials(
                          art.author?.name || art.author?.email || "Author"
                        )}
                      </div>
                      <div>
                        <div className="author-name">
                          {art.author?.name || art.author?.email || "Community Author"}
                        </div>
                        <div className="article-date">
                          {formatDate(art.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {!loadingArticles && articles.length > 0 && totalPages > 1 && (
          <div className="pagination-container">
            <button
              disabled={page <= 1}
              onClick={() => {
                setPage((prev) => Math.max(1, prev - 1))
                window.scrollTo({ top: 400, behavior: "smooth" })
              }}
              className="pagination-btn"
            >
              ← Previous
            </button>

            <span className="pagination-info">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => {
                setPage((prev) => Math.min(totalPages, prev + 1))
                window.scrollTo({ top: 400, behavior: "smooth" })
              }}
              className="pagination-btn"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}