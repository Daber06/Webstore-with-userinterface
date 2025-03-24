const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    productNames: { 
        type: String,
       },
    productPrices: {
        type: Number,
    },
    productImages: {
        type: String,
    }
});
module.exports = mongoose.model('Product', productSchema);