const bcrypt = require('bcryptjs');
const { User, Category } = require('../models');

async function seed() {
  const password = await bcrypt.hash('password123', 10);
  const user = await User.findOrCreate({
    where: { email: 'demo@example.com' },
    defaults: { name: 'Demo User', password },
  });

  await Category.findOrCreate({ where: { name: 'Work' } });
  await Category.findOrCreate({ where: { name: 'Personal' } });
}

module.exports = { seed };
