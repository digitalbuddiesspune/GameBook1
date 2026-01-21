// // utils/counterService.js

// const Counter = require('../models/Counter');

// /**
//  * Atomically increments the sequence counter for a specific document ID.
//  * @param {string} counterName - The unique name of the counter sequence (e.g., 'receiptSrNo').
//  * @returns {Promise<number>} - The newly incremented serial number.
//  */
// async function getNextSequenceValue(counterName) {
//     const counterDocument = await Counter.findByIdAndUpdate(
//         { _id: counterName }, 
//         { $inc: { seq: 1 } },
//         { 
//             new: true,
//             upsert: true, // Creates the counter document if it doesn't exist
//             setDefaultsOnInsert: true // Ensures 'seq' defaults to 0, so the first number will be 1.
//         } 
//     );
    
//     return counterDocument.seq;
// }

// module.exports = { getNextSequenceValue };