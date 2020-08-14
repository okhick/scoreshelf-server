const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assetSchema = new Schema({
  sharetribe_user_id: String,
  sharetribe_listing: String,
  asset_name: String,
  size: Number,
  date_added: { type: Date, default: Date.now },
});

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;