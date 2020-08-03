var express = require('express');
var router = express.Router();
const auth = require('../middleware/auth');
const Profile = require('../models/Profile');
const User = require('../models/User');

/**
 * Get all registered users
 * @route GET /api/users
 * @access Public
 */
router.get('/',
  async (req, res, next) => {
    try {
      const profiles = await Profile.find().populate('user', ['name', 'avatar']);
      res.json(profiles);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

/**
 * Get a registered user by :user_id (Designed for admin role)
 * @route GET /api/users/:user_id
 * @access Private
 */
router.get('/:user_id', auth.authenticateToken, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) return res.status(400).json({ message: 'User not found!' });

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ message: 'User not found!' });
    }
    res.status(500).send('Server Error');
  }
});

/**
 * Delete a registered user by user_id (Designed for admin role)
 * @route DELETE /api/users/:user_id
 * @access Private
 */
router.delete('/:user_id', auth.authenticateToken, async (req, res) => {
  try {
    if (req.params.user_id === req.user._id) {
      return res.status(400).json({ message: 'User Profile deletion not allowed!' });
    }
    // Removes the user's profile record
    await Profile.findOneAndRemove({ user: req.params.user_id });
    // Removes the user record
    await User.findOneAndRemove({ _id: req.params.user_id });

    res.json({ message: 'User deleted successfully!' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
