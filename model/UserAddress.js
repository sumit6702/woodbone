import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    userid:{
        type:String,
        required: true,
    },
    address: [
        {
            FirstName: String,
            LastName: String,
            PhoneNo: String,
            Address: String,
            State: String,
            City: String,
            Pincode: String,
            Country: String,
            default:Boolean,
        }
    ]
});

const USERADDRESS = mongoose.model('UserAddress', addressSchema);

export default USERADDRESS;
