import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { RootState } from '../../store/types';
import { Product } from '../../store/slices/productSlice';
import { fetchProducts } from '../../store/slices/productSlice';
import api from '../../store/api';
// import styles from '../../styles/AdminPanel.module.scss';
import ordersStyles from '../../styles/Orders.module.scss';
import CreatableSelect from 'react-select/creatable';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const TABS = [
  { key: 'create', label: 'Создать товар' },
  { key: 'stock', label: 'Обновить количество' },
  { key: 'edit', label: 'Редактировать товары' },
  { key: 'orders', label: 'Заказы пользователей' },
];

const MAX_IMAGES = 4;
const ORDERS_PER_PAGE = 5;
const PRODUCTS_PER_PAGE = 5;

type ProductForAdmin = {
  _id: string;
  name: string;
  description: string;
  price: number;
  images?: string[];
  thumbnails?: string[];
  category: string;
  stock: number;
  imageFit?: string;
};

const AdminPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const productsState = useAppSelector((state: RootState) => state.products);
  const products = productsState?.products || [];
  const user = useAppSelector((state: RootState) => state.auth.user);

  // Все useState — только здесь!
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    customCategory: '',
    imageFit: 'cover',
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [createMsg, setCreateMsg] = useState('');
  const [addStockMsg, setAddStockMsg] = useState('');
  const [stockInputs, setStockInputs] = useState<{[id: string]: string}>({});
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('adminPanelActiveTab');
    return savedTab && TABS.some(tab => tab.key === savedTab) ? savedTab : 'create';
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ProductForAdmin[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<Record<OrderStatusKey, number>>({
    unconfirmed: 1,
    assembling: 1,
    ready: 1,
    cancelled: 1,
    issued: 1
  });
  const [currentProductPage, setCurrentProductPage] = useState(1);
  const [editForm, setEditForm] = useState({
    _id: '',
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    customCategory: '',
    imageFit: 'cover',
  });
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editMsg, setEditMsg] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductForAdmin | null>(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [pendingLast4, setPendingLast4] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [editCategory, setEditCategory] = useState<{ id: string; name: string } | null>(null);
  const [categoryMsg, setCategoryMsg] = useState('');
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0
  });
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [editCrop, setEditCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0
  });
  const [editCroppedImage, setEditCroppedImage] = useState<string | null>(null);
  const editImageRef = useRef<HTMLImageElement>(null);

  // Для фильтрации заказов по статусу
  type OrderStatusKey = 'unconfirmed' | 'assembling' | 'ready' | 'cancelled' | 'issued';
  // Группируем только если orders — массив
  const groupedOrders: Record<OrderStatusKey, any[]> = Array.isArray(orders)
    ? {
    unconfirmed: orders.filter((o) => o.status === 'unconfirmed'),
    assembling: orders.filter((o) => o.status === 'assembling'),
    ready: orders.filter((o) => o.status === 'ready'),
    cancelled: orders.filter((o) => o.status === 'cancelled'),
    issued: orders.filter((o) => o.status === 'issued'),
      }
    : { unconfirmed: [], assembling: [], ready: [], cancelled: [], issued: [] };
  const ORDER_TABS = [
    { key: 'unconfirmed', label: 'Неподтвержденные' },
    { key: 'assembling', label: 'Сборка' },
    { key: 'ready', label: 'Готов к выдаче' },
    { key: 'issued', label: 'Выданные' },
    { key: 'cancelled', label: 'Отменённые' },
  ] as { key: OrderStatusKey; label: string }[];
  const [activeOrderTab, setActiveOrderTab] = useState<OrderStatusKey>(() => {
    const savedOrderTab = localStorage.getItem('adminPanelActiveOrderTab');
    return (savedOrderTab && ['unconfirmed','assembling','ready','issued','cancelled'].includes(savedOrderTab))
      ? (savedOrderTab as OrderStatusKey)
      : 'unconfirmed';
  });

  // Функция загрузки заказов
  const fetchAllOrders = async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const res = await api.get('/orders/all-orders');
      if (Array.isArray(res.data)) {
        setOrders(res.data);
      } else {
        setOrders([]);
        setOrdersError(`Ответ от сервера имеет неправильный формат. Ожидался массив.`);
      }
    } catch (err: any) {
      setOrders([]);
      const errorMessage = err?.response 
        ? `Ошибка: ${err.response.status} ${err.response.statusText} — ${JSON.stringify(err.response.data)}`
        : String(err);
      setOrdersError(errorMessage);
    }
    setOrdersLoading(false);
  };

  // useEffect для загрузки продуктов
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // useEffect для загрузки всех заказов при смене вкладки
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchAllOrders();
    }
  }, [activeTab]);

  // useEffect для сохранения активной вкладки админ-панели
  useEffect(() => {
    localStorage.setItem('adminPanelActiveTab', activeTab);
  }, [activeTab]);

  // useEffect для сохранения активной вкладки заказов
  useEffect(() => {
    localStorage.setItem('adminPanelActiveOrderTab', activeOrderTab);
  }, [activeOrderTab]);

  // useEffect для чтения значений из localStorage при монтировании
  useEffect(() => {
    const savedTab = localStorage.getItem('adminPanelActiveTab');
    if (savedTab && TABS.some(tab => tab.key === savedTab)) {
      setActiveTab(savedTab);
    }
    const savedOrderTab = localStorage.getItem('adminPanelActiveOrderTab');
    if (savedOrderTab && ORDER_TABS.some(tab => tab.key === savedOrderTab)) {
      setActiveOrderTab(savedOrderTab as OrderStatusKey);
    }
  }, []);

  // Теперь только после всех useEffect:
  if (!user || user.role !== 'admin') {
    return <div className={ordersStyles.forbidden}>Доступ запрещён</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = (crop: Crop, percentCrop: Crop) => {
    if (!imageRef.current) return;
    
    const canvas = document.createElement('canvas');
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(
      imageRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    const croppedImageUrl = canvas.toDataURL('image/jpeg');
    setCroppedImage(croppedImageUrl);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMsg('');
    const categoryValue = form.category === '__custom__' ? form.customCategory : form.category;
    if (!form.name || !form.description || !form.price || !categoryValue || !form.stock || !image) {
      setCreateMsg('Заполните все поля и выберите изображение');
      return;
    }

      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
    formData.append('category', categoryValue!);
      formData.append('stock', form.stock);

    // Convert cropped image to File object
    if (croppedImage) {
      const response = await fetch(croppedImage);
      const blob = await response.blob();
      const croppedFile = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
      formData.append('image', croppedFile);
    } else {
    formData.append('image', image);
    }

    try {
      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      setCreateMsg('Товар успешно создан!');
      setForm({ name: '', description: '', price: '', category: '', stock: '', customCategory: '', imageFit: 'cover' });
      setImage(null);
      setImagePreview(null);
      setCroppedImage(null);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    } catch (error: any) {
      let msg = 'Ошибка при создании товара';
      if (error.response && error.response.data && error.response.data.message) {
        msg += ': ' + error.response.data.message;
      }
      setCreateMsg(msg);
    }
  };

  const handleStockInput = (id: string, value: string) => {
    setStockInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleAddStock = async (id: string) => {
    setAddStockMsg('');
    try {
      const product = products.find((p: Product) => p._id === id);
      const add = Number(stockInputs[id] || 0);
      if (!product || add <= 0 || isNaN(add)) return;
      await api.put(`/products/${id}`, {
        ...product,
        stock: product.stock + add,
      });
      setAddStockMsg('Количество успешно добавлено!');
      setStockInputs({ ...stockInputs, [id]: '' });
      dispatch({
        type: 'products/updateStock',
        payload: { id, stock: product.stock + add }
      });
    } catch (err) {
      setAddStockMsg('Ошибка при добавлении количества');
    }
  };

  // Кнопка смены статуса заказа
  const handleStatusChange = async (orderId: string, newStatus: OrderStatusKey) => {
    try {
      await api.patch(`/orders/${orderId}`, { status: newStatus });
      fetchAllOrders();
    } catch {}
  };

  // Функция поиска товаров
  const handleProductSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim() === '') {
      setSearchResults(null);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await api.get(`/products/search?query=${encodeURIComponent(value)}`);
      setSearchResults(res.data);
    } catch {
      setSearchResults([]);
    }
    setSearchLoading(false);
  };

  // Функция для получения заказов текущей страницы
  const getPaginatedOrders = (orders: any[], status: OrderStatusKey) => {
    const startIndex = (currentPage[status] - 1) * ORDERS_PER_PAGE;
    return orders.slice(startIndex, startIndex + ORDERS_PER_PAGE);
  };

  // Функция для получения общего количества страниц
  const getTotalPages = (orders: any[]) => {
    return Math.ceil(orders.length / ORDERS_PER_PAGE);
  };

  // Функция для изменения страницы
  const handlePageChange = (status: OrderStatusKey, page: number) => {
    setCurrentPage(prev => ({
      ...prev,
      [status]: page
    }));
  };

  // Функция для получения товаров текущей страницы (сортировка по алфавиту)
  const getPaginatedProducts = (products: Product[]) => {
    const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name));
    const startIndex = (currentProductPage - 1) * PRODUCTS_PER_PAGE;
    return sorted.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  };

  // Функция для получения общего количества страниц товаров
  const getTotalProductPages = (products: Product[]) => {
    return Math.ceil(products.length / PRODUCTS_PER_PAGE);
  };

  // Функция для изменения страницы товаров
  const handleProductPageChange = (page: number) => {
    setCurrentProductPage(page);
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setEditImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setEditImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onEditCropComplete = (crop: Crop, percentCrop: Crop) => {
    if (!editImageRef.current) return;
    
    const canvas = document.createElement('canvas');
    const scaleX = editImageRef.current.naturalWidth / editImageRef.current.width;
    const scaleY = editImageRef.current.naturalHeight / editImageRef.current.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(
      editImageRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    const croppedImageUrl = canvas.toDataURL('image/jpeg');
    setEditCroppedImage(croppedImageUrl);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditMsg('');

    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('description', editForm.description);
      formData.append('price', editForm.price);
      formData.append('category', editForm.category);
      formData.append('stock', editForm.stock);

      if (editCroppedImage) {
        const response = await fetch(editCroppedImage);
        const blob = await response.blob();
        const croppedFile = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
        formData.append('image', croppedFile);
      } else if (editImage) {
        formData.append('image', editImage);
      }

      await api.put(`/products/${editForm._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      setEditMsg('Товар успешно обновлен');
      setEditImage(null);
      setEditImagePreview(null);
      setEditCroppedImage(null);

      if (searchResults) {
        const res = await api.get(`/products/search?query=${encodeURIComponent(searchTerm)}`);
        setSearchResults(res.data);
      }
      if (selectedProduct) {
        const res = await api.get(`/products/${selectedProduct._id}`);
        setSelectedProduct(res.data);
      }
    } catch (error) {
      setEditMsg('Ошибка при обновлении товара');
    }
  };

  const selectProductForEdit = (product: ProductForAdmin) => {
    setSelectedProduct(product);
    setEditForm({
      _id: product._id,
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      stock: String(product.stock),
      customCategory: '',
      imageFit: product.imageFit || 'cover',
    });
    setEditImage(null);
    setEditImagePreview(product.images?.[0] || null);
    setEditMsg('');
  };

  const productsToShow: ProductForAdmin[] = selectedProduct
    ? [selectedProduct]
    : Array.isArray(searchResults) ? searchResults : [];

  // --- Новый поиск заказов по последним 4 символам через backend ---
  const handleLast4Search = async () => {
    if (pendingLast4.length === 4) {
      setOrdersLoading(true);
      try {
        const res = await api.get(`/orders/search-last4?last4=${pendingLast4}`);
        if (res.data && typeof res.data === 'object') {
          setOrders(res.data);
          // Если найден хотя бы один заказ — переключить вкладку на его статус
          const allStatuses = Object.keys(res.data);
          for (const status of allStatuses) {
            if (Array.isArray(res.data[status]) && res.data[status].length > 0) {
              if (activeOrderTab !== status) setActiveOrderTab(status as OrderStatusKey);
              setCurrentPage(prev => ({ ...prev, [status]: 1 }));
              break;
            }
          }
        }
      } catch {}
      setOrdersLoading(false);
    }
  };

  // Для отображения: если orders — это объект (поиск), то используем его как groupedOrders, иначе группируем по статусу
  const groupedOrdersToShow = (pendingLast4.length === 4 && orders && typeof orders === 'object' && !Array.isArray(orders))
    ? orders
    : groupedOrders;

  // Функция для удаления товара
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    try {
      await api.delete(`/products/${selectedProduct._id}`);
      setEditMsg('Товар успешно удалён');
      if (searchResults) {
        setSearchResults(searchResults.filter(p => p._id !== selectedProduct._id));
      }
      setSelectedProduct(null);
    } catch (error) {
      setEditMsg('Ошибка при удалении товара');
    }
    setShowDeleteModal(false);
  };

  return (
    <div className={ordersStyles.adminPanel}>
      <h2 className={ordersStyles.title}>Админ-панель</h2>
      <div className={ordersStyles.tabs}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`${ordersStyles.tabBtn} ${activeTab === tab.key ? ordersStyles.activeTab : ''}`}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'create' && (
        <section className={ordersStyles.adminSection}>
          <h3 className={ordersStyles.sectionTitle}>Создать новый товар</h3>
          <form onSubmit={handleCreate} className={ordersStyles.adminForm} style={{flexDirection:'column',alignItems:'flex-start',gap:18,maxWidth:480}}>
            <label className={ordersStyles.label} htmlFor="name">Название</label>
            <input id="name" name="name" placeholder="Название" value={form.name} onChange={handleChange} required className={ordersStyles.input} />

            <label className={ordersStyles.label} htmlFor="description">Описание</label>
            <textarea id="description" name="description" placeholder="Описание" value={form.description} onChange={handleChange} required className={ordersStyles.textarea} />

            <label className={ordersStyles.label} htmlFor="price">Цена</label>
            <input id="price" name="price" type="number" placeholder="Цена" value={form.price} onChange={handleChange} required className={ordersStyles.input} min={1} />

            <label className={ordersStyles.label} htmlFor="category">Категория</label>
            <select
              id="category"
              name="category"
              className={ordersStyles.input}
              value={form.category.startsWith('__custom__') ? '' : form.category}
              onChange={e => {
                if (e.target.value === '__custom__') {
                  setForm(f => ({ ...f, category: '__custom__' }));
                } else {
                  setForm(f => ({ ...f, category: e.target.value }));
                }
              }}
              required={!form.category || form.category === '__custom__' ? false : true}
            >
              <option value="">Выберите категорию</option>
              {Array.from(new Set(products.map((p: Product) => p.category).filter(Boolean))).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="__custom__">Другая категория...</option>
            </select>
            {form.category === '__custom__' && (
              <input
                type="text"
                name="customCategory"
                className={ordersStyles.input}
                placeholder="Введите новую категорию"
                value={form.customCategory || ''}
                onChange={e => setForm(f => ({ ...f, customCategory: e.target.value }))}
                required
                style={{ marginTop: 8 }}
              />
            )}

            <label className={ordersStyles.label} htmlFor="stock">Количество</label>
            <input id="stock" name="stock" type="number" placeholder="Количество" value={form.stock} onChange={handleChange} required className={ordersStyles.input} min={1} />

            <label className={ordersStyles.label} htmlFor="image">Изображение:</label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={imageInputRef}
              required={!image}
              className={ordersStyles.input}
            />
            
            {imagePreview && (
              <div style={{ margin: '20px 0' }}>
                <ReactCrop
                  crop={crop}
                  onChange={(c: Crop) => setCrop(c)}
                  onComplete={onCropComplete}
                  aspect={1}
                >
                  <img
                    ref={imageRef}
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: '400px' }}
                  />
                </ReactCrop>
              </div>
            )}
            
            {croppedImage && (
              <div style={{ margin: '20px 0' }}>
                <h4>Предпросмотр обрезанного изображения:</h4>
                <img
                  src={croppedImage}
                  alt="Cropped preview"
                  style={{ maxWidth: '200px', maxHeight: '200px' }}
                />
              </div>
            )}

            {!image && <div style={{color:'#c00',fontSize:'0.95em',marginTop:4}}>Изображение обязательно</div>}

            <button type="submit" className={ordersStyles.button} style={{marginTop:12}}>Создать</button>
          </form>
          {createMsg && <div className={ordersStyles.message}>{createMsg}</div>}
        </section>
      )}

      {activeTab === 'stock' && (
        <section className={ordersStyles.adminSection}>
          <h3 className={ordersStyles.sectionTitle}>Добавить количество к товару</h3>
          <input
            type="text"
            placeholder="Поиск товара по названию..."
            value={searchTerm}
            onChange={handleProductSearch}
            className={ordersStyles.input}
            style={{ marginBottom: 16, maxWidth: 320 }}
          />
          {searchLoading && <div>Поиск...</div>}
          {((searchResults && searchResults.length === 0) || (searchTerm && !searchLoading && searchResults && searchResults.length === 0)) && (
            <div className={ordersStyles.empty}>Ничего не найдено</div>
          )}
          {((searchResults && searchResults.length > 0) || (!searchTerm && products.length > 0)) && (
            <>
          <table className={ordersStyles.adminTable}>
            <thead>
              <tr>
                <th>Название</th>
                <th>В наличии</th>
                <th>Добавить</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
                  {getPaginatedProducts(searchResults && searchTerm ? searchResults : products).map((product: Product) => (
                <tr key={product._id}>
                  <td>{product.name}</td>
                  <td>{product.stock}</td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      className={ordersStyles.input}
                      style={{ width: 60 }}
                      value={stockInputs[product._id] || ''}
                      onChange={e => handleStockInput(product._id, e.target.value)}
                    />
                  </td>
                  <td>
                        <button 
                          className={ordersStyles.button} 
                          onClick={() => handleAddStock(product._id)}
                          disabled={!stockInputs[product._id] || isNaN(Number(stockInputs[product._id])) || Number(stockInputs[product._id]) <= 0}
                        >Добавить</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
              {getTotalProductPages(searchResults && searchTerm ? searchResults : products) > 1 && (
                <div className={ordersStyles.pagination}>
                  <button
                    className={ordersStyles.pageBtn}
                    onClick={() => handleProductPageChange(currentProductPage - 1)}
                    disabled={currentProductPage === 1}
                  >
                    &lt;
                  </button>
                  {Array.from(
                    { length: getTotalProductPages(searchResults && searchTerm ? searchResults : products) },
                    (_, i) => i + 1
                  ).map((page) => (
                    <button
                      key={page}
                      className={`${ordersStyles.pageBtn} ${currentProductPage === page ? ordersStyles.activePageBtn : ''}`}
                      onClick={() => handleProductPageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className={ordersStyles.pageBtn}
                    onClick={() => handleProductPageChange(currentProductPage + 1)}
                    disabled={currentProductPage === getTotalProductPages(searchResults && searchTerm ? searchResults : products)}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          )}
          {addStockMsg && <div className={ordersStyles.message}>{addStockMsg}</div>}
        </section>
      )}

      {activeTab === 'edit' && (
        <section className={ordersStyles.adminSection}>
          <h3 className={ordersStyles.sectionTitle}>Редактировать товар</h3>
          <div className={ordersStyles.editContainer}>
            <div className={ordersStyles.searchSection}>
              <input
                type="text"
                placeholder="Поиск товара по названию..."
                value={searchTerm}
                onChange={handleProductSearch}
                className={ordersStyles.input}
              />
              {searchLoading && <div>Поиск...</div>}
              {searchResults && searchResults.length === 0 && (
                <div className={ordersStyles.empty}>Ничего не найдено</div>
              )}
              {productsToShow.length > 0 && (
                <div className={ordersStyles.searchResults}>
                  {productsToShow.map((product) => (
                    <div
                      key={product._id}
                      className={`${ordersStyles.searchItem} ${selectedProduct?._id === product._id ? ordersStyles.selectedItem : ''}`}
                      onClick={() => selectProductForEdit(product)}
                    >
                      <img
                        src={product.images?.[0] || '/no-image.webp'}
                        alt={product.name}
                        className={ordersStyles.searchItemImage}
                      />
                      <div className={ordersStyles.searchItemInfo}>
                        <div className={ordersStyles.searchItemName}>{product.name}</div>
                        <div className={ordersStyles.searchItemPrice}>{product.price} ₽</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedProduct && (
              <form onSubmit={handleEditSubmit} className={ordersStyles.editForm}>
                <div className={ordersStyles.formGroup}>
                  <label className={ordersStyles.label} htmlFor="edit-name">Название</label>
                  <input
                    id="edit-name"
                    name="name"
                    value={editForm.name}
                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className={ordersStyles.input}
                    required
                  />
                </div>

                <div className={ordersStyles.formGroup}>
                  <label className={ordersStyles.label} htmlFor="edit-description">Описание</label>
                  <textarea
                    id="edit-description"
                    name="description"
                    value={editForm.description}
                    onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className={ordersStyles.textarea}
                    required
                  />
                </div>

                <div className={ordersStyles.formGroup}>
                  <label className={ordersStyles.label} htmlFor="edit-price">Цена</label>
                  <input
                    id="edit-price"
                    name="price"
                    type="number"
                    value={editForm.price}
                    onChange={e => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                    className={ordersStyles.input}
                    min={1}
                    required
                  />
                </div>

                <div className={ordersStyles.formGroup}>
                  <label className={ordersStyles.label} htmlFor="edit-category">Категория</label>
                  <select
                    id="edit-category"
                    name="category"
                    className={ordersStyles.input}
                    value={editForm.category}
                    onChange={e => {
                      if (e.target.value === '__custom__') {
                        setEditForm(prev => ({ ...prev, category: '__custom__' }));
                      } else {
                        setEditForm(prev => ({ ...prev, category: e.target.value }));
                      }
                    }}
                    required
                  >
                    <option value="">Выберите категорию</option>
                    {Array.from(new Set(products.map(p => p.category))).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="__custom__">Другая категория...</option>
                  </select>
                  {editForm.category === '__custom__' && (
                    <input
                      type="text"
                      name="customCategory"
                      className={ordersStyles.input}
                      placeholder="Введите новую категорию"
                      value={editForm.customCategory}
                      onChange={e => setEditForm(prev => ({ ...prev, customCategory: e.target.value }))}
                      required
                      style={{ marginTop: 8 }}
                    />
                  )}
                </div>

                <div className={ordersStyles.formGroup}>
                  <label className={ordersStyles.label} htmlFor="edit-stock">Количество</label>
                  <input
                    id="edit-stock"
                    name="stock"
                    type="number"
                    value={editForm.stock}
                    onChange={e => setEditForm(prev => ({ ...prev, stock: e.target.value }))}
                    className={ordersStyles.input}
                    min={0}
                    required
                  />
                </div>

                <div className={ordersStyles.formGroup}>
                  <label className={ordersStyles.label} htmlFor="edit-image">Изображение:</label>
                  <input
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className={ordersStyles.input}
                  />
                  
                  {editImagePreview && (
                    <div style={{ margin: '20px 0' }}>
                      <ReactCrop
                        crop={editCrop}
                        onChange={(c: Crop) => setEditCrop(c)}
                        onComplete={onEditCropComplete}
                        aspect={1}
                      >
                        <img
                          ref={editImageRef}
                          src={editImagePreview}
                          alt="Preview"
                          style={{ maxWidth: '100%', maxHeight: '400px' }}
                        />
                      </ReactCrop>
                    </div>
                  )}
                  
                  {editCroppedImage && (
                    <div style={{ margin: '20px 0' }}>
                      <h4>Предпросмотр обрезанного изображения:</h4>
                      <img
                        src={editCroppedImage}
                        alt="Cropped preview"
                        style={{ maxWidth: '200px', maxHeight: '200px' }}
                      />
                    </div>
                  )}
                </div>

                <div className={ordersStyles.formGroup}>
                  <label className={ordersStyles.label} htmlFor="edit-imageFit">Отображение изображения:</label>
                  <select
                    id="edit-imageFit"
                    name="imageFit"
                    className={ordersStyles.input}
                    value={editForm.imageFit}
                    onChange={e => setEditForm(prev => ({ ...prev, imageFit: e.target.value }))}
                  >
                    <option value="cover">Обрезка по размеру (cover)</option>
                    <option value="contain">Поместить полностью (contain)</option>
                    <option value="fill">Растянуть (fill)</option>
                    <option value="none">Без изменений (none)</option>
                    <option value="scale-down">Уменьшить до размера (scale-down)</option>
                  </select>
                </div>

                <button type="submit" className={ordersStyles.button}>
                  Сохранить изменения
                </button>
                <button type="button" className={ordersStyles.button} style={{background:'#e53935',marginTop:8}} onClick={() => setShowDeleteModal(true)}>
                  Удалить товар
                </button>
                {editMsg && <div className={ordersStyles.message}>{editMsg}</div>}
              </form>
            )}
          </div>
        </section>
      )}

      {activeTab === 'orders' && (
        <section className={ordersStyles.adminSection}>
          <div className={ordersStyles.ordersHeaderRow}>
            <h3 className={ordersStyles.sectionTitle}>Заказы всех пользователей</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Поиск по последним 4 символам заказа"
                value={pendingLast4}
                onChange={e => setPendingLast4(e.target.value.slice(0, 4))}
                className={ordersStyles.input}
              />
              <button
                className={ordersStyles.button}
                style={{ minWidth: 80 }}
                onClick={handleLast4Search}
                disabled={pendingLast4.length !== 4}
              >
                Поиск
              </button>
            </div>
          </div>
          <div className={ordersStyles.tabs} style={{ marginBottom: 0 }}>
            {ORDER_TABS.map(tab => (
              <button
                key={tab.key}
                className={activeOrderTab === tab.key ? `${ordersStyles.tabBtn} ${ordersStyles.activeTab}` : ordersStyles.tabBtn}
                onClick={() => setActiveOrderTab(tab.key as OrderStatusKey)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
          {ordersLoading ? (
            <div>Загрузка заказов...</div>
          ) : ordersError ? (
            <div className={ordersStyles.error}>{ordersError}</div>
          ) : (
            <>
              <div className={ordersStyles.ordersContainer}>
                {!ordersLoading && !ordersError && Array.isArray(groupedOrdersToShow[activeOrderTab]) && groupedOrdersToShow[activeOrderTab].length === 0 && (
                  <div className={ordersStyles.empty}>Нет заказов в этом статусе.</div>
                )}

                {/* Список заказов */}
                {!ordersLoading && !ordersError && Array.isArray(groupedOrdersToShow[activeOrderTab]) && (
                  getPaginatedOrders(groupedOrdersToShow[activeOrderTab], activeOrderTab).map((order) => (
                    <div key={order._id} className={ordersStyles.orderCard}>
                      <div className={ordersStyles.orderHeader}>
                        <div className={ordersStyles.orderInfo}>
                          <div className={ordersStyles.orderNumber}>Заказ №{order._id}</div>
                          <div className={ordersStyles.orderDate}>от {new Date(order.createdAt).toLocaleDateString()}</div>
                          <div className={ordersStyles.shippingAddress}>
                            Получатель: {order.recipient
                              ? `${order.recipient.lastName} ${order.recipient.firstName} ${order.recipient.middleName}`
                              : (order.user?.name || 'Не указано')}
                          </div>
                        </div>
                        <span className={ordersStyles.status}>
                          {order.status === 'unconfirmed' && 'Не подтвержден'}
                          {order.status === 'assembling' && 'Сборка'}
                          {order.status === 'ready' && 'Готов к выдаче'}
                          {order.status === 'issued' && 'Выдан'}
                          {order.status === 'cancelled' && 'Отменен'}
                          {!order.status && 'Статус неизвестен'}
                        </span>
                      </div>
                      <div className={ordersStyles.orderItems}>
                        {Array.isArray(order.items) ? order.items.map((item: any, idx: number) => (
                          <div key={item._id || idx} className={ordersStyles.orderItem}>
                            <img
                              src={item.product?.images?.[0] || '/no-image.webp'}
                              alt={item.product?.name || 'Товар'}
                              className={ordersStyles.itemImage}
                              onError={(e) => {(e.target as HTMLImageElement).style.display = 'none';}}
                            />
                            <div className={ordersStyles.itemName}>
                              {item.product?.name || 'Товар'}
                            </div>
                            <div className={ordersStyles.itemQty}>x{item.quantity}</div>
                            <div className={ordersStyles.itemTotal}>
                              {((item.product?.price || 0) * (item.quantity || 1)).toFixed(2)} ₽
                            </div>
                          </div>
                        )) : (
                          <div className={ordersStyles.empty}>Нет товаров или данные повреждены</div>
                        )}
                      </div>

                      <div className={ordersStyles.orderFooter}>
                        <div className={ordersStyles.orderSum}>Сумма: {(order.totalAmount || 0).toFixed(2)} ₽</div>

                        <div className={ordersStyles.orderActions}>
                          {activeOrderTab === 'unconfirmed' && (order.status === 'unconfirmed') && (
                            <button
                              className={ordersStyles.button}
                              onClick={() => handleStatusChange(order._id, 'assembling')}
                            >
                              Перевести в Сборку
                            </button>
                          )}
                          {activeOrderTab === 'assembling' && (order.status === 'assembling') && (
                            <button
                              className={ordersStyles.button}
                              onClick={() => handleStatusChange(order._id, 'ready')}
                            >
                              Перевести в Готов к выдаче
                            </button>
                          )}
                          {activeOrderTab === 'ready' && (order.status === 'ready') && (
                            <>
                              <button
                                className={ordersStyles.button}
                                onClick={() => handleStatusChange(order._id, 'issued')}
                              >
                                Выдан
                              </button>
                              <button
                                className={ordersStyles.cancelButton}
                                onClick={() => handleStatusChange(order._id, 'cancelled')}
                              >
                                Отменить
                              </button>
                            </>
                          )}
                          {activeOrderTab === 'issued' && (order.status === 'issued') && (
                            <button
                              className={`${ordersStyles.button} ${ordersStyles.cancelButton}`}
                              onClick={() => handleStatusChange(order._id, 'assembling')}
                            >
                              Вернуть в сборку
                            </button>
                          )}
                           {activeOrderTab === 'cancelled' && (order.status === 'cancelled') && (
                            <button
                              className={`${ordersStyles.button} ${ordersStyles.cancelButton}`}
                              onClick={() => handleStatusChange(order._id, 'unconfirmed')}
                            >
                              Вернуть в неподтвержденные
                            </button>
                          )}
                        </div>
                      </div>

                      <div className={ordersStyles.orderFooterMobile}>
                         <div className={ordersStyles.orderSum}>Сумма: {(order.totalAmount || 0).toFixed(2)} ₽</div>
                         <div className={ordersStyles.orderActions}>
                          {activeOrderTab === 'unconfirmed' && (order.status === 'unconfirmed') && (
                            <button
                              className={ordersStyles.button}
                              onClick={() => handleStatusChange(order._id, 'assembling')}
                            >
                              Перевести в Сборку
                            </button>
                          )}
                          {activeOrderTab === 'assembling' && (order.status === 'assembling') && (
                            <button
                              className={ordersStyles.button}
                              onClick={() => handleStatusChange(order._id, 'ready')}
                            >
                              Перевести в Готов к выдаче
                            </button>
                          )}
                          {activeOrderTab === 'ready' && (order.status === 'ready') && (
                            <>
                              <button
                                className={ordersStyles.button}
                                onClick={() => handleStatusChange(order._id, 'issued')}
                              >
                                Выдан
                              </button>
                              <button
                                className={ordersStyles.cancelButton}
                                onClick={() => handleStatusChange(order._id, 'cancelled')}
                              >
                                Отменить
                              </button>
                            </>
                          )}
                          {activeOrderTab === 'issued' && (order.status === 'issued') && (
                            <button
                              className={`${ordersStyles.button} ${ordersStyles.cancelButton}`}
                              onClick={() => handleStatusChange(order._id, 'assembling')}
                            >
                              Вернуть в сборку
                            </button>
                          )}
                           {activeOrderTab === 'cancelled' && (order.status === 'cancelled') && (
                            <button
                              className={`${ordersStyles.button} ${ordersStyles.cancelButton}`}
                              onClick={() => handleStatusChange(order._id, 'unconfirmed')}
                            >
                              Вернуть в неподтвержденные
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Код пагинации */}
                {!ordersLoading && !ordersError && Array.isArray(groupedOrdersToShow[activeOrderTab]) && getTotalPages(groupedOrdersToShow[activeOrderTab]) > 1 && (
                  <div className={ordersStyles.pagination}>
                    <button
                      className={ordersStyles.pageBtn}
                      onClick={() => handlePageChange(activeOrderTab, currentPage[activeOrderTab] - 1)}
                      disabled={currentPage[activeOrderTab] === 1}
                    >
                      &lt;
                    </button>
                    {Array.from({ length: getTotalPages(groupedOrdersToShow[activeOrderTab]) }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`${ordersStyles.pageBtn} ${currentPage[activeOrderTab] === page ? ordersStyles.activePageBtn : ''}`}
                        onClick={() => handlePageChange(activeOrderTab, page)}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      className={ordersStyles.pageBtn}
                      onClick={() => handlePageChange(activeOrderTab, currentPage[activeOrderTab] + 1)}
                      disabled={currentPage[activeOrderTab] === getTotalPages(groupedOrdersToShow[activeOrderTab])}
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      )}

      {/* Модальное окно подтверждения удаления */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.12)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 600, color: '#e53935', marginBottom: 8 }}>Удалить товар?</div>
            <div style={{ color: '#444', marginBottom: 16 }}>Вы действительно хотите удалить этот товар? Это действие необратимо.</div>
            <div style={{ display: 'flex', gap: 16 }}>
              <button className={ordersStyles.button} style={{ background: '#e53935', color: '#fff', minWidth: 100 }} onClick={handleDeleteProduct}>Удалить</button>
              <button className={ordersStyles.button} style={{ background: '#eee', color: '#222', minWidth: 100 }} onClick={() => setShowDeleteModal(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 