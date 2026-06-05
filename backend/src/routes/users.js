const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { requireActiveSubscription } = require('../middleware/subscriptionGate');
const { getUsers, getUser, inviteUser, updateUser, deleteUser } = require('../controllers/userController');

// All user management routes: admin only + active subscription
router.use(protect, requireActiveSubscription, adminOnly);

router.get('/',           getUsers);    // GET  /api/users
router.post('/invite',    inviteUser);  // POST /api/users/invite
router.get('/:id',        getUser);     // GET  /api/users/:id
router.put('/:id',        updateUser);  // PUT  /api/users/:id
router.delete('/:id',     deleteUser);  // DELETE /api/users/:id

module.exports = router;
