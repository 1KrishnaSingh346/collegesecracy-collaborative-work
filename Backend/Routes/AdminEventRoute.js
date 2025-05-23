const express= require('express');
const router = express.Router();
import  { isAdmin } from '../Middleware/IsAdmin'
import {CreateEvent,
    DeleteEvent,
    GetAllEvents,
    UpdateEvent,
    GetSingleEvent,
}  from '../Controller/AdminEventcontroller';

router.get('api/admin/GetAllEvents',isAdmin,GetAllEvents)
router.put('api/admin/DeleteEvent',isAdmin,DeleteEvent)
router.patch('api/admin/UpdateEvent',isAdmin,UpdateEvent)
router.get('api/admin/GetSingleEvent',isAdmin,GetSingleEvent)
router.put('api/admin/CreateEvent',isAdmin,CreateEvent)
export default router