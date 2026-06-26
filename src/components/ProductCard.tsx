import React from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const { addItem } = useCart();

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, e);
  };

  return (
    <div
      className="product-card"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="product-image">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://placehold.co/600x450/F5EFE6/4A2C1A?text=${encodeURIComponent(product.name)}`;
          }}
        />
        {product.tag && (
          <span className="product-tag">{product.tag}</span>
        )}
      </div>
      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-footer">
          <div className="product-price">
            <span className="price-symbol">¥</span>
            <span className="price-value">{product.price}</span>
          </div>
          <button
            className="add-btn"
            onClick={handleAdd}
            aria-label={`添加${product.name}到购物车`}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
