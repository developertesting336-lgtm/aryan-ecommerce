import mongoose from "mongoose";


function database(){
    mongoose.connect(process.env.DATABASE)
    .then(()=>console.log("mongoDb connected"))
    .catch((err)=> console.log("error",err))
}

export default database;