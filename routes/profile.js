var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Profile = require('../models/Profile');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
/**
 * Get logged in user profile
 * @route GET /api/profile
 * @access Private
 */
router.get('/',
    auth.authenticateToken,
    async (req, res, next) => {
        try {
            const profile = await Profile.findOne({ user: req.user._id }).populate(
                'user',
                ['name', 'avatar'],
            );

            if (!profile) {
                return res.status(400).json({ message: 'There is no profile for this user' });
            }

            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

/**
 * Creates or updates logged in user profile
 * @route POST /api/profile
 * @access Private
 */
router.post(
    '/',
    [
        auth.authenticateToken,
        [
            check('favGenre', 'Favorite genre is required')
                .not()
                .isEmpty(),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { favGenre } = req.body;
        // Building profile object
        const profileFields = {};
        profileFields.user = req.user._id;
        if (favGenre) profileFields.favGenre = favGenre;

        try {
            // Using upsert option creates new profile if the profile doesn't exist already
            let profile = await Profile.findOneAndUpdate(
                { user: req.user._id },
                { $set: profileFields },
                { new: true, upsert: true },
            );
            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

/**
 * Deletes logged in user profile
 * @route Delete /api/profile
 * @access Private
 */
router.delete('/', auth.authenticateToken, async (req, res) => {
    try {
        const userRecord = await User.findById(req.user._id);
        if (!userRecord) {
            return res.status(404).json({ message: 'User not found!' });
        }
        // Deletes the corresponding profile record
        await Profile.findOneAndRemove({ user: req.user._id });
        // Removes the user record
        await User.findOneAndRemove({ _id: req.user._id });
        
        res.json({ message: 'Profile deleted successfully!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * Deletes logged in user profile
 * @route Delete /api/profile
 * @access Private
 */
router.post(
    '/changePassword',
    [
        auth.authenticateToken,
        [
            check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
        ],
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const userRecord = await User.findById(req.user._id);
        if (!userRecord) {
            return res.status(404).json({ message: 'User not found!' });
        }

        let { password } = req.body;
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);
        try {
            let user = await User.findOneAndUpdate(
                { _id: req.user._id },
                { $set: { password: password } },
                { new: true },
            );
            res.json(user);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

module.exports = router;
