const BookInstance = require("../models/bookinstance");
const Book = require("../models/book");

const async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all BookInstances.
exports.bookinstance_list = (req, res, next) => {
  BookInstance.find()
    .populate("book")
    .exec((err, list_bookinstances) => {
      if (err) {
        return next(err);
      }
      // Successful, so render
      res.render("bookinstance_list", {
        title: "Book Instance List",
        bookinstance_list: list_bookinstances,
      });
    });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = (req, res, next) => {
  BookInstance.findById(req.params.id)
    .populate("book")
    .exec((err, bookinstance) => {
      if (err) {
        return next(err);
      }
      if (bookinstance == null) {
        // No Results
        const err = new Error("Book copy not found");
        err.status = 404;
        return next(err);
      }
      // Sucessful, so render
      res.render("bookinstance_detail", {
        title: `Copy: ${bookinstance.book.title}`,
        bookinstance,
      });
    });
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = (req, res, next) => {
  Book.find({}, "title").exec(function (err, books) {
    if (err) {
      return next(err);
    }
    // Successful, so render
    res.render("bookinstance_form", {
      title: "Create BookInstance",
      book_list: books,
    });
  });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  // Validate and sanitize fields
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid Date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization
  (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    // Create a BookInstance obj with escaped and trimmed data
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages
      Book.find({}, "title").exec(function (err, books) {
        if (err) {
          return next(err);
        }
        // Successful, so render
        res.render("bookinstance_form", {
          title: "Create BookInstance",
          book_list: books,
          selected_book: bookInstance.book._id,
          errors: errors.array(),
          bookInstance,
        });
      });
      return;
    } else {
      // Data from form is valid
      bookInstance.save(function (err) {
        if (err) {
          return next(err);
        }
        // Successful so redirect to new record
        res.redirect(bookInstance.url);
      });
    }
  },
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = (req, res, next) => {
  async.parallel(
    {
      bookInstance: (callback) =>
        BookInstance.findById(req.params.id).populate("book").exec(callback),
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.bookInstance == null) {
        // No Results
        res.redirect("/catalog/bookinstances");
      }
      // Success, so render
      res.render("bookinstance_delete", {
        title: "Delete Book Instance",
        bookInstance: results.bookInstance,
      });
    }
  );
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = (req, res, next) => {
  async.parallel(
    {
      bookInstance: (callback) =>
        BookInstance.findById(req.params.id).exec(callback),
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success, so find and delete book instance
      BookInstance.findByIdAndDelete(
        req.params.id,
        {},
        function deleteBookInstance(err) {
          if (err) {
            return next(err);
          }
          // Success, so Redirect to Book Instance list
          res.redirect("/catalog/bookinstances");
        }
      );
    }
  );
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = (req, res, next) => {
  async.parallel(
    {
      bookInstance: (callback) =>
        BookInstance.findById(req.params.id).populate("book").exec(callback),
      books: (callback) => Book.find({}, "title").exec(callback),
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.bookInstance == null) {
        // No Results
        const err = new Error("No Book Instance Found");
        err.status = 404;
        return next(err);
      }
      // Success
      res.render("bookinstance_form", {
        title: "Update Book Instance",
        bookInstance: results.bookInstance,
        book_list: results.books,
      });
    }
  );
};
 
// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
  // Validate and sanitize fields
  body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint must be specified")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("status").escape(),
  body("due_back", "Invalid Date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),
  // Process request after validation and sanitization
  (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    // Create a BookInstance obj with escaped and trimmed data and old ID
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id, // Required so a new ID is not issued
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages
      Book.find({}, "title").exec(function (err, books) {
        if (err) {
          return next(err);
        }
        // Successful, so render
        res.render("bookinstance_form", {
          title: "Create BookInstance",
          book_list: books,
          selected_book: bookInstance.book._id,
          errors: errors.array(),
          bookInstance,
        });
      });
      return;
    } else {
      // Data from form is valid
      BookInstance.findByIdAndUpdate(req.params.id, bookInstance, {}, function (err, updBookInstance) {
        if (err) {
          return next(err);
        }
        // Success - rediect to book instance details page
        res.redirect(updBookInstance.url);
      });
    }
  },
];
