import User from '../models/User';
export const registerUser =async()=>{
    const data = req.body

    //validation logic
    if(!data.name || !data.email || !data.password){
        return res.status(400).json({message:'Please fill all fields'});
    }
    
    try{
        const user = await User.create(data);
        res.status(201).json({user});
    }catch{
        res.status(400).json({message:'User registration failed'});
    }
}

export const verification =async()=>{

}

export const loginUser =async()=>{

}

export const logoutUser =async()=>{

}

