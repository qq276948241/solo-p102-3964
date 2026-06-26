import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Header: React.FC = () => {
  const location = useLocation();
  const { totalQuantity, cartBounceKey, badgePopKey } = useCart();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="nav-header">
      <div className="nav-inner">
        <Link to="/" className="brand">
          <div className="brand-icon">☕</div>
          <div className="brand-text">
            <h1>巷口咖啡</h1>
            <p>LANE COFFEE</p>
          </div>
        </Link>

        <nav className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            菜单
          </Link>
          <Link to="/cart" className={`nav-link ${isActive('/cart') ? 'active' : ''}`}>
            购物车
          </Link>
        </nav>

        <Link to="/cart" className="cart-btn" key={cartBounceKey}>
          <span>🛒</span>
          {totalQuantity > 0 && (
            <span className="cart-badge" key={badgePopKey}>
              {totalQuantity > 99 ? '99+' : totalQuantity}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};

export default Header;
