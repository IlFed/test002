import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { NewProduct } from '../types';
import './AddProductModal.css';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (product: NewProduct) => void;
}

const AddProductModal: React.FC<Props> = ({ open, onClose, onAdd }) => {
  const [form, setForm] = useState<NewProduct>({ title: '', price: '', brand: '', sku: '' });
  const [errors, setErrors] = useState<Partial<NewProduct>>({});

  if (!open) return null;

  const validate = (): boolean => {
    const newErrors: Partial<NewProduct> = {};
    if (!form.title.trim()) newErrors.title = 'Обязательное поле';
    if (!form.price.trim()) newErrors.price = 'Обязательное поле';
    else if (isNaN(Number(form.price)) || Number(form.price) <= 0) newErrors.price = 'Введите корректную цену';
    if (!form.brand.trim()) newErrors.brand = 'Обязательное поле';
    if (!form.sku.trim()) newErrors.sku = 'Обязательное поле';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onAdd(form);
    setForm({ title: '', price: '', brand: '', sku: '' });
    setErrors({});
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Добавить товар</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-field">
            <label>Наименование</label>
            <input
              id="add-product-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Введите наименование"
            />
            {errors.title && <span className="modal-error">{errors.title}</span>}
          </div>
          <div className="modal-field">
            <label>Цена</label>
            <input
              id="add-product-price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="Введите цену"
            />
            {errors.price && <span className="modal-error">{errors.price}</span>}
          </div>
          <div className="modal-field">
            <label>Вендор</label>
            <input
              id="add-product-brand"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              placeholder="Введите вендора"
            />
            {errors.brand && <span className="modal-error">{errors.brand}</span>}
          </div>
          <div className="modal-field">
            <label>Артикул</label>
            <input
              id="add-product-sku"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="Введите артикул"
            />
            {errors.sku && <span className="modal-error">{errors.sku}</span>}
          </div>
          <button id="add-product-submit" type="submit" className="modal-submit">
            Добавить
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
