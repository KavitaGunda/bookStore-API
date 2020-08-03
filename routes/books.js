var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Book = require('../models/Book');
const User = require('../models/User');

/**
 * Creates a book entry
 * @route POST api/books
 * @access Private
 */
router.post(
  '/',
  [
    auth.authenticateToken,
    [
      check('title', 'Title is required')
        .not()
        .isEmpty(),
      check('category', 'Category is required')
        .not()
        .isEmpty(),
      check('author', 'Author is required')
        .not()
        .isEmpty(),
      check('totalChapter', 'TotalChapter is required')
        .not()
        .isEmpty(),
      check('currentChapter', 'currentChapter is required')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user._id).select('-password');

      const newBook = new Book({
        title: req.body.title,
        category: req.body.category,
        author: req.body.author,
        totalChapter: req.body.totalChapter,
        currentChapter: req.body.currentChapter,
        name: user.name,
        avatar: user.avatar,
        user: req.user._id,
      });

      const book = await newBook.save();

      res.json(book);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
);

/**
 * Get all books
 * @route GET api/books
 * @access Private
 */
router.get('/', auth.authenticateToken, async (req, res) => {
  try {
    const books = await Book.find().sort({ date: -1 });
    res.json(books);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * Get book by :id
 * @route GET api/books/:id
 * @access Private
 */
router.get('/:id', auth.authenticateToken, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found!' });
    }

    res.json(book);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Book not found!' });
    }
    res.status(500).send('Server Error');
  }
});

/**
 * Delete book by :id
 * @route DELETE api/books/:id
 * @access Private
 */
router.delete('/:id', auth.authenticateToken, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found!' });
    }

    // Check user
    if (book.user.toString() !== req.user._id) {
      return res.status(401).json({ message: 'User not authorized!' });
    }

    await book.remove();

    res.json({ message: 'Book removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Book not found!' });
    }
    res.status(500).send('Server Error');
  }
});

/**
 * Update book by :id
 * @route PUT api/books/:id
 * @access Private
 */
router.put(
  '/:id',
  [
    auth.authenticateToken,
    [
      check('title', 'Title is required')
        .not()
        .isEmpty(),
      check('category', 'Category is required')
        .not()
        .isEmpty(),
      check('author', 'Author is required')
        .not()
        .isEmpty(),
      check('totalChapter', 'TotalChapter is required')
        .not()
        .isEmpty(),
      check('currentChapter', 'currentChapter is required')
        .not()
        .isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updatedData = {
      title: req.body.title,
      category: req.body.category,
      author: req.body.author,
      totalChapter: req.body.totalChapter,
      currentChapter: req.body.currentChapter,
    };

    try {
      const book = await Book.findOne({ _id: req.params.id });

      if (!book) {
        return res.status(404).json({ message: 'Book not found!' });
      }

      const result = Object.assign(book, updatedData);

      await Book.findByIdAndUpdate(
        req.params.id,
        { $set: result },
        { new: true },
      );

      res.json(result);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
);

/**
 * Search book by Title, Author, Category 
 * @route GET api/books/search/:search
 * @access Private
 */
router.get(
  '/search/:search',
  [ auth.authenticateToken ],
  async (req, res) => {
    try {
      let { search } = req.params;
      let regex = new RegExp(search, 'i');
      //Aggregation query searches the book across title, author and category fields and searching can be made efficient with indexing but for now I am avoiding
      const book = await Book.aggregate([
        { $project: { title: 1, category: 1, author: 1, totalChapter: 1, avatar: 1 } },
        {
          $match:
          {
            $or: [
              { 'title': regex },
              { 'category': regex },
              { 'author': regex }
            ]
          }
        },
        { $limit: 5 }
      ]);

      if (!book) {
        return res.status(404).json({ message: 'Book not found!' });
      }

      res.json(book);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  },
);

module.exports = router;
