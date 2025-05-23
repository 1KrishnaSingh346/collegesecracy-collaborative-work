const EventCalender = require('../Models/EventScehma')

// create events
exports.CreateEvent = async(req,res)=>{
    try {
        const CreatedEvent = await EventCalender({...req.body, createdBy:req.user.id});
        await CreatedEvent.save();
        res.status(201).json({message:"Event Created Successfuly",CreatedEvent:CreatedEvent})
    } catch (err) {
          throw new Error(err.response?.data?.message ||"Failed to create the events");
    }
}

// Update event
exports.UpdateEvent = async (req,res)=>{
    try {
        const UpdateEvent = await EventCalender.findOneAndUpdate(req.params.id, req.body,{new:true})
        res.status(201).json({message:"Event Updated Succefully,UpdateEvent:UpdateEvent"})
    } catch (err) {
        throw new Error(err.response?.data?.message ||"Failed to update the events");
    }
}

// Delete events
exports.DeleteEvent = async (req,res)=>{
    try {
        const DeleteEvent = await EventCalender.findOneAndDelete(req.params.id)
        res.status(201).json({mesage:"Event deleted succesfully",DeleteEvent:DeleteEvent})
    } catch (err) {
        throw new Error(err.response?.data?.message ||"Failed to delete the events");
    }
}
// get single events
exports.GetSingleEvent = async(req,res )=>{
    try {
        const GetSingleEvent = await EventCalender.findOne(req.params.id);
        res.status(201).json({message:"Event shown succefully,GetSingleEvent:GetSingleEvent"})
    } catch (err) {
        throw new Error(err.response?.data?.message ||"Failed to delete the events");
    }
}
exports.GetAllEvents = async(req,res)=>{
    try {
        const GetAllEvents = await EventCalender.find().sort({date:1})
        res.status(201).json({message:"All events shown succesfully",GetAllEvents:GetAllEvents})
    } catch (err) {
        
    }
}