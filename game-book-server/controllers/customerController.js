import Customer from '../models/Customer.js';
import Activity from '../models/Activity.js';
import Receipt from '../models/Receipt.js';

/**
 * @desc    Create a new customer
 * @route   POST /api/customers
 * @access  Private
 */
const createCustomer = async (req, res) => {
  try {
    const { name, address } = req.body;

    // Validation for required field
    if (!name) {
      return res.status(400).json({ message: 'Customer name is required' });
    }

    // Check if a customer with the same name already exists for this vendor
    const customerExists = await Customer.findOne({ name, vendorId: req.vendor.id });
    if (customerExists) {
      return res.status(400).json({ message: 'A customer with this name already exists' });
    }

    // Auto-increment srNo logic
    const lastCustomer = await Customer.findOne({ vendorId: req.vendor.id }).sort({ srNo: -1 });
    const srNo = lastCustomer ? lastCustomer.srNo + 1 : 1;

    const customer = await Customer.create({
      name,
      address,
      srNo, // Add the calculated serial number
      vendorId: req.vendor.id,
    });

    // Log the activity
    await Activity.create({
      vendorId: req.vendor.id,
      type: 'NEW_CUSTOMER',
      description: `'${customer.name}' was added as a new customer`,
    });

    res.status(201).json({ customer });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Server error while creating customer' });
  }
};

/**
 * @desc    Get all customers for the logged-in vendor with balance information
 * @route   GET /api/customers
 * @access  Private
 */
const getAllCustomers = async (req, res) => {
  try {
    // Sort by srNo for a consistent, sequential list
    const customers = await Customer.find({ vendorId: req.vendor.id }).sort({ srNo: 1 }).lean();
    
    // Enrich with balance information from latest receipts
    const customersWithBalance = await Promise.all(
      customers.map(async (customer) => {
        // Find the latest receipt for this customer
        const latestReceipt = await Receipt.findOne({ 
          customerId: customer._id,
          vendorId: req.vendor.id 
        }).sort({ date: -1, createdAt: -1 });

        // Add balance information
        customer.latestBalance = latestReceipt ? latestReceipt.finalTotalAfterChuk : 0;
        customer.advanceAmount = latestReceipt ? latestReceipt.finalTotal : 0;
        
        return customer;
      })
    );
    
    res.status(200).json({ customers: customersWithBalance });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Server error while fetching customers' });
  }
};

/**
 * @desc    Update a customer
 * @route   PUT /api/customers/:id
 * @access  Private
 */
const updateCustomer = async (req, res) => {
  try {
    const { name, address } = req.body;
    
    const customer = await Customer.findOne({ _id: req.params.id, vendorId: req.vendor.id });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Securely update only allowed fields
    customer.name = name || customer.name;
    customer.address = address || customer.address;
    
    const updatedCustomer = await customer.save();

    res.status(200).json({ customer: updatedCustomer });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Server error while updating customer' });
  }
};

/**
 * @desc    Delete a customer
 * @route   DELETE /api/customers/:id
 * @access  Private
 */
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, vendorId: req.vendor.id });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json({ message: 'Customer removed successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Server error while deleting customer' });
  }
};

/**
 * @desc    Update customer balance (Admin only)
 * @route   PUT /api/customers/:id/balance
 * @access  Private (Admin only)
 */
const updateCustomerBalance = async (req, res) => {
  try {
    const { yene, dene, advance } = req.body;
    const customerId = req.params.id;

    // Find the customer
    const customer = await Customer.findOne({ _id: customerId, vendorId: req.vendor.id });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Calculate the balance based on yene and dene
    // If yene > 0, balance is positive (customer owes us)
    // If dene > 0, balance is negative (we owe customer)
    const yeneAmount = parseFloat(yene) || 0;
    const deneAmount = parseFloat(dene) || 0;
    const advanceAmount = parseFloat(advance) || 0;
    
    // Validate: yene and dene should be mutually exclusive (only one can be > 0)
    if (yeneAmount > 0 && deneAmount > 0) {
      return res.status(400).json({ 
        message: 'Cannot set both येणे and देणे. Only one can have a value at a time.' 
      });
    }
    
    let finalBalance = 0;
    if (yeneAmount > 0) {
      finalBalance = yeneAmount;
    } else if (deneAmount > 0) {
      finalBalance = -deneAmount;
    }

    // Find the latest receipt for this customer
    const latestReceipt = await Receipt.findOne({ 
      customerId: customer._id,
      vendorId: req.vendor.id 
    }).sort({ date: -1, createdAt: -1 });

    if (latestReceipt) {
      // Update the latest receipt with new balance values
      latestReceipt.finalTotalAfterChuk = finalBalance;
      latestReceipt.finalTotal = advanceAmount;
      await latestReceipt.save();
    } else {
      // If no receipt exists, create a dummy receipt to store the balance
      await Receipt.create({
        customerId: customer._id,
        vendorId: req.vendor.id,
        date: new Date(),
        finalTotalAfterChuk: finalBalance,
        finalTotal: advanceAmount,
        gameType: 'Balance Adjustment',
        totalJama: yeneAmount,
        totalUdhar: deneAmount,
        chukAmount: 0,
      });
    }

    // Log the activity
    await Activity.create({
      vendorId: req.vendor.id,
      type: 'BALANCE_UPDATE',
      description: `Balance updated for customer '${customer.name}' - येणे: ${yeneAmount}, देणे: ${deneAmount}, आड: ${advanceAmount}`,
    });

    res.status(200).json({ 
      message: 'Balance updated successfully',
      balance: {
        latestBalance: finalBalance,
        advanceAmount: advanceAmount
      }
    });
  } catch (error) {
    console.error('Error updating customer balance:', error);
    res.status(500).json({ message: 'Server error while updating balance' });
  }
};

export {
  createCustomer,
  getAllCustomers,
  updateCustomer,
  deleteCustomer,
  updateCustomerBalance,
};
