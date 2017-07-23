var express = require('express');
var router = express.Router();
var controller = require('./jobController');

// Routes
var route = router.route('/');
route.get(controller.get);
route.post(controller.post);

router.param('id', controller.getById);
route = router.route('/:id');
route.get(function(req, res, next) {
  res.send(req.__orig);
});
route.put(controller.put);
route.delete(controller.delete);

route = router.route('/:id/changestatus');
route.put(controller.changeStatus);

module.exports = router;