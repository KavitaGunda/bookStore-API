var express = require('express');
var router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const auth = require('../middleware/auth');
const Profile = require('../models/Profile');

/**
 * Registers the user and creates profile
 * @route /api/register OR /api/createUser
 * @access Public
 */
router.post('/',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters',
    ).isLength({ min: 6 }),
  ],
  async (req, res, next) => {
    // res.send('respond with a resource..............');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ code: 400, message: 'Validation Failure', errors: errors.array() });
    }
    let { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ message: 'User already exists!' }] });
      }

      const avatar = gravatar.url(email, { s: '200', r: 'pg', d: 'mm' });
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
      const appKey = uuidv4();
      //creates user
      user = new User({
        appKey,
        name,
        email,
        avatar,
        password,
      });
      await user.save();

      //creating a corresponding user profile
      const profile = new Profile({
        user: user.id,
        favGenre: null
      });
      await profile.save();

      const userResponse = { _id: user.id, email: email, appKey: appKey };
      const response = auth.generateAccessAndRefreshToken(userResponse);
      response.appKey = appKey;
      res.json(response);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

module.exports = router;
