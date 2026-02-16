const mongoose=require('mongoose');



const connectDb=async()=>{
    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("db connected");
        
    } catch (error) {

        console.log("db error");
        
    }
}

module.exports= connectDb;