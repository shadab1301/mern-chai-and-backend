const asyncHandler =(requestHandlerFunction)=>{
  return  (req,res,next)=>{
        Promise.resolve(requestHandlerFunction(req, res, next)).catch((error) =>
          next(err)
        );
        }
    }


export {asyncHandler}





// const asyncHandler2 = (fn) => async(req,res,next)=>{
//     try{
//        await fn(req,res,next)
//     }catch(error){
//        res.status(error.status || 500).json({
//         success:false,
//         message:error.message
//        })
//     }
// };