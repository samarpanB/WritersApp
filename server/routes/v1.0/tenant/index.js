var express = require('express');
var router = express.Router();
var controller = require('./tenantController');
var userController = require('../user/userController');

// Routes
var route = router.route('/');
// Auth check for all routes
router.use(userController.isSuperAdmin);
route.get(controller.get);
route.post(controller.post);

router.param('id', controller.getById);
route = router.route('/:id');
route.get(function(req, res, next) {
  res.send(req.__orig);
});
route.put(controller.put);
route.delete(controller.delete);

module.exports = router;