import { create} from 'zustand'
import axios from 'axios'
const useAuthStore = create((get,set)=>({
   user:null,
   loading:false,
   initialAuthCheckComplete:false,

   // intilazie auth
   initializeAuth : async()=>{
try{
    const res = await axios.get('/api/auth/check');
    set({user:res.data.user,initialAuthCheckComplete:true});
}catch(e){
    console.log("error in intializeAuth",e)
    set({ initialAuthCheckComplete:false})
}
   },
   loadUser: async()=>{
try{
    set({loading:true})
    const res = await axios.get('api/auth/user');
    set({user:res.data,loading:false})
}catch(e){
    console.log("error in getting user",e)
    set({loading:true})
}
   },
     

    //clear user info and token on logout
    logout:async () => {
    await axios.post('/api/auth/logout');
    set({ user: null });
  },

   setFeedback: async (feedbackData) => {
    try {
      const res = await axios.post('/api/feedback', feedbackData);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Something went wrong");
    }
  },
}));

export default useAuthStore