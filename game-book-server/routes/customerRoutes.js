const express = require("express");
const router = express.Router();

// Import all controller functions
const {
  createCustomer,
  getAllCustomers,
  updateCustomer,
  deleteCustomer,
  updateCustomerBalance,
} = require("../controllers/customerController");

// Import your authentication middleware
const { protect } = require("../middleware/authMiddleware"); // Make sure the path is correct

// Apply the 'protect' middleware to all routes in this file
router.use(protect);

// Routes for getting all customers and creating a new one
router.route("/")
  .get(getAllCustomers)
  .post(createCustomer);

// Route for updating customer balance (Admin only)
router.route("/:id/balance")
  .put(updateCustomerBalance);

// Routes for updating and deleting a specific customer by their ID
router.route("/:id")
  .put(updateCustomer)
  .delete(deleteCustomer);

module.exports = router;
