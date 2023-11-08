
import connectDB from "./db/index.js";



connectDB()


{/*
;(async()=>{
    try{
        await mongoose.connect(`${process.env.CONNNECTION_URI}/${DB_NAME}`)

        app.on("error",(error)=>{
            console.log("error" , error)
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`)
        })

    }catch(error){
        console.log("Connection failed : ", error)

    }
})()
*/}
