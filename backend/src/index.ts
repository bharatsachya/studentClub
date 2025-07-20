import dotenv from 'dotenv';
import connectDB from './db/index.js'
import {app} from './App';

dotenv.config(
    {
        path: '../env'
    }
)

connectDB()
.then(()=>{
   app.get('/',(req: import('express').Request, res: import('express').Response)=>{
       res.send("Server is running");
   })

    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running on port ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log(error);
});
