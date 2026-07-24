import { useEffect, useState } from 'react';
import api from '../services/api';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', status: 'pending', due_date: '', category_id: '' });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [highlightedTaskId, setHighlightedTaskId] = useState(null);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const loadTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/tasks', {
        params: {
          search,
          status: statusFilter || undefined,
          category: categoryFilter || undefined,
          page,
          limit: 5,
        },
      });
      setTasks(response.data.tasks);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Unable to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    loadTasks();
  }, [page, search, statusFilter, categoryFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editingTaskId) {
        await api.put(`/tasks/${editingTaskId}`, form);
      } else {
        await api.post('/tasks', form);
      }
      setForm({ title: '', description: '', status: 'pending', due_date: '', category_id: '' });
      setEditingTaskId(null);
      setIsModalOpen(false);
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task? This action cannot be undone.')) {
      return;
    }

    setDeletingTaskId(id);
    setError('');
    try {
      await api.delete(`/tasks/${id}`);
      await loadTasks();
    } catch (err) {
      setError('Unable to delete task');
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsModalOpen(false);
    }
  };

  const getNextStatus = (status) => {
    return status === 'pending' ? 'in_progress' : status === 'in_progress' ? 'completed' : 'pending';
  };

  const getStatusButtonText = (status) => {
    const nextStatus = getNextStatus(status);
    if (nextStatus === 'in_progress') return 'Move to In Progress';
    if (nextStatus === 'completed') return 'Move to Completed';
    return 'Reset to Pending';
  };

  const handleUpdateStatus = async (task) => {
    const nextStatus = getNextStatus(task.status);
    setError('');
    try {
      await api.put(`/tasks/${task.id}`, { ...task, status: nextStatus });
      await loadTasks();
      setHighlightedTaskId(task.id);
      window.setTimeout(() => setHighlightedTaskId(null), 2200);
    } catch (err) {
      setError('Unable to update task');
    }
  };

  const handleEditTask = (task) => {
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      due_date: task.due_date || '',
      category_id: task.category_id || '',
    });
    setEditingTaskId(task.id);
    setIsModalOpen(true);
  };

  return (
    <div className="page">
      <div className="page-heading">
        <h2>Tasks</h2>
        <button className="primary-button" onClick={() => { setForm({ title: '', description: '', status: 'pending', due_date: '', category_id: '' }); setEditingTaskId(null); setIsModalOpen(true); }}>
          Create New Task
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingTaskId ? 'Edit Task' : 'Create Task'}</h3>
              <button className="close-button" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form className="card" onSubmit={handleSubmit}>
              <label>
                Task title
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter a short task title, e.g. Finish homepage"
                />
              </label>
              <label>
                Description
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the task details, e.g. add responsive layout and review"
                />
              </label>
              <label>
                Status
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </label>
              <label>
                Due date
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  aria-label="Select due date"
                />
              </label>
              <label>
                Category
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">Choose category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </label>
                <button type="submit" disabled={submitting}>
                {submitting ? (editingTaskId ? 'Saving...' : 'Creating...') : (editingTaskId ? 'Save Changes' : 'Create Task')}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="toolbar">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); setError(''); }}
          placeholder="Search tasks"
          disabled={loading}
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); setError(''); }}
          disabled={loading}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); setError(''); }}
          disabled={loading}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      {error && <p className="error-banner">{error}</p>}
      {loading && <p className="info-message">Loading tasks...</p>}
      {!loading && !tasks.length && <p className="info-message">No tasks found. Create one to get started.</p>}

      <ul className="list">
        {tasks.map((task) => (
          <li key={task.id} className={`task-item ${highlightedTaskId === task.id ? 'task-highlight' : ''}`}>
            <div>
              <strong>{task.title}</strong>
              <p>{task.description}</p>
              <small>Status: {task.status} | Category: {task.category?.name || 'None'} | Due: {task.due_date || 'N/A'}</small>
            </div>
            <div className="task-actions">
              <button onClick={() => handleUpdateStatus(task)} disabled={loading || deletingTaskId === task.id}>
                {getStatusButtonText(task.status)}
              </button>
              <button onClick={() => handleEditTask(task)} disabled={loading || deletingTaskId === task.id}>
                Edit
              </button>
              <button onClick={() => handleDelete(task.id)} disabled={loading || deletingTaskId === task.id}>
                {deletingTaskId === task.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
};

export default TasksPage;
