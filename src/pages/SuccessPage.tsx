import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../services/storage';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { lastOrder } = useCart();

  if (!lastOrder) {
    return (
      <div className="success-page">
        <div className="success-card">
          <div className="empty-cart">
            <div className="empty-cart-icon">📝</div>
            <h3>暂无订单</h3>
            <p>快去选咖啡吧～</p>
            <Link to="/" className="back-to-menu-btn">
              去选咖啡
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderItemsCount = lastOrder.items.reduce((sum, item) => sum + item.quantity, 0);
  const serviceFee = lastOrder.total >= 50 ? 0 : 3;
  const createdDate = new Date(lastOrder.createdAt);
  const timeStr = `${createdDate.getHours().toString().padStart(2, '0')}:${createdDate.getMinutes().toString().padStart(2, '0')}`;

  const handleReorder = () => {
    navigate('/');
  };

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon-wrap">✓</div>

        <h2 className="success-title">下单成功！</h2>
        <p className="success-subtitle">我们正在精心为您准备，请耐心等候</p>

        <div className="order-number-box">
          <div className="order-number-label">取餐号</div>
          <div className="order-number">{lastOrder.orderNumber}</div>
        </div>

        <div className="order-info-row">
          <span className="order-info-label">下单时间</span>
          <span className="order-info-value">{timeStr}</span>
        </div>

        <div className="order-info-row">
          <span className="order-info-label">商品件数</span>
          <span className="order-info-value">{orderItemsCount} 件</span>
        </div>

        <div className="order-info-row">
          <span className="order-info-label">预计取餐</span>
          <span className="order-info-value time">约 {lastOrder.estimatedTime} 分钟</span>
        </div>

        <div className="order-list">
          <div className="order-list-title">订单详情</div>
          {lastOrder.items.map((item) => (
            <div key={item.product.id} className="order-list-item">
              <span className="order-list-item-name">{item.product.name}</span>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <span className="order-list-item-qty">×{item.quantity}</span>
                <span className="order-list-item-price">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </span>
            </div>
          ))}

          <div style={{ borderTop: '1px dashed var(--color-border)', marginTop: 12, paddingTop: 12 }}>
            <div className="order-list-item">
              <span className="order-list-item-name">商品小计</span>
              <span className="order-list-item-price">{formatPrice(lastOrder.total)}</span>
            </div>
            {serviceFee > 0 && (
              <div className="order-list-item">
                <span className="order-list-item-name">服务费</span>
                <span className="order-list-item-price">{formatPrice(serviceFee)}</span>
              </div>
            )}
            <div className="order-list-item" style={{ marginTop: 8 }}>
              <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: 16 }}>合计</span>
              <span style={{ fontWeight: 900, fontFamily: 'var(--font-serif)', color: 'var(--color-primary)', fontSize: 20 }}>
                {formatPrice(lastOrder.total + serviceFee)}
              </span>
            </div>
          </div>
        </div>

        {lastOrder.notes && (
          <div style={{ background: 'var(--color-bg-warm)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 28 }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6, letterSpacing: 1 }}>备注</div>
            <div style={{ fontSize: 14, color: 'var(--color-text)' }}>{lastOrder.notes}</div>
          </div>
        )}

        <button className="again-btn" onClick={handleReorder}>
          <span>🔄</span>
          <span>再来一单</span>
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
