import mongoose from "mongoose";
import bcrypt from "bcrypt"
const userSchema =new  mongoose.Schema({
fullName:{
    // required:true,
    type:String
},
email:{
    type:String,
    required:true,
    unique:true
},
phone:{
    type:String,
    // required:true,
    unique:true
},
password:{
    type:String,
    required:true,
},
firstName:{
    required:true,
    type:String
},
lastName:{
    required:true,
    type:String
},
image:{
    type:String,
},
role:{
    type:String,
    enum:["user","vendor","admin"],
    default:"user"
},
status:{
  type:String,
  enum:["active", "inactive","blocked"]
},
 address: [
      {
        fullName: {
          type: String,
          required: true,
        },

        phoneNumber: {
          type: String,
          required: true,
        },

        addressLine: {
          type: String,
          required: true,
        },

        city: {
          type: String,
          required: true,
        },

        state: {
          type: String,
          required: true,
        },

        pincode: {
          type: String,
          required: true,
        },

        country: {
          type: String,
          default: "India",
        },
      },
    ],
},{timestamps:true});

// Hash password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});


const User = mongoose.model("User",userSchema);

export default User;