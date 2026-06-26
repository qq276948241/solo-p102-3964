import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import {
  ProductSpec,
  DEFAULT_SPEC,
  TEMPERATURE_OPTIONS,
  CUPSIZE_OPTIONS,
  hasSpecOptions,
  calculatePrice,
  formatSpecLabel
} from '../data/products';

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const { addItem } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [tempSpec, setTempSpec] = useState<ProductSpec>(DEFAULT_SPEC);
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerBtnRef = useRef<HTMLButtonElement>(null);

  const needSpec = hasSpecOptions(product.category);
  const displayPrice = calculatePrice(product.price, tempSpec);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (needSpec) {
      setTempSpec(DEFAULT_SPEC);
      setShowModal(true);
    } else {
      addItem(product, undefined, e);
    }
  };

  const handleConfirmSpec = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, tempSpec, {
      currentTarget: (triggerBtnRef.current ?? e.currentTarget) as HTMLElement,
      stopPropagation: () => {}
    } as unknown as React.MouseEvent);
    setShowModal(false);
  };

  useEffect(() => {
    if (!showModal) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowModal(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showModal]);

  return (
    <>
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
          {needSpec && (
            <span
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                padding: '5px 10px',
                borderRadius: 9999,
                background: 'rgba(74, 44, 26, 0.92)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 0.5,
                boxShadow: '0 2px 6px rgba(74,44,26,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span>⚙️</span>
              <span>选规格</span>
            </span>
          )}
        </div>
        <div className="product-body">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-desc">{product.description}</p>
          {needSpec && (
            <p
              style={{
                fontSize: 12,
                color: '#9C8B7C',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: 6,
                background: '#F5EFE6',
                color: '#6B5B4E',
                fontSize: 11
              }}>
                {formatSpecLabel(DEFAULT_SPEC)} 起
              </span>
              <span>大杯 +¥3</span>
            </p>
          )}
          <div className="product-footer">
            <div className="product-price">
              <span className="price-symbol">¥</span>
              <span className="price-value">{product.price}</span>
            </div>
            <button
              ref={triggerBtnRef}
              className="add-btn"
              onClick={handleAddClick}
              aria-label={`添加${product.name}到购物车`}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(45, 31, 20, 0.45)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000,
              animation: 'fadeIn 0.2s ease-out'
            }}
          />
          <div
            ref={modalRef}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1001,
              width: 'min(92vw, 380px)',
              background: '#FAF7F2',
              borderRadius: 20,
              boxShadow: '0 20px 48px rgba(74, 44, 26, 0.24), 0 8px 16px rgba(74, 44, 26, 0.12)',
              overflow: 'hidden',
              animation: 'scaleIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16 / 9',
                background: '#F5EFE6'
              }}
            >
              <img
                src={product.image}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://placehold.co/600x338/F5EFE6/4A2C1A?text=${encodeURIComponent(product.name)}`;
                }}
              />
              <button
                onClick={(e) => { e.stopPropagation(); setShowModal(false); }}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.95)',
                  color: '#4A2C1A',
                  fontSize: 16,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }}
                aria-label="关闭"
              >
                ✕
              </button>
              {product.tag && (
                <span
                  style={{
                    position: 'absolute',
                    top: 14,
                    left: 14,
                    padding: '5px 12px',
                    borderRadius: 9999,
                    background: 'rgba(255,255,255,0.95)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#4A2C1A',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                  }}
                >
                  {product.tag}
                </span>
              )}
            </div>

            <div style={{ padding: '20px 22px 22px' }}>
              <div style={{ marginBottom: 18 }}>
                <h3
                  style={{
                    fontFamily: "'Noto Serif SC', serif",
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#4A2C1A',
                    marginBottom: 4
                  }}
                >
                  {product.name}
                </h3>
                <p style={{ fontSize: 13, color: '#6B5B4E', lineHeight: 1.5 }}>
                  {product.description}
                </p>
              </div>

              <div style={{ marginBottom: 18 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#4A2C1A',
                    marginBottom: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span>🌡️</span>
                  <span>温度</span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {TEMPERATURE_OPTIONS.map(opt => {
                    const active = tempSpec.temperature === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          setTempSpec(s => ({ ...s, temperature: opt.value }));
                        }}
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          borderRadius: 12,
                          border: active ? '2px solid #4A2C1A' : '1.5px solid #E8DFD3',
                          background: active ? '#4A2C1A' : '#FFFFFF',
                          color: active ? '#FFFFFF' : '#4A2C1A',
                          fontSize: 15,
                          fontWeight: active ? 700 : 500,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          transition: 'all 0.18s ease-out',
                          boxShadow: active ? '0 4px 10px rgba(74,44,26,0.2)' : 'none'
                        }}
                      >
                        <span>{opt.icon}</span>
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 22 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#4A2C1A',
                    marginBottom: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span>🥤</span>
                  <span>杯型</span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {CUPSIZE_OPTIONS.map(opt => {
                    const active = tempSpec.cupSize === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          setTempSpec(s => ({ ...s, cupSize: opt.value }));
                        }}
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          borderRadius: 12,
                          border: active ? '2px solid #4A2C1A' : '1.5px solid #E8DFD3',
                          background: active ? '#4A2C1A' : '#FFFFFF',
                          color: active ? '#FFFFFF' : '#4A2C1A',
                          fontSize: 15,
                          fontWeight: active ? 700 : 500,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 2,
                          transition: 'all 0.18s ease-out',
                          boxShadow: active ? '0 4px 10px rgba(74,44,26,0.2)' : 'none'
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{
                            display: 'inline-block',
                            minWidth: 20,
                            height: 20,
                            padding: '0 6px',
                            borderRadius: 6,
                            background: active ? 'rgba(255,255,255,0.2)' : '#F5EFE6',
                            color: active ? '#fff' : '#6B5B4E',
                            fontSize: 11,
                            fontWeight: 700,
                            textAlign: 'center',
                            lineHeight: '20px'
                          }}>
                            {opt.suffix}
                          </span>
                          <span>{opt.label}</span>
                        </span>
                        {opt.priceDelta > 0 && (
                          <span style={{
                            fontSize: 11,
                            opacity: 0.85,
                            fontWeight: 500
                          }}>
                            +¥{opt.priceDelta}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 18,
                  borderTop: '2px dashed #E8DFD3'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#C4956A' }}>¥</span>
                  <span
                    style={{
                      fontSize: 32,
                      fontWeight: 900,
                      fontFamily: "'Noto Serif SC', serif",
                      color: '#4A2C1A',
                      letterSpacing: -0.5
                    }}
                  >
                    {displayPrice}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: '#9C8B7C',
                      marginLeft: 8
                    }}
                  >
                    {formatSpecLabel(tempSpec)}
                  </span>
                </div>
                <button
                  onClick={handleConfirmSpec}
                  style={{
                    padding: '14px 28px',
                    borderRadius: 9999,
                    background: 'linear-gradient(135deg, #4A2C1A 0%, #6B4423 100%)',
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: "'Noto Serif SC', serif",
                    letterSpacing: 1,
                    boxShadow: '0 6px 16px rgba(74,44,26,0.28)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span>加入购物车</span>
                  <span style={{ fontSize: 18 }}>+</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ProductCard;
