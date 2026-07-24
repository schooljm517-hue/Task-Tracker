const { Op } = require('sequelize');
const { Task, Category, User } = require('../models');

const getTasks = async (req, res) => {
  try {
    const { search, status, category, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where = { user_id: req.user.id };
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }
    if (status) {
      where.status = status;
    }
    if (category) {
      where.category_id = category;
    }

    const tasks = await Task.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset,
    });

    return res.json({
      tasks: tasks.rows,
      total: tasks.count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(tasks.count / Number(limit)),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch tasks', error: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    return res.json(task);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch task', error: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, status, due_date, category_id } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!category_id) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const validStatuses = ['pending', 'in_progress', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(400).json({ message: 'Category not found' });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : null,
      status: status || 'pending',
      due_date: due_date || null,
      category_id,
      user_id: req.user.id,
    });

    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create task', error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { title, description, status, due_date, category_id } = req.body;
    const validStatuses = ['pending', 'in_progress', 'completed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updatedCategoryId = category_id !== undefined ? category_id : task.category_id;
    if (updatedCategoryId === null || updatedCategoryId === undefined) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const category = await Category.findByPk(updatedCategoryId);
    if (!category) {
      return res.status(400).json({ message: 'Category not found' });
    }

    await task.update({
      title: title ? title.trim() : task.title,
      description: description !== undefined ? description.trim() : task.description,
      status: status || task.status,
      due_date: due_date !== undefined ? due_date : task.due_date,
      category_id: updatedCategoryId,
    });

    return res.json(task);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update task', error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.destroy();
    return res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete task', error: error.message });
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask };
