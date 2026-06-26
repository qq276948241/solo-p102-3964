import React from 'react';
import { useCart } from '../context/CartContext';

const CartBadge: React.FC = () => {
  const { totalQuantity, badgePopKey } = useCart();

  if (totalQuantity <= 0) return null;

  return (
    <span className="cart-badge" key={badgePopKey}>
      {totalQuantity > 99 ? '99+' : totalQuantity}
    </span>
  );
};

export default CartBadge;
