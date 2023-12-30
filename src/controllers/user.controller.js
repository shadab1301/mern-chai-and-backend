import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { destroyFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"

// Generate access Token and refresh token

const generateAccessTokenAndRefreshToken=async(id)=>{
  try {
    const user = await User.findOne(id);
    const accessToken=await user.generateAccessToken();
    const refreshToken=await user.generateRefreshToken();
  
    user.refreshToken = refreshToken;

   await user.save({ validateBeforeSave : false});

    return {accessToken,refreshToken}
  } catch (error) {
    throw new ApiError(500,"Error occour while creating access token and refresh token")
  }
}



const userRegister=asyncHandler(async(req,res)=>{
  // Step
  // 1. Take data from users
  // 2. Validation (Data should not be empty)
  // 3. Check file , check avatar (avatar should not be empty)
//   4. check if user is already exist
  // 5. upload avatar to local and then cloudnary
  // 6. Password encryption
  // 7. Access token and refresh token
  // 8. Create object and save it into mongoDB
  // 9. check for user creation
  // 10. remove password and refresh token from response
  // 11. return response to user  

  const { username , fullName,email,password} = req.body;

  if([username , fullName,email,password].some((value)=>value?.trim()==="")){
    throw new ApiError(400,"All fields are required.");
  }

    // Check user is already exist or not

    const alreadyExistUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if(alreadyExistUser){
        throw new ApiError( 409, "User already exist." )
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required.")
    }
    const avatar =await uploadOnCloudinary(avatarLocalPath);
    const coverImage =await uploadOnCloudinary(coverImageLocalPath);

    const userData = {
      username,
      fullName,
      email,
      password,
      avatar:avatar?.url,
      coverImage:coverImage?.url || ""
    };

    const created = await User.create(userData);

    const createdUser = await User.findById(created._id)
    // .select(
    //   "-password -refreshToken"
    // );


    if(!createdUser){
        throw new ApiError(500,"Something went wrong while creating the user.")
    }
    console.log("registred data : ", createdUser);
    return res.status(201).json(new ApiResponse(200,createdUser,"User created successfully."));

    


})

const userLogin=asyncHandler(async(req,res)=>{
  // step
  // 1. Take login data from user
  // 2. Validation (login data shoud not be null or blank)
  // 3. check user expist or not
  // 4. check password is valid or not
  // 5. store access token and refresh toke
  // 6. send cookie and response
    const {username,email,password}=req.body

    if (!username && !email) {
      throw new ApiError(400, "username or email is required");
    }
    
    const user= await User.findOne({
      $or:[{email},{username}]
    })
    if(!user){
      throw new ApiError(404,"User not exist")
    }
    const isPasswordValid = await user.isPasswordCorrect(password.toString());
    if (!isPasswordValid) {
      throw new ApiError(401, "Please enter valid password");
    }

 const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken();
 const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
 const options = {
   httpOnly: true,
   secure: true,
 };
    return res
      .status(200)
      .cookie("accessToken", accessToken,options)
      .cookie("refreshToken", refreshToken,options)
      .json(new ApiResponse(200, { user: loggedInUser , accessToken , refreshToken}));

   
})


const userLogout=asyncHandler(async(req,res)=>{
// Step 
// 1. clear the accessToken and refreshToken from cookie
// 2. clear refreshToken from user collection
// 3. return response to user
 const options = {
   httpOnly: true,
   secure: true,
 };
 
  const user = await User.findOneAndUpdate(
    req?.user?._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );

return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "Logged out successfully!"));

})


const refreshAccessToken=asyncHandler(async(req,res)=>{

    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken
    console.log(req.cookies);
    if(!incomingRefreshToken){
      throw new ApiError(401,"Unauthorized request")
    }
    // const decodedRefreshToken = jwt.verify(
    //   incomingRefreshToken,
    //   process.env.REFRESH_TOKEN_SECRET
    // );


  const decodedRefreshToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

    console.log("decodedRefreshToken", decodedRefreshToken);
     if (!decodedRefreshToken) {
       throw new ApiError(401, "Invalid refresh token");
     }
    console.log(2222);
     const user=await User.findById(decodedRefreshToken?._id)
     console.log(user)
  console.log(decodedRefreshToken?.id);
     if(!user){
      throw new ApiError(401,"Invalid refresh token")
     }
      if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");
      }
      console.log(4444);
     
      const {accessToken,refreshToken} = await generateAccessTokenAndRefreshToken(user?._id);
       const options = {
         httpOnly: true,
         secure: true,
       };
       return res
         .status(200)
         .cookie("accessToken", accessToken, options)
         .cookie("refreshToken", refreshToken, options)
         .json(
           new ApiResponse(
             200,
             { accessToken, refreshToken: refreshToken },
             "New accesstoken created successfully"
           )
         );
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
  // step
  // 1. take old passsword and new Password from user and validate
  // 2. identify the user from collection
  // 3. validate user oldPassword to password in the collcetion
  // 3. update to collection
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new ApiError(401, "OldPassword and new password are required.");
  }

  const user = await User.findById(req?.user?._id);
  if (!user) {
    throw new ApiError(401, "Invalid accessToken.");
  }

  const isOldPasswordValidate = await user.isPasswordCorrect(oldPassword);
  if (!isOldPasswordValidate) {
    throw new ApiError(401, "Invalid old password");
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password updated successfully"));
});


const getCurrentUser =asyncHandler(async(req,res)=>{
  const currentUser=req?.user
  if(!currentUser){
    throw new ApiError(401,"Invalid accesstoken ")
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, { data: currentUser }, "user fetched  successfully")
    );
})
const updateAccountDetails =asyncHandler(async(req,res)=>{
  // 
  const {fullName,email}=req.body
   if (!fullName || !email) {
     throw new ApiError(400, "All fields are required");
   }

   const updatedUser = await User.findByIdAndUpdate(
     req?.user._id,
     {
       $set: { fullName: fullName ,  email: email },
     },
     { new: true },
   ).select("-password");

   return res.status(200).json(new ApiResponse(200,{data:updatedUser},"User account details updated successfully."))
})

const updateUserAvatar =asyncHandler(async(req,res)=>{
  const avatarLocalPath=req.file?.path
  if(!avatarLocalPath){
    throw new ApiError(401,"Avatar is missing")
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if(!avatar.url){
    throw new ApiError("400", "Something went wrong while upload on cloudnary")
  }

  const user = await User.findByIdAndUpdate(req?.user._id, {
    $set: { avatar: avatar.url },
    new: true,
  }).select("-password");

  const public_id = getPublicIdFromCloudnaryUrl(req?.user.avatar)
  await destroyFromCloudinary(public_id);

return res.status(200).json(200,{data:user},"Avatar updated successfully")

})
const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(401, "Avatar is missing");
  }
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError("400", "Something went wrong while upload on cloudnary");
  }

  const user = await User.findByIdAndUpdate(req?.user._id, {
    $set: { coverImage: coverImage.url },
    new: true,
  }).select("-password");
  const public_id = getPublicIdFromCloudnaryUrl(req?.user.avatar);
  await destroyFromCloudinary(public_id);
  return res
    .status(200)
    .json(200, { data: user }, "CoverImage updated successfully");
});


export {
  userRegister,
  userLogin,
  userLogout,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
};