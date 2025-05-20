import mongoose from "mongoose";
 const feedBackSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    message:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        enum:['pending','approved','rejected'],
        default:'pending',
    },
 },{timestamps:true});

 export default mongoose.model('Feedback',feedBackSchema)