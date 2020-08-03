var express = require('express');
var router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

/**
 * User login/authentication request
 * @route /api/login OR /api/auth
 * @access Public
 */
router.post('/', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ message: 'Invalid Credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ message: 'Invalid Credentials' }] });
      }

      const appKey = req.headers['book-store-app-key'];
      const userResponse = { _id: user._id, email: email, appKey: appKey };
      let response = auth.generateAccessAndRefreshToken(userResponse);
      res.header('book-store-app-key', appKey);
      res.json(response);

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

module.exports = router;
