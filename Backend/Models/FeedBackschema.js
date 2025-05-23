import mongoose from "mongoose";
 const feedBackSchema = new mongoose.Schema({
   :{
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
    starRating:{
        type:Number,
        min:1,
        max:5,
        required:true,
        default:0,
    }
 },{timestamps:true});

 export default mongoose.model('Feedback',feedBackSchema)