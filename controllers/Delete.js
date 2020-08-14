const Asset = require('../models/Asset');

const deleteById = async function(id) {
  await Asset.deleteOne({_id: id});
  return;
}

module.exports = { deleteById };