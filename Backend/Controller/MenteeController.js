import Feedback from '../Models/FeedBackschema';
export const submitFeedBack = async (req, res) => {
    try {
        //  takng Body input by user 
        const { message, category,starRating } = req.body;
        // Finding the user
        const userId = req.user._id;
        const Feedback = new Feedback({ subject, message, category, userId,starRating });
        // saving the feedback
        await Feedback.save();
        res.status(201).json({ message: "FeedBack Submitted" });
    } catch (error) {
        console.log("Error in getting the feedback", error);
        res.status(500).json({ error: "Server Error" });
    };
};

// Admin getting Feedback list
export const AllFeedbackList = async (req, res) => {
    try {
        // status query
        const { status } = req.query;
        const query = status ? { status } : {};
        // getting all feedbacks
        const FeedBacks = await FeedBack.find(query).populate('userId', 'fullName')
        // fetching the feedbacks
        res.json(FeedBacks);
    } catch (error) {
        console.log("Error in getting the feedback list", error);
        res.status(500).json({ error: "Failed to failed feedback list" })
    }
}

// Admin updaitng the feedback list
export const updateFeedBackStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        // checking whether the status is valid or not 
        if (!['approved', 'rejected'].includes(status))
            return res.status(400).json({ error: "Invalid status" })
        // updating the feedback status
        const updated = await Feedback.findByIdAndUpdate(id,{status},{new:true})
        res.json(updated)
    } catch (error) {
        console.log("Error in updating the status of feedback",error)
        res.status(500).json({err:"Update Failed"})
    }
}
// Public api get approved feedbacks
export const getApprovedFeedbacks = async(req,res)=>{
try{
    // getting the approved feedbacks
    const ApprovedFeedbacks = await Feedback.find({status:'approved'}).populate('userId','fullName')
    res.json(ApprovedFeedbacks);
}catch (error){
console.log("Error in approving the feedbacks",error)
res.status(500).json({error:"Failed to fetch the testinomials"})
}
}