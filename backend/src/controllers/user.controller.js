import { User } from "../models/index.js"
import { ApiError,ApiResponse } from "../utils/apiResponse.js";

export const userImage =async(req,res)=>{
    try {
            console.log("image API hit");

    if (!req.file) {
      throw new ApiError(400, "Image is required");
    }
        const image= req.file.filename
        console.log("image",image)
        const user = await User.findOne({_id:req.user._id});
        
     if (!user) {
  throw new ApiError(409,  "User not found");
}
        user.image=image;
      await  user.save();

        return res.status(200).json(
new ApiResponse(201,{user}, "image uploaded successfully"));
    } catch (error) {
        console.log("error",error)
   return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
    }
}

export const login=async(req,res)=>{
 try {
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if (!user) {
        throw new ApiError(409, "User not found");
    }
    const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
  throw new ApiError(409, "password is incorrect");
}

const token = jwt.sign(
  {
    _id: user._id,
    email: user.email,
    role: user.role
  },
  process.env.ACCESS_TOKEN_SECRET,
  {
    expiresIn: "1d",
  }
);
return res.status(200).json(
  new ApiResponse(
    200,
    {
      user,
      token,
    },
    "User login successfully"
  )
);
 } catch (error) {
     console.log("error",error)
   return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
 }
}


export const getUserById = async(req,res)=>{
    try {
        const user = await User.findById(req.params.id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }    
    
   
           return res.status(200).json(
new ApiResponse(200,{user}, "User fetched successfully"));
} catch (error) {
        console.log("error",error)
   return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
    }
}



// Add a new address
export const addAddress = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      fullName,
      phoneNumber,
      addressLine,
      city,
      state,
      pincode,
      country,
    } = req.body;

    if (
      !fullName ||
      !phoneNumber ||
      !addressLine ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "All required address fields are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.address.push({
      fullName,
      phoneNumber,
      addressLine,
      city,
      state,
      pincode,
      country: country || "India",
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      addresses: user.address,
    });
  } catch (error) {
    console.error("Add address error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


// Get all addresses
export const getAddresses = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("address");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      addresses: user.address,
    });
  } catch (error) {
    console.error("Get addresses error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


// Update an address
export const updateAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.params;

    const {
      fullName,
      phoneNumber,
      addressLine,
      city,
      state,
      pincode,
      country,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const address = user.address.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    address.fullName = fullName ?? address.fullName;
    address.phoneNumber = phoneNumber ?? address.phoneNumber;
    address.addressLine = addressLine ?? address.addressLine;
    address.city = city ?? address.city;
    address.state = state ?? address.state;
    address.pincode = pincode ?? address.pincode;
    address.country = country ?? address.country;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    console.error("Update address error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};


// Delete an address
export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const address = user.address.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    address.deleteOne();

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.address,
    });
  } catch (error) {
    console.error("Delete address error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};



export const updateUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      fullName,
      phone,
      firstName,
      lastName,
      email
    } = req.body;
console.log("updateuser",fullName,
      phone,
      firstName,
      lastName,
      email)
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email;


    await user.save();

    res.status(200).json({
      success: true,
      message: "user updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};