import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductsStore } from '../store/productsStore';
import { useAuthStore } from '../store/authStore';
import AddProductModal from '../components/AddProductModal';
import {
  Search,
  RefreshCw,
  Plus,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  LogOut,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { NewProduct, Product, SortField } from '../types';
import './ProductsPage.css';

const ProductsPage: React.FC = () => {
  const {
    products,
    total,
    page,
    limit,
    loading,
    searchQuery,
    sortBy,
    sortOrder,
    selectedIds,
    fetchProducts,
    setPage,
    setSearch,
    setSort,
    toggleSelect,
    toggleSelectAll,
    addLocalProduct,
    refresh,
  } = useProductsStore();

  const { logout, username } = useAuthStore();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearch(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setSearch(value);
      }, 300);
    },
    [setSearch]
  );

  const handleAddProduct = (newProduct: NewProduct) => {
    const product: Product = {
      id: Date.now(),
      title: newProduct.title,
      description: '',
      category: 'Новый товар',
      price: Number(newProduct.price),
      discountPercentage: 0,
      rating: 5.0,
      stock: 0,
      tags: [],
      brand: newProduct.brand,
      sku: newProduct.sku,
      weight: 0,
      dimensions: { width: 0, height: 0, depth: 0 },
      warrantyInformation: '',
      shippingInformation: '',
      availabilityStatus: '',
      reviews: [],
      returnPolicy: '',
      minimumOrderQuantity: 1,
      meta: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        barcode: '',
        qrCode: '',
      },
      thumbnail: '',
      images: [],
    };
    addLocalProduct(product);
    toast.success('Товар успешно добавлен');
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const totalPages = Math.ceil(total / limit);
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const formatPrice = (price: number) => {
    const formatted = price.toLocaleString('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    // Split into integer and decimal parts
    const commaIdx = formatted.lastIndexOf(',');
    if (commaIdx !== -1) {
      const intPart = formatted.slice(0, commaIdx);
      const decPart = formatted.slice(commaIdx);
      return (
        <>
          {intPart}
          <span className="price-decimal">{decPart}</span>
        </>
      );
    }
    return <>{formatted}</>;
  };

  const getSortIcon = (field: SortField) => {
    if (sortBy !== field) return <ArrowUpDown size={14} className="sort-icon-neutral" />;
    return sortOrder === 'asc' ? (
      <ArrowUp size={14} className="sort-icon-active" />
    ) : (
      <ArrowDown size={14} className="sort-icon-active" />
    );
  };

  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="products-page">
      {/* Header */}
      <div className="products-header">
        <h1 className="products-main-title">Товары</h1>
        <div className="header-right">
          <div className="search-wrapper" id="search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              id="products-search"
              type="text"
              placeholder="Найти"
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className="user-section">
            <span className="username-display">{username || 'User'}</span>
            <button className="logout-btn" onClick={handleLogout} title="Выйти">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="products-toolbar">
        <h2 className="section-title">Все позиции</h2>
        <div className="toolbar-actions">
          <button className="icon-btn" onClick={refresh} title="Обновить" id="refresh-btn">
            <RefreshCw size={18} />
          </button>
          <button className="add-btn" onClick={() => setModalOpen(true)} id="add-product-btn">
            <PlusCircle size={18} />
            Добавить
          </button>
        </div>
      </div>

      {/* Loading bar */}
      {loading && <div className="progress-bar"><div className="progress-bar-inner" /></div>}

      {/* Table */}
      <div className="table-container">
        <table className="products-table" id="products-table">
          <thead>
            <tr>
              <th className="col-check">
                <input
                  type="checkbox"
                  className="row-checkbox"
                  checked={products.length > 0 && selectedIds.size === products.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="col-name sortable" onClick={() => setSort('title')}>
                <span>Наименование</span>
              </th>
              <th className="col-vendor">Вендор</th>
              <th className="col-sku">Артикул</th>
              <th className="col-rating sortable" onClick={() => setSort('rating')}>
                <span>Оценка</span>
                {getSortIcon('rating')}
              </th>
              <th className="col-price sortable" onClick={() => setSort('price')}>
                <span>Цена, ₽</span>
                {getSortIcon('price')}
              </th>
              <th className="col-actions" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className={selectedIds.has(product.id) ? 'row-selected' : ''}
              >
                <td className="col-check">
                  <input
                    type="checkbox"
                    className="row-checkbox"
                    checked={selectedIds.has(product.id)}
                    onChange={() => toggleSelect(product.id)}
                  />
                </td>
                <td className="col-name">
                  <div className="product-name-cell">
                    <div className="product-thumb">
                      {product.thumbnail ? (
                        <img src={product.thumbnail} alt={product.title} />
                      ) : (
                        <div className="thumb-placeholder" />
                      )}
                    </div>
                    <div className="product-info">
                      <span className="product-title">{product.title}</span>
                      <span className="product-category">{product.category}</span>
                    </div>
                  </div>
                </td>
                <td className="col-vendor">{product.brand || '—'}</td>
                <td className="col-sku">{product.sku}</td>
                <td className="col-rating">
                  <span
                    className={`rating-value ${product.rating < 3.5 ? 'rating-low' : ''}`}
                  >
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="rating-suffix">/5</span>
                </td>
                <td className="col-price">{formatPrice(product.price)}</td>
                <td className="col-actions">
                  <div className="col-actions-inner">
                    <button className="action-btn action-plus" title="Действие">
                      <Plus size={14} />
                    </button>
                    <button className="action-btn action-dots" title="Ещё">
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && products.length === 0 && (
          <div className="empty-state">Нет товаров для отображения</div>
        )}

        {/* Pagination */}
        {total > 0 && (
          <div className="pagination" id="pagination">
            <span className="pagination-info">
              Показано {startItem}-{endItem} из {total}
            </span>
            <div className="pagination-controls">
              <button
                className="page-btn page-arrow"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              {getPageNumbers().map((p) => (
                <button
                  key={p}
                  className={`page-btn ${p === page ? 'page-active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="page-btn page-arrow"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <AddProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddProduct}
      />
    </div>
  );
};

export default ProductsPage;
