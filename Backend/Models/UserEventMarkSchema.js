import mongoose from "mongoose";

const EventMarkerScehma= new mongoose.Schema({
     userId:{
        type:mongoose.Schema.Types.ObjectId,ref:'User', required:true
     },
     eventId:{
        type:mongoose.Schema.Types.ObjectId, ref:Event, required:true
     },
     reminderSet:{
        type:Boolean,
        default:true,
     },
     markedAt:{
        type:Date,
        default:Date.now()
     },
},{timestamps:true})

module.exports=mongoose.model('EventCalender',EventMarkerScehma);