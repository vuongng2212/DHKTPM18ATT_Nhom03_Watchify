import React, { useState, useEffect } from 'react';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useCurrentApp } from '../../context/app.context';
import './styles.css';

/**
 * WishlistButton Component
 * A heart-shaped button that allows users to add/remove products from their wishlist
 * 
 * @param {Object} props
 * @param {string} props.productId - Product UUID
 * @param {string} props.size - Button size: 'small', 'default', 'large' (default: 'default')
 * @param {boolean} props.showText - Show text beside icon (default: false)
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onToggle - Callback function after toggle (optional)
 */
const WishlistButton = ({ 
  productId, 
  size = 'default', 
  showText = false,
  className = '',
  onToggle 
}) => {
  const { 
    isInWishlist, 
    toggleWishlistItem, 
    isAuthenticated,
    messageApi 
  } = useCurrentApp();

  const [isLoading, setIsLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  // Check wishlist status
  useEffect(() => {
    if (isAuthenticated && productId) {
      setInWishlist(isInWishlist(productId));
    }
  }, [productId, isAuthenticated, isInWishlist]);

  // Handle click
  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Check authentication
    if (!isAuthenticated) {
      messageApi.warning('Vui lòng đăng nhập để sử dụng danh sách yêu thích');
      return;
    }

    setIsLoading(true);

    try {
      const success = await toggleWishlistItem(productId);
      
      if (success) {
        setInWishlist(!inWishlist);
        
        // Call optional callback
        if (onToggle) {
          onToggle(!inWishlist);
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Size classes
  const sizeClasses = {
    small: 'wishlist-button-small',
    default: 'wishlist-button-medium',
    large: 'wishlist-button-large'
  };

  // Button content
  const buttonText = inWishlist ? 'Đã yêu thích' : 'Yêu thích';
  const tooltipText = inWishlist ? 'Bỏ yêu thích' : 'Thêm vào yêu thích';

  return (
    <Tooltip 
      title={tooltipText}
      placement="top"
    >
      <button
        className={`wishlist-button ${sizeClasses[size]} ${className} ${
          isLoading ? 'wishlist-button-loading' : ''
        } ${showText ? 'wishlist-button-with-text' : ''}`}
        onClick={handleClick}
        disabled={isLoading}
        aria-label={tooltipText}
      >
        {inWishlist ? (
          <HeartFilled className="wishlist-icon wishlist-icon-filled" />
        ) : (
          <HeartOutlined className="wishlist-icon wishlist-icon-outlined" />
        )}
        {showText && <span className="wishlist-button-text">{buttonText}</span>}
      </button>
    </Tooltip>
  );
};

export default WishlistButton;