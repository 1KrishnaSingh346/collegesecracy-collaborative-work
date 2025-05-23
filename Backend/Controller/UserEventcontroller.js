const EventCalender = require('../Models/EventScehma')
const EventMark = require('../Models/UserEventMarkSchema')

// getting all the events
exports.GetAllEvents = async(req,res)=>{
try {
    const events = await EventCalender.find().sort({date:1});
    res.json(events)
} catch (err) {
    throw new Error(err.response?.data?.message ||"Failed to Fetch the events");
}
}
// marking the events 

exports.MarkEvents = async()=>{
    try {
        const AlreadyMarkEvents = await EventMark.findOne({userId:req.user.id,eventId:req.params.id})
        if(AlreadyMarkEvents) return res.status(400).json({message:"Already marked"})
        const Marknew = new EventMark({userId:req.user.id,eventId:req.params.id})
        await Marknew.save();
    } catch (err) {
        throw new Error(err.response?.data?.message ||"Failed to mark the events");
    }

// unmark event  
exports.UnMarkEvent = async ()=>{
    try {
        await EventMark.findOneAndDelete({userId:req.user.id,eventId:req.params.id});
        res.json({message:"Event UnMarked Succesfully"})
    } catch (err) {
        throw new Error(err.response?.data?.message ||"Failed to unmark the events");
    }
}
// get all marked events
exports.GetMarkedEvents = async()=>{
    try {
        const MarkEvents = await EventMark.find({userId:req.user.id}).populate('eventId');
        res.json(MarkEvents)
    } catch (err) {
        throw new Error(err.response?.data?.message ||"Failed to fetch marked events");
    }
 }
}
