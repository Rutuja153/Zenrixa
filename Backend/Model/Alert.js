const mongoose = require("mongoose");


const alertSchema = new mongoose.Schema({

    sosId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"SOS",
        required:true
    },

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    contactId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Contact",
        required:true
    },

    message:{
        type:String,
        required:true
    },

    status:{
        type:String,
        default:"Pending"
    }

},
{
    timestamps:true
});


module.exports = mongoose.model("Alert",alertSchema);