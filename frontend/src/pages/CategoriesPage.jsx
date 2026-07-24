import { useEffect, useState } from 'react';
import api from '../services/api';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState('');

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      setError('Unable to load categories');
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetError = () => setError('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetError();

    try {
      await api.post('/categories', { name });
      setName('');
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create category');
    }
  };

  const handleEdit = (category) => {
    resetError();
    setEditingCategoryId(category.id);
    setEditingName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setEditingName('');
  };

  const handleSaveEdit = async (categoryId) => {
    resetError();

    if (!editingName.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      await api.put(`/categories/${categoryId}`, { name: editingName });
      setEditingCategoryId(null);
      setEditingName('');
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update category');
    }
  };

  const handleDelete = async (categoryId, categoryName) => {
    resetError();

    const confirmed = window.confirm(`Delete category '${categoryName}'? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/categories/${categoryId}`);
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete category');
    }
  };

  return (
    <div className="page">
      <h2>Categories</h2>
      <form className="card" onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
        />
        <button type="submit">Create Category</button>
      </form>
      {error && <p className="error">{error}</p>}
      <ul className="list">
        {categories.map((category) => (
          <li key={category.id} className="category-item">
            {editingCategoryId === category.id ? (
              <>
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                />
                <button onClick={() => handleSaveEdit(category.id)}>Save</button>
                <button onClick={handleCancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                <span>{category.name}</span>
                <button onClick={() => handleEdit(category)}>Edit</button>
                <button onClick={() => handleDelete(category.id, category.name)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoriesPage;
