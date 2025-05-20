import { create} from 'zustand'

const AuthStore = create((get,set)=>({
    user: null,
    token : localStorage.getItem('token') || '',
     
    // store login info and token 
    login:(Userdata,token)=>{
        localStorage.setItem('token',token);
        set({user:Userdata,token})
    },

    //clear user info and token on logout
    logout:()=>{
        localStorage.removeItem('token')
        set({user:null,token:''})
    },

    getToken: ()=>get().token,

    //checking if user is admin based on role
    isAdmin: ()=> get().user?.role === 'admin',

}))
export default AuthStore