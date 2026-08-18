const User = require('../models/User');
const jwt = require('jsonwebtoken');

const getSecret = () => process.env.JWT_SECRET || 'smart_waste_secret_key_123';

const register = async (req, res) => {
  try {
    const { name, email, password, role, adminSecret } = req.body;

    // Security check: Only allow Admin creation with valid Admin Secret Key
    if (role === 'admin') {
      const validSecret = process.env.ADMIN_SECRET || 'ADMIN123';
      if (!adminSecret || adminSecret !== validSecret) {
        return res.status(403).json({ message: 'Invalid Admin Security Key. Only authorized municipal officials can create Admin accounts.' });
      }
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role: role === 'admin' ? 'admin' : 'user' });

    const token = jwt.sign({ id: user.id, role: user.role }, getSecret(), { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, getSecret(), { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login };
