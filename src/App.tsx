import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import SuccessPage from './pages/SuccessPage';
import './styles/theme.css';
import './styles/App.css';

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <div className="page-wrapper" key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/success" element={<SuccessPage />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <CartProvider>
      <BrowserRouter>
        <div className="app-container">
          <Header />
          <AnimatedRoutes />
        </div>
      </BrowserRouter>
    </CartProvider>
  );
};

export default App;
