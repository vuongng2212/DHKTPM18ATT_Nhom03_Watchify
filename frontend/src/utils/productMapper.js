/**
 * Helper functions to map product data between backend and frontend formats
 */

/**
 * Format product data from backend to frontend standard
 * @param {Object} product - Product data from backend API
 * @returns {Object} - Formatted product data for frontend use
 */
export const formatProductFromBackend = (product) => {
  return {
    id: product.id,
    name: product.name || product.tenDH || "Không có tên",
    slug: product.slug || "",
    sku: product.sku || product.maDH || "Không rõ",
    description: product.description || product.moTa || "",
    shortDescription: product.shortDescription || "",
    
    // Handle price - backend returns BigDecimal, convert to number
    price: convertPrice(product.price || product.giaBan || 0),
    originalPrice: convertPrice(product.originalPrice || 0),
    discountPercentage: product.discountPercentage || 0,
    
    status: product.status || "active",
    isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
    isOnSale: product.isOnSale || false,
    
    // Category and brand information
    category: product.category || { id: product.categoryId, name: product.danhMuc || "Không rõ" },
    brand: product.brand || { id: product.brandId, name: product.thuongHieu || "Không rõ" },
    
    // Counters
    viewCount: product.viewCount || 0,
    isFeatured: product.isFeatured || false,
    isNew: product.isNew || false,
    displayOrder: product.displayOrder || 0,
    
    // Images - handle both backend format and legacy format
    images: product.images?.map(img => 
      typeof img === 'string' ? img : (img.imageUrl || (img.duLieuAnh && typeof img.duLieuAnh === 'object' ? img.duLieuAnh.url : img.duLieuAnh))
    ) || [],
    
    // Additional info
    detail: product.detail || null,
    averageRating: product.averageRating || 0,
    reviewCount: product.reviewCount || 0,
    
    // Timestamps
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

/**
 * Format multiple products from backend
 * @param {Array} products - Array of product data from backend API
 * @returns {Array} - Formatted products for frontend use
 */
export const formatProductsFromBackend = (products) => {
  return (products || []).map(formatProductFromBackend);
};

/**
 * Convert price from backend format (BigDecimal string or object) to number
 * @param {any} price - Price from backend
 * @returns {number} - Converted price as number
 */
const convertPrice = (price) => {
  if (typeof price === 'number') {
    return price;
  }
  if (typeof price === 'string') {
    // Remove non-numeric characters except decimal point
    return parseFloat(price.replace(/[^\d.]/g, "")) || 0;
  }
  if (typeof price === 'object' && price !== null) {
    // Handle BigDecimal object from backend
    if (typeof price.toString === 'function') {
      return parseFloat(price.toString()) || 0;
    }
    // If it has a value property or similar
    return parseFloat(Object.values(price)[0]) || 0;
  }
 return 0;
};

/**
 * Format product data for cart use
 * @param {Object} product - Product data
 * @returns {Object} - Formatted product for cart
 */
export const formatProductForCart = (product) => {
 const formatted = formatProductFromBackend(product);
  return {
    ...formatted,
    quantity: product.quantity || 1,
    _id: product._id || formatted.id, // Use existing _id or fallback to id
 };
};