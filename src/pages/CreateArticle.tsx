import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { createArticle } from "../service/article"
import "../App.css"

export default function CreateArticle() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [author, setAuthor] = useState(user?.name || user?.email || "")
  const [tagsInput, setTagsInput] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (!file.type.startsWith("image/")) {
        setErrorMsg("Please upload a valid image file (PNG, JPG, WEBP, GIF)")
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      setErrorMsg("")
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setErrorMsg("")
    setSuccessMsg("")

    if (!title.trim() || !content.trim()) {
      setErrorMsg("Title and Content are required fields!")
      return
    }

    try {
      setLoading(true)

      // Construct multipart form data
      const formData = new FormData()
      formData.append("title", title.trim())
      formData.append("content", content.trim())
      formData.append(
        "author",
        author.trim() || user?.name || user?.email || "Anonymous"
      )

      if (tagsInput.trim()) {
        formData.append("tags", tagsInput.trim())
      }

      if (imageFile) {
        formData.append("image", imageFile)
      }

      const res = await createArticle(formData)
      setSuccessMsg(res.message || "Article published successfully!")

      setTimeout(() => {
        navigate("/")
      }, 1200)
    } catch (err: any) {
      console.error("Save article error:", err)
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to save article. Please try again."
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  const tagList = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)

  return (
    <div className="article-page-layout">
      {/* Top Navbar */}
      <header className="article-navbar">
        <div className="nav-container">
          <Link to="/" className="brand-logo">
            <span className="logo-icon">📰</span>
            <span className="logo-text">RAD Articles</span>
          </Link>
          <div className="nav-actions">
            <Link to="/" className="btn-secondary">
              ← Back to Articles
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="form-main-container">
        <div className="form-card-wrapper">
          <div className="form-header">
            <span className="badge-pill">New Post</span>
            <h1>Save New Article</h1>
            <p className="form-subtitle">
              Publish rich content with cover images using multipart form-data.
            </p>
          </div>

          {errorMsg && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <p>{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success">
              <span>✅</span>
              <p>{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="article-create-form">
            {/* Article Title */}
            <div className="form-field">
              <label htmlFor="article-title">
                Article Title <span className="req-star">*</span>
              </label>
              <input
                id="article-title"
                type="text"
                placeholder="e.g. Understanding Express Form Data and File Uploads"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Author */}
            <div className="form-field">
              <label htmlFor="article-author">Author Name</label>
              <input
                id="article-author"
                type="text"
                placeholder="Author name or your name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>

            {/* Tags */}
            <div className="form-field">
              <label htmlFor="article-tags">
                Tags <span className="label-hint">(Separate with commas)</span>
              </label>
              <input
                id="article-tags"
                type="text"
                placeholder="e.g. react, nodejs, express, mongodb"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
              {tagList.length > 0 && (
                <div className="tags-preview">
                  {tagList.map((tag, idx) => (
                    <span key={idx} className="tag-chip">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Image File Upload */}
            <div className="form-field">
              <label>
                Article Cover Image{" "}
                <span className="label-hint">
                  (Multipart File Upload - Max 10MB)
                </span>
              </label>

              {!imagePreview ? (
                <div className="upload-dropzone">
                  <input
                    type="file"
                    id="file-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-hidden-input"
                  />
                  <label htmlFor="file-upload" className="upload-dropzone-label">
                    <div className="upload-icon">📷</div>
                    <div className="upload-text">
                      <strong>Click to upload an image</strong> or drag and drop
                    </div>
                    <span className="upload-hint">
                      PNG, JPG, WEBP, GIF up to 10MB
                    </span>
                  </label>
                </div>
              ) : (
                <div className="image-preview-card">
                  <img
                    src={imagePreview}
                    alt="Cover preview"
                    className="preview-img"
                  />
                  <div className="preview-overlay">
                    <span className="file-name">{imageFile?.name}</span>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="btn-remove-img"
                    >
                      Remove Image ✕
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Article Content */}
            <div className="form-field">
              <label htmlFor="article-content">
                Article Content <span className="req-star">*</span>
              </label>
              <textarea
                id="article-content"
                rows={8}
                placeholder="Write your article story, tutorial, or insights here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="btn-cancel"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-submit-article"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-inline"></span>
                    Saving Article...
                  </>
                ) : (
                  "Publish Article 🚀"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
