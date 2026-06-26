import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../services/storage';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalQuantity, totalPrice, updateQuantity, removeItem, checkout } = useCart();
  const [notes, setNotes] = useState('');

  const handleCheckout = () => {
    if (items.length === 0) return;
    checkout(notes);
    navigate('/success');
  };

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-page-header">
          <h2>购物车</h2>
          <p>您的咖啡正在等您</p>
        </div>
        <div className="cart-items">
          <div className="empty-cart">
            <div className="empty-cart-icon">☕</div>
            <h3>还没选咖啡</h3>
            <p>去菜单看看有什么好喝的吧～</p>
            <Link to="/" className="back-to-menu-btn">
              去选咖啡
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const serviceFee = totalPrice >= 50 ? 0 : 3;
  const finalTotal = totalPrice + serviceFee;

  return (
    <div className="cart-page">
      <div className="cart-page-header">
        <h2>购物车</h2>
        <p>共 {totalQuantity} 件商品</p>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item, index) => (
            <div
              key={item.product.id}
              className="cart-item"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="cart-item-thumb">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/96x96/F5EFE6/4A2C1A?text=${encodeURIComponent(item.product.name.slice(0, 2))}`;
                  }}
                />
              </div>

              <div className="cart-item-info">
                <div>
                  <h4 className="cart-item-name">{item.product.name}</h4>
                  <p className="cart-item-unit">单价 {formatPrice(item.product.price)}</p>
                </div>

                <div className="cart-item-bottom">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className="qty-control">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="减少数量"
                      >
                        −
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        aria-label="增加数量"
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item.product.id)}
                      aria-label="删除商品"
                    >
                      ✕
                    </button>
                  </div>

                  <span className="cart-item-total">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="summary-panel">
          <h3 className="summary-title">订单汇总</h3>

          <div className="summary-row">
            <span className="summary-row-label">商品小计</span>
            <span className="summary-row-value">{formatPrice(totalPrice)}</span>
          </div>

          <div className="summary-row">
            <span className="summary-row-label">配送服务费</span>
            <span className="summary-row-value">
              {serviceFee === 0 ? '免服务费' : formatPrice(serviceFee)}
            </span>
          </div>

          {serviceFee > 0 && (
            <div className="summary-row" style={{ color: 'var(--color-accent)' }}>
              <span className="summary-row-label" style={{ color: 'var(--color-accent)' }}>
                再加 {formatPrice(50 - totalPrice)} 免服务费
              </span>
              <span></span>
            </div>
          )}

          <div className="summary-row total">
            <span className="summary-row-label">合计</span>
            <span className="summary-row-value">{formatPrice(finalTotal)}</span>
          </div>

          <textarea
            className="notes-input"
            placeholder="备注（选填）：少冰、去糖、堂食..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />

          <button
            className="checkout-btn"
            onClick={handleCheckout}
            disabled={items.length === 0}
          >
            <span>去下单</span>
            <span>{formatPrice(finalTotal)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
