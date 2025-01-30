import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { Link } from "../models/link.model.js";
import { Analytics } from "../models/analytics.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefereshToken = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const {name, email, password, phoneNumber} = req.body

    if([name, email, password, phoneNumber].some((field)=> field?.trim() === "")){
        throw new ApiError(400, "All Fields is required")
    }

    const existedUser = await User.findOne({
        $or: [{email}, {phoneNumber}]
    })

    if (existedUser){
        throw new ApiError(409, "User with email or phone already exist")
    }

    const user = await User.create({
        name,
        email,
        password,
        phoneNumber
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser){
        throw new ApiError(500, "Not able to register the user")
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"))

})

const loginUser = asyncHandler(async (req,res)=>{

    const {email, password} = req.body

    if(!email){
        throw new ApiError(400, "email is required")
    }

    const user = await User.findOne({email})

    if(!user){
        throw new ApiError(404, "user doesn't exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid Password")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefereshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {user : loggedInUser, accessToken, refreshToken}, "User Logged In Successfully"))

})

const logOutUser = asyncHandler(async (req,res)=> {

    await User.findByIdAndUpdate(req.user._id, {$set: {refreshToken: undefined}}, {new: true} )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{},"User Logged Out Successfuly"))

})

const refreshAccessToken = asyncHandler(async(req, res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorised request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user =await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401, "invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, refreshToken} = await generateAccessAndRefereshToken(user._id)
    
        return res.status(200)
        .cookie("accessToken", accessToken,options)
        .cookie("refreshToken", refreshToken,options)
        .json(new ApiResponse(200, {accessToken,refreshToken},"Access token refreshed"))
    } catch (error) {
        throw new ApiError(401, "invalid refresh token")
    }
})

const getCurrentUser = asyncHandler(async(req, res)=>{
    return res.status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { name, email, phoneNumber } = req.body;

    if (!name || !email || !phoneNumber) {
        throw new ApiError(400, "All fields are required");
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
        $set: { name, email, phoneNumber },
        $unset: { refreshToken: "" }
    }, { new: true }).select("-password -refreshToken");

    if (!updatedUser) {
        throw new ApiError(500, "Something went wrong while updating account details");
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    res.clearCookie("accessToken", options)
        .clearCookie("refreshToken", options);

    return res.status(200).json(new ApiResponse(200, updatedUser, "Account details updated. Please log in again."));
});

const deleteUserAccount = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    
    
        const links = await Link.find({ user: userId });

        for (const link of links) {
            await Analytics.deleteMany({ link: link._id });
        }

        await Link.deleteMany({ user: userId });
        


    await user.deleteOne();

    const options = {
        httpOnly: true,
        secure: true
    };

    res.clearCookie("accessToken", options)
    .clearCookie("refreshToken", options);

    return res.status(200).json(new ApiResponse(200, {}, "User account deleted successfully"));
});

export {registerUser, loginUser, logOutUser, refreshAccessToken, getCurrentUser, updateAccountDetails, deleteUserAccount}