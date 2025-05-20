const express = require('express')
import {submitFeedBack,
    AllFeedbackList,
    updateFeedBackStatus,
    getApprovedFeedbacks,
} from '../Controller/MenteeController'
import {isAdmin } from '../Middleware/IsAdmin'
 const router = express.Router();
  // diffrent routes
  router.get('/api/admin/feedback',isAdmin,AllFeedbackList);
  router.post('/api/feedback',submitFeedBack);
  router.patch('/api/feedback/:id',isAdmin,updateFeedBackStatus);
  router.get('/api/feedback?status=approved',getApprovedFeedbacks);
  
  export default router