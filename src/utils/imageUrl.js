const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Returns a fully qualified, accessible image URL for any stored image reference.
 * Prevents local PC file:/// paths and standardizes relative /uploads/ paths.
 * 
 * @param {string} urlPath - Stored image URL or path
 * @returns {string} Fully qualified web URL or empty string
 */
export const getImageUrl = (urlPath) => {
    if (!urlPath || typeof urlPath !== 'string') return '';
    
    const trimmed = urlPath.trim();
    if (!trimmed) return '';

    // If already absolute HTTP/HTTPS or Blob URL
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('blob:')) {
        return trimmed;
    }

    // Clean leading slash for consistency
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${BASE_URL}${cleanPath}`;
};

export default getImageUrl;
