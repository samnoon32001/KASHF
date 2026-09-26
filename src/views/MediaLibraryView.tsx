import React, { useState } from 'react';
import {
  FolderTree,
  Upload,
  Search,
  Download,
  Copy,
  Check,
  Trash2,
  FileText,
  Video,
  Image as ImageIcon,
  Tag,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MediaCategory, MediaItem } from '../types';

export const MediaLibraryView: React.FC = () => {
  const { media, addMediaItem, deleteMediaItem, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Upload Form
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<MediaCategory>('Posters');
  const [formUrl, setFormUrl] = useState('');
  const [formTags, setFormTags] = useState('Admissions, 2026');
  const [formType, setFormType] = useState('PNG Image');

  const categories: MediaCategory[] = [
    'Posters',
    'Videos',
    'Reels',
    'Photos',
    'Documents',
    'Logos',
    'Certificates',
    'Social Media',
    'Website Assets',
  ];

  const filteredMedia = media.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopyLink = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    addMediaItem({
      name: formName,
      category: formCategory,
      url: formUrl || 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80',
      size: '3.4 MB',
      type: formType,
      uploadedBy: currentUser?.name || 'Marcus Vance',
      tags: formTags.split(',').map((t) => t.trim()),
    });

    setFormName('');
    setFormUrl('');
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Institutional Media & Asset Library
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Centralized media repository for branding, certificates, banners, reels, and print materials.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 rounded-xl bg-[#117B78] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] transition cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Media Asset</span>
        </button>
      </div>

      {/* Category Pills & Search */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#117B78] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Assets ({media.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#117B78] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by asset name or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-[#117B78] outline-none"
          />
        </div>
      </div>

      {/* Media Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMedia.map((item) => (
          <div
            key={item.id}
            className="group rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              {/* Preview Thumbnail */}
              <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
                <img
                  src={item.url}
                  alt={item.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-2.5 left-2.5 rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white">
                  {item.category}
                </span>

                <button
                  onClick={() => deleteMediaItem(item.id)}
                  className="absolute top-2.5 right-2.5 h-7 w-7 rounded-lg bg-black/50 text-white hover:text-rose-400 flex items-center justify-center transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Info */}
              <div className="p-4">
                <h4 className="text-xs font-bold text-slate-900 truncate" title={item.name}>
                  {item.name}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>{item.type}</span>
                  <span>{item.size}</span>
                </div>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <button
                onClick={() => handleCopyLink(item)}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-[#117B78] transition cursor-pointer"
              >
                {copiedId === item.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] font-bold text-[#117B78] hover:underline"
              >
                <span>Preview</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Upload Media Asset</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add posters, branding guidelines, videos, or design templates.
            </p>

            <form onSubmit={handleUploadSubmit} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Admissions_2026_Flyer.pdf"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-[#117B78]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as MediaCategory)}
                  className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs font-semibold outline-none focus:border-[#117B78]"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Image / File Direct URL
                </label>
                <input
                  type="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or cloud storage URL"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-[#117B78]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="Admissions, Posters, Vector"
                  className="w-full h-10 rounded-xl border border-slate-200 px-3.5 text-xs outline-none focus:border-[#117B78]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#117B78] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0D9C88] cursor-pointer"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
