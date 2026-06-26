import React, { useState, useMemo } from 'react';
import { categories, products } from '../data/products';
import { CategoryType } from '../types';
import ProductCard from '../components/ProductCard';

const MenuPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('latte');

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="menu-page">
      <div className="menu-hero">
        <h2>今日菜单</h2>
        <p>精选优质咖啡豆，为您调制每一杯好咖啡</p>
      </div>

      <div className="category-tabs">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      <div className="products-grid">
        {filteredProducts.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
