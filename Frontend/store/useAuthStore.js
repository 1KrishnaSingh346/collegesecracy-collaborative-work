import { create} from 'zustand'
import axios from 'axios'
const useAuthStore = create((get,set)=>({
   user: (() => {
        try {
            return JSON.parse(localStorage.getItem('user')) || null;
        } catch (e) {
            console.error('Failed to parse user from localStorage:', e);
            return null;
        }
    })(),
    token:localStorage.getItem('token')||'',
 // login
     login: (Userdata, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(Userdata));
        set({ user: Userdata, token });
    },     

    //clear user info and token on logout
    logout: () => {
     localStorage.removeItem('token');
     localStorage.removeItem('user');
     set({ user: null, token: '' });  
    },
// feedback apis
// for public
   setFeedback: async (feedbackData) => {
    try {
      const res = await axios.post('/api/feedback', feedbackData);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Something went wrong");
    }
  },
  // for admin only
  AllFeedbackList: async ()=>{
    try{
const res = await axios.get('/api/admin/feedback');
return res.data;
    }catch (err){
throw new Error(err.response?.data?.message || "Something went wrong")
    }
  },
// get approved feedback
getApprovedFeedbacks: async()=>{
  try {
    const res = await axios.get('/api/feedback?status=approved');
    return res.data
  } catch (err) {
    throw new Error(err.response?.data?.message || "Something went wrong")
  }
},

//update feedback status for admin only
updateFeedBackStatus: async()=>{
try {
  const res = await axios.patch('/api/feedback/:id');
  return res.data
} catch (err) {
  throw new Error(err.response?.data?.message || "Something went wrong")
}
},
}));

export default useAuthStore