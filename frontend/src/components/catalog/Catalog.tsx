import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { addToCart, updateQuantity, removeFromCart } from '../../store/slices/cartSlice';
import styles from '../../styles/Catalog.module.scss';
import { fetchProducts } from '../../store/slices/productSlice';
import { Product } from '../../store/slices/productSlice';
import { CartItem } from '../../store/slices/cartSlice';
import { RootState } from '../../store/types';
import { useNavigate } from 'react-router-dom';
import ImageFallback from '../common/ImageFallback';
import api from '../../store/api';
import ordersStyles from '../../styles/Orders.module.scss';

const ITEMS_PER_PAGE = 12;

const Catalog: React.FC = () => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state: RootState) => state.cart.items);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState<string>('все');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const [priceRange, setPriceRange] = useState<[string, string]>(['', '']);
  const [appliedPriceRange, setAppliedPriceRange] = useState<[string, string]>(['', '']);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [globalPriceRange, setGlobalPriceRange] = useState<[number, number]>([0, 10000]);

  // Получение категорий
  useEffect(() => {
    (async () => {
      try {
        const categoriesRes = await api.get('/products/categories');
        const cats = categoriesRes.data;
        // Устанавливаем только категории из БД в состояние
        setCategories(cats.filter((cat: string) => cat && cat.trim() !== '')); // Фильтруем пустые/null значения
      } catch (error) {
        // Оставляем стандартный обработчик ошибок
        console.error('Error loading categories:', error);
      }
    })();
  }, []); // Зависимости: пустой массив, эффект срабатывает один раз при монтировании

  // Debounce для поиска
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [search]);

  // Сброс страницы при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, category, priceRange]);

  // Прокрутка страницы вверх при изменении текущей страницы
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Получение товаров по фильтрам
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (debouncedSearch.trim() !== '') params.query = debouncedSearch;
        if (category && category !== 'все') params.category = String(category);
        // minPrice: если не введено — 0
        if (appliedPriceRange[0] && !isNaN(Number(appliedPriceRange[0]))) params.minPrice = Number(appliedPriceRange[0]);
        else params.minPrice = 0;
        // maxPrice: если не введено — не добавляем maxPrice
        if (appliedPriceRange[1] && !isNaN(Number(appliedPriceRange[1]))) params.maxPrice = Number(appliedPriceRange[1]);
        const res = await api.get('/products/search', { params });
        setProducts(res.data);
      } catch {
        setProducts([]);
      }
      setLoading(false);
    })();
  }, [debouncedSearch, category, appliedPriceRange]);

  const getMinPrice = () => products.length ? Math.min(...products.map((p: Product) => p.price)) : 0;
  const getMaxPrice = () => products.length ? Math.max(...products.map((p: Product) => p.price)) : 100;

  const handlePriceChange = (idx: number, value: string) => {
    setPriceRange(prev => {
      let next = [...prev] as [string, string];
      next[idx] = value.replace(/[^0-9]/g, '');
      return next;
    });
  };

  const applyPriceFilter = () => {
    setAppliedPriceRange(priceRange);
  };

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({ product: { ...product, quantity: 1, image: product.images?.[0] || '' }, quantity: 1 }));
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    dispatch(updateQuantity({ id, quantity }));
  };

  const handleRemoveFromCart = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paged = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // При выборе категории 'все' сбрасываем фильтр
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div>
    <div className={styles.catalog}>
      <div className={styles.filters}>
        <div className={styles.searchAndCategories}>
          <div className={styles.search}>
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                autoFocus
            />
          </div>

          <div className={styles.categories}>
            <select
              value={category}
                onChange={handleCategoryChange}
              className={styles.categorySelect}
            >
              {/* Опция "Все" добавляется вручную */}
              <option key="все" value="все">Все</option>
              {/* Категории из БД */}
              {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.priceRange}>
            <label className={styles.priceLabel}>Стоимость</label>
            <div className={styles.priceInputs}>
            <input
              type="text"
              value={priceRange[0]}
              onChange={e => handlePriceChange(0, e.target.value)}
              className={styles.priceInput}
              placeholder="от"
            />
            <span>—</span>
            <input
              type="text"
              value={priceRange[1]}
              onChange={e => handlePriceChange(1, e.target.value)}
              className={styles.priceInput}
              placeholder="до"
            />
            </div>
            <button
              className={styles.applyBtn}
              onClick={applyPriceFilter}
            >
              Применить
            </button>
        </div>
      </div>

      <div className={styles.products}>
        {paged.length === 0 && <div className={styles.empty}>Нет товаров</div>}
        {paged.map((product: Product) => {
          const cartItem = cartItems.find((item: CartItem) => item._id === String(product._id));
          return (
            <div
              key={product._id}
              className={styles.card}
              onClick={() => navigate(`/catalog/${product._id}`)}
            >
                <ImageFallback
                  src={product.thumbnails && product.thumbnails[0] ? product.thumbnails[0] : ''}
                  alt={product.name}
                  className={styles.image}
                />
              <div className={styles.info}>
                <div className={styles.name}>{product.name}</div>
                <div className={styles.price}>{product.price} ₽</div>
                <div className={styles.stock}>В наличии: {product.stock}</div>
                <div className={styles.cardFooter}>
                  {cartItem && cartItem.quantity > 0 ? (
                    <div className={styles.qtyControl} onClick={e => e.stopPropagation()}>
                      <button className={styles.qtyBtn} onClick={e => {
                        e.stopPropagation();
                        if (cartItem.quantity === 1) {
                          handleUpdateQuantity(String(product._id), 0);
                        } else {
                          handleUpdateQuantity(String(product._id), cartItem.quantity - 1);
                        }
                      }}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                      <span className={styles.qtyValue}>{cartItem.quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={e => {
                          e.stopPropagation();
                          if (cartItem.quantity < product.stock) {
                            handleUpdateQuantity(String(product._id), cartItem.quantity + 1);
                          }
                        }}
                        disabled={cartItem.quantity >= product.stock}
                      ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
                    </div>
                  ) : (
                    <button
                        className={`${styles.addBtn} ${product.stock === 0 ? styles.outOfStock : ''}`}
                      onClick={e => { e.stopPropagation(); handleAddToCart(product); }}
                        disabled={product.stock === 0}
                    >
                        {product.stock === 0 ? 'Нет в наличии' : 'В корзину'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
          <div className={styles.pagination}>
          <button
              className={styles.pageBtn}
              onClick={() => setCurrentPage(prev => prev - 1)}
            disabled={currentPage === 1}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`${styles.pageBtn} ${currentPage === page ? styles.activePage : ''}`}
                onClick={() => setCurrentPage(page)}
          >
                {page}
          </button>
            ))}
          <button
              className={styles.pageBtn}
              onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage === totalPages}
          >
              &gt;
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

export default Catalog; 