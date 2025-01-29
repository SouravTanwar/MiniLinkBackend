import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";

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


export {registerUser}