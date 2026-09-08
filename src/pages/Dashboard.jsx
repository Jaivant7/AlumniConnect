import { useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import {
    MessageSquare,
    Heart,
    Send,
    Trash2,
    Image,
    Sparkles,
    Building,
    MapPin,
    Briefcase,
    ChevronRight,
    Users,
    MessageCircle,
    UserCheck,
    X,
    ExternalLink,
    Upload,
    Paperclip
} from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUrl';

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    // Forum State
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostImage, setNewPostImage] = useState('');
    const [uploadingPostImage, setUploadingPostImage] = useState(false);
    const [showImageInput, setShowImageInput] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [activeCommentPostId, setActiveCommentPostId] = useState(null);
    const [commentInput, setCommentInput] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    // Handler: File Upload for Forum Post
    const handlePostImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Prohibit .gif files strictly
        if (file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')) {
            alert('GIF files (.gif) are prohibited! Please select a JPG, PNG, or WEBP image.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('File is too large! Maximum allowed size is 5MB.');
            return;
        }

        const uploadData = new FormData();
        uploadData.append('image', file);

        setUploadingPostImage(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`
                },
            };
            const { data } = await api.post('/api/upload', uploadData, config);
            setNewPostImage(data.imageUrl);
        } catch (error) {
            console.error('Error uploading post image', error);
            alert(error.response?.data?.message || 'Failed to upload image. Please try again.');
        } finally {
            setUploadingPostImage(false);
        }
    };

    // Sidebar Data State
    const [featuredAlumni, setFeaturedAlumni] = useState([]);
    const [recentJobs, setRecentJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            try {
                // 1. Fetch Forum Posts
                const postsRes = await api.get('/api/posts', config);
                setPosts(postsRes.data);

                // 2. Fetch Alumni for Spotlight
                const usersRes = await api.get('/api/users', config);
                const alumni = usersRes.data.filter(u => u.role === 'alumni' && u._id !== user._id);
                setFeaturedAlumni(alumni.slice(0, 4));

                // 3. Fetch Recent Jobs
                const jobsRes = await api.get('/api/jobs', config);
                setRecentJobs(jobsRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3));

            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user.token, user._id]);

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 10) return "Just now";
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    };

    // Handler: Create New Post
    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        setIsPosting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await api.post('/api/posts', {
                content: newPostContent,
                image: newPostImage
            }, config);

            setPosts([res.data, ...posts]);
            setNewPostContent('');
            setNewPostImage('');
            setShowImageInput(false);
        } catch (error) {
            console.error("Error creating post", error);
        } finally {
            setIsPosting(false);
        }
    };

    // Handler: Toggle Like
    const handleLikePost = async (postId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await api.put(`/api/posts/${postId}/like`, {}, config);

            setPosts(posts.map(p => p._id === postId ? res.data : p));
        } catch (error) {
            console.error("Error liking post", error);
        }
    };

    // Handler: Add Comment
    const handleAddComment = async (postId) => {
        if (!commentInput.trim()) return;

        setSubmittingComment(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await api.post(`/api/posts/${postId}/comments`, { text: commentInput }, config);

            setPosts(posts.map(p => p._id === postId ? res.data : p));
            setCommentInput('');
        } catch (error) {
            console.error("Error adding comment", error);
        } finally {
            setSubmittingComment(false);
        }
    };

    // Handler: Delete Comment
    const handleDeleteComment = async (postId, commentId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await api.delete(`/api/posts/${postId}/comments/${commentId}`, config);
            setPosts(posts.map(p => p._id === postId ? res.data : p));
        } catch (error) {
            console.error("Error deleting comment", error);
        }
    };

    // Handler: Delete Post
    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await api.delete(`/api/posts/${postId}`, config);
            setPosts(posts.filter(p => p._id !== postId));
        } catch (error) {
            console.error("Error deleting post", error);
        }
    };

    const getRoleBadgeStyle = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'alumni':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'student':
            default:
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/60 body-font">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                
                {/* Welcome Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase mb-3 text-blue-100 border border-white/20">
                            <Sparkles size={14} className="text-yellow-300" /> Academic Community Hub
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold heading-font tracking-tight">
                            Welcome back, {user.name}! 👋
                        </h2>
                        <p className="text-blue-100 text-sm sm:text-base mt-1 max-w-xl">
                            Connect with fellow alumni, ask advice, share insights, and discover opportunities in your college network.
                        </p>
                    </div>
                    <div className="relative z-10 flex items-center gap-3">
                        <Link
                            to={`/profile/${user._id}`}
                            className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white font-semibold text-sm rounded-xl backdrop-blur-md transition-all duration-200 border border-white/30 shadow-sm flex items-center gap-2"
                        >
                            <UserCheck size={16} /> My Profile
                        </Link>
                    </div>
                </div>

                {/* Main Grid: Forum (Left 2 cols) + Sidebar (Right 1 col) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* -------------------- MAIN SECTION: PUBLIC FORUM -------------------- */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Create Post Widget */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm flex-shrink-0">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="flex-1">
                                    <textarea
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                        placeholder={`Share something with your alumni network, ${user.name.split(' ')[0]}...`}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none min-h-[90px]"
                                    />

                                    {/* Uploaded Image Preview / URL Input */}
                                    {newPostImage && (
                                        <div className="mt-3 relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 max-h-48 flex items-center justify-center">
                                            <img src={getImageUrl(newPostImage)} alt="Upload preview" className="max-h-48 object-contain" />
                                            <button
                                                type="button"
                                                onClick={() => setNewPostImage('')}
                                                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                                                title="Remove image"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}

                                    {showImageInput && !newPostImage && (
                                        <div className="mt-3 relative">
                                            <input
                                                type="url"
                                                value={newPostImage}
                                                onChange={(e) => setNewPostImage(e.target.value)}
                                                placeholder="Paste image URL (e.g. https://example.com/photo.jpg)"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                                            />
                                        </div>
                                    )}

                                    {/* Hidden File Input for Device Upload */}
                                    <input
                                        type="file"
                                        accept="image/png, image/jpeg, image/jpg, image/webp"
                                        id="dashboard-post-file-input"
                                        className="hidden"
                                        onChange={handlePostImageUpload}
                                        disabled={uploadingPostImage}
                                    />

                                    {/* Action Bar */}
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <label
                                                htmlFor="dashboard-post-file-input"
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${uploadingPostImage ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                                            >
                                                <Upload size={14} /> {uploadingPostImage ? 'Uploading Image...' : 'Upload Image File'}
                                            </label>

                                            <button
                                                type="button"
                                                onClick={() => setShowImageInput(!showImageInput)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${showImageInput ? 'bg-gray-200 text-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}
                                            >
                                                <Image size={14} /> Image URL
                                            </button>
                                        </div>

                                        <button
                                            onClick={handleCreatePost}
                                            disabled={isPosting || uploadingPostImage || !newPostContent.trim()}
                                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2"
                                        >
                                            {isPosting ? (
                                                <span>Posting...</span>
                                            ) : (
                                                <>
                                                    <Send size={14} /> Post to Forum
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Forum Header & Filters */}
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-xl font-bold text-gray-900 heading-font flex items-center gap-2">
                                <MessageCircle className="text-blue-600" size={22} />
                                Public Forum Feed
                            </h3>
                            <span className="text-xs text-gray-500 font-medium bg-gray-200/60 px-2.5 py-1 rounded-full">
                                {posts.length} {posts.length === 1 ? 'Discussion' : 'Discussions'}
                            </span>
                        </div>

                        {/* Forum Feed */}
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((n) => (
                                    <div key={n} className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                                            <div className="space-y-2 flex-1">
                                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                                            </div>
                                        </div>
                                        <div className="h-12 bg-gray-100 rounded-xl"></div>
                                    </div>
                                ))}
                            </div>
                        ) : posts.length > 0 ? (
                            <div className="space-y-5">
                                {posts.map((post) => {
                                    const isLiked = post.likes?.some(id => (id._id || id).toString() === user._id.toString());
                                    const isOwner = (post.user?._id || post.user).toString() === user._id.toString();
                                    const isCommentsOpen = activeCommentPostId === post._id;

                                    return (
                                        <div key={post._id} className="bg-white rounded-2xl p-6 border border-gray-200/90 shadow-sm hover:border-blue-200 transition-all duration-200">
                                            
                                            {/* Author Info & Actions */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <Link to={`/profile/${post.user?._id}`}>
                                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm hover:opacity-90 transition-opacity">
                                                            {post.user?.name ? post.user.name.charAt(0).toUpperCase() : 'U'}
                                                        </div>
                                                    </Link>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <Link to={`/profile/${post.user?._id}`} className="font-bold text-gray-900 hover:text-blue-600 transition-colors text-base">
                                                                {post.user?.name || 'Anonymous User'}
                                                            </Link>
                                                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${getRoleBadgeStyle(post.user?.role)}`}>
                                                                {post.user?.role || 'Member'}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                                                            <span>
                                                                {post.user?.role === 'alumni' && (post.user?.currentRole || post.user?.company)
                                                                    ? `${post.user.currentRole || ''} ${post.user.company ? '@ ' + post.user.company : ''}`
                                                                    : post.user?.role === 'student' && post.user?.department
                                                                        ? `${post.user.department} Student`
                                                                        : 'Community Member'}
                                                            </span>
                                                            <span>•</span>
                                                            <span>{getTimeAgo(post.createdAt)}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                {(isOwner || user.role === 'admin') && (
                                                    <button
                                                        onClick={() => handleDeletePost(post._id)}
                                                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                                        title="Delete Post"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Post Content */}
                                            <p className="text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-line mb-4 font-normal">
                                                {post.content}
                                            </p>

                                            {/* Optional Post Image */}
                                            {post.image && (
                                                <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 max-h-96 flex items-center justify-center">
                                                    <img
                                                        src={getImageUrl(post.image)}
                                                        alt="Post attachment"
                                                        className="w-full h-auto object-cover max-h-96 rounded-xl hover:scale-[1.01] transition-transform duration-300"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                </div>
                                            )}

                                            {/* Interaction Controls */}
                                            <div className="flex items-center gap-6 pt-3 border-t border-gray-100 text-sm">
                                                {/* Like Button */}
                                                <button
                                                    onClick={() => handleLikePost(post._id)}
                                                    className={`flex items-center gap-2 font-medium text-xs sm:text-sm px-3 py-1.5 rounded-lg transition-colors ${isLiked ? 'text-red-600 bg-red-50 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                                                >
                                                    <Heart size={18} className={isLiked ? 'fill-red-600 text-red-600' : 'text-gray-500'} />
                                                    <span>{post.likes ? post.likes.length : 0} Likes</span>
                                                </button>

                                                {/* Comments Button */}
                                                <button
                                                    onClick={() => setActiveCommentPostId(isCommentsOpen ? null : post._id)}
                                                    className={`flex items-center gap-2 font-medium text-xs sm:text-sm px-3 py-1.5 rounded-lg transition-colors ${isCommentsOpen ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                                                >
                                                    <MessageSquare size={18} className={isCommentsOpen ? 'text-blue-600' : 'text-gray-500'} />
                                                    <span>{post.comments ? post.comments.length : 0} Comments</span>
                                                </button>
                                            </div>

                                            {/* Expandable Comments Drawer */}
                                            {isCommentsOpen && (
                                                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-fade-in bg-gray-50/50 p-4 rounded-xl">
                                                    
                                                    {/* Existing Comments */}
                                                    {post.comments && post.comments.length > 0 ? (
                                                        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                                            {post.comments.map((cmt) => {
                                                                const isCmtAuthor = (cmt.user?._id || cmt.user).toString() === user._id.toString();
                                                                return (
                                                                    <div key={cmt._id} className="flex items-start justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200/70 shadow-2xs">
                                                                        <div className="flex items-start gap-2.5">
                                                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                                                                                {cmt.user?.name ? cmt.user.name.charAt(0).toUpperCase() : 'U'}
                                                                            </div>
                                                                            <div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="font-bold text-xs text-gray-900">
                                                                                        {cmt.user?.name || 'User'}
                                                                                    </span>
                                                                                    <span className="text-[10px] text-gray-400">
                                                                                        {getTimeAgo(cmt.createdAt)}
                                                                                    </span>
                                                                                </div>
                                                                                <p className="text-xs text-gray-700 mt-1 leading-normal">
                                                                                    {cmt.text}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        {(isCmtAuthor || isOwner || user.role === 'admin') && (
                                                                            <button
                                                                                onClick={() => handleDeleteComment(post._id, cmt._id)}
                                                                                className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
                                                                                title="Delete comment"
                                                                            >
                                                                                <Trash2 size={13} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-gray-500 text-center py-2">No comments yet. Start the conversation!</p>
                                                    )}

                                                    {/* Add Comment Form */}
                                                    <div className="flex items-center gap-2 pt-2">
                                                        <input
                                                            type="text"
                                                            value={commentInput}
                                                            onChange={(e) => setCommentInput(e.target.value)}
                                                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post._id); }}
                                                            placeholder="Write a comment..."
                                                            className="flex-1 bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        <button
                                                            onClick={() => handleAddComment(post._id)}
                                                            disabled={submittingComment || !commentInput.trim()}
                                                            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                                                        >
                                                            <Send size={12} /> Reply
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-10 border border-gray-200 text-center space-y-3">
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                                    <MessageSquare size={28} />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900">No forum posts yet</h4>
                                <p className="text-sm text-gray-500 max-w-md mx-auto">
                                    Be the first person in your academic network to share an announcement, ask a question, or open a discussion!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* -------------------- RIGHT SIDEBAR: RECENT ACTIVITY & ALUMNI SPOTLIGHT -------------------- */}
                    <div className="space-y-6">

                        {/* 1. Quick Forum Activity / Trending Discussions */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-200/90 shadow-sm">
                            <h4 className="text-base font-bold text-gray-900 mb-4 heading-font flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Sparkles size={18} className="text-amber-500" /> Recent Discussions
                                </span>
                                <span className="text-xs text-blue-600 font-semibold">Active</span>
                            </h4>

                            <div className="space-y-3">
                                {posts.slice(0, 4).length > 0 ? (
                                    posts.slice(0, 4).map((p) => (
                                        <div 
                                            key={p._id}
                                            onClick={() => setActiveCommentPostId(p._id)}
                                            className="p-3 bg-gray-50 hover:bg-blue-50/60 rounded-xl border border-gray-100 hover:border-blue-200 transition-all cursor-pointer group"
                                        >
                                            <p className="text-xs font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                "{p.content}"
                                            </p>
                                            <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2">
                                                <span>by {p.user?.name || 'Member'}</span>
                                                <span className="flex items-center gap-1 font-medium text-gray-500">
                                                    <MessageSquare size={12} /> {p.comments ? p.comments.length : 0}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 text-center py-4">No recent activity</p>
                                )}
                            </div>
                        </div>

                        {/* 2. Alumni Spotlight */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-200/90 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-base font-bold text-gray-900 heading-font flex items-center gap-2">
                                    <Users className="text-blue-600" size={18} /> Alumni Spotlight
                                </h4>
                                <Link to="/directory" className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5">
                                    View All <ChevronRight size={14} />
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {featuredAlumni.length > 0 ? (
                                    featuredAlumni.map((alumni) => (
                                        <div key={alumni._id} className="p-3.5 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-gray-50/50 transition-all">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs flex-shrink-0">
                                                    {alumni.name ? alumni.name.charAt(0).toUpperCase() : 'A'}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h5 className="font-bold text-gray-900 text-sm truncate">{alumni.name}</h5>
                                                    <p className="text-xs text-gray-600 truncate mt-0.5 font-medium">
                                                        {alumni.currentRole || 'Alumni Member'}
                                                    </p>
                                                    {alumni.company && (
                                                        <p className="text-[11px] text-gray-500 truncate flex items-center gap-1 mt-0.5">
                                                            <Building size={12} className="text-gray-400" /> {alumni.company}
                                                        </p>
                                                    )}
                                                    {alumni.bio && (
                                                        <p className="text-[11px] text-gray-500 line-clamp-2 mt-1.5 italic bg-gray-50 p-1.5 rounded border border-gray-100">
                                                            "{alumni.bio}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                                                <span className="text-[11px] text-gray-400 font-medium">
                                                    Graduated {alumni.graduationYear || 'Alumnus'}
                                                </span>
                                                <Link
                                                    to={`/profile/${alumni._id}`}
                                                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                                                >
                                                    View Profile <ChevronRight size={12} />
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 text-center py-4">No alumni found in domain.</p>
                                )}
                            </div>
                        </div>

                        {/* 3. Recent Opportunities Quick Widget */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-200/90 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-base font-bold text-gray-900 heading-font flex items-center gap-2">
                                    <Briefcase className="text-indigo-600" size={18} /> Top Job Openings
                                </h4>
                                <Link to="/jobs" className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5">
                                    All Jobs <ChevronRight size={14} />
                                </Link>
                            </div>

                            <div className="space-y-3">
                                {recentJobs.length > 0 ? (
                                    recentJobs.map((job) => (
                                        <div key={job._id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 transition-all">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h5 className="font-semibold text-xs text-gray-900 line-clamp-1">{job.title}</h5>
                                                    <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                                                        <Building size={11} /> {job.company}
                                                    </p>
                                                </div>
                                                <a
                                                    href={job.applyLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-indigo-600 hover:text-indigo-800 p-1 font-semibold text-xs flex items-center gap-0.5"
                                                    title="Apply"
                                                >
                                                    <ExternalLink size={14} />
                                                </a>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 text-center py-3">No active job openings</p>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
