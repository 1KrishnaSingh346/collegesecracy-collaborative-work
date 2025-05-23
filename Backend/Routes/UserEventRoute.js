const router = require('express')
import {GetAllEvents,
    MarkEvents,
    UnMarkEvent,
    GetMarkedEvents
} from '../Controller/UserEventcontroller'

router.get('api/GetMarkedEvents',GetMarkedEvents)
router.put('api/UnMarkEvent',UnMarkEvent)
router.put('api/MarkEvents',MarkEvents)

export default router