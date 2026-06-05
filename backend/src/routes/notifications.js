const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications, getUnreadCount, markRead, markAllRead, deleteNotification,
} = require('../controllers/notificationController');

// Notifications don't need subscription gate — users should always see notifications
router.use(protect);

router.get('/',              getNotifications);  // GET  /api/notifications
router.get('/unread-count',  getUnreadCount);    // GET  /api/notifications/unread-count
router.put('/read-all',      markAllRead);       // PUT  /api/notifications/read-all
router.put('/:id/read',      markRead);          // PUT  /api/notifications/:id/read
router.delete('/:id',        deleteNotification);// DELETE /api/notifications/:id

module.exports = router;
