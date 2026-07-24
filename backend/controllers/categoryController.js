const { Op } = require('sequelize');
const { Category, Task } = require('../models');

const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch categories', error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const existingCategory = await Category.findOne({ where: { name: name.trim() } });
    if (existingCategory) {
      return res.status(409).json({ message: 'Category already exists' });
    }

    const category = await Category.create({ name: name.trim() });
    return res.status(201).json(category);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create category', error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const existingCategory = await Category.findOne({
      where: {
        name: name.trim(),
        id: { [Op.ne]: id },
      },
    });

    if (existingCategory) {
      return res.status(409).json({ message: 'Category already exists' });
    }

    await category.update({ name: name.trim() });
    return res.json(category);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update category', error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const taskCount = await Task.count({ where: { category_id: category.id } });
    if (taskCount > 0) {
      return res.status(400).json({ message: 'Cannot delete category while tasks are assigned to it' });
    }

    await category.destroy();
    return res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete category', error: error.message });
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };