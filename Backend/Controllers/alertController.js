const Alert = require("../Model/Alert");
const Contact = require("../Model/Contact");
const SOS = require("../Model/SOS");


// Send SOS Alert

exports.sendAlert = async(req,res)=>{

try{

const {
    sosId
}=req.body;


// Find SOS

const sos = await SOS.findOne({
    _id:sosId,
    userId:req.user.id
});


if(!sos){

return res.status(404).json({
message:"SOS not found"
});

}


// Find emergency contacts

const contacts = await Contact.find({
    userId:req.user.id
});


if(contacts.length===0){

return res.status(400).json({
message:"No emergency contacts found"
});

}



const alerts=[];


for(let contact of contacts){

const alert = await Alert.create({

sosId:sos._id,

userId:req.user.id,

contactId:contact._id,

message:
"Emergency! Please help. Location: "+
sos.location.address

});


alerts.push(alert);

}



res.status(201).json({

message:"SOS alerts sent successfully",

alerts

});


}
catch(error){

res.status(500).json({

message:error.message

});

}

};

// Get Alert History

exports.getAlertHistory = async(req,res)=>{

try{

const alerts = await Alert.find({
    userId:req.user.id
})
.populate("contactId")
.populate("sosId")
.sort({
    createdAt:-1
});


res.status(200).json({

totalAlerts: alerts.length,

alerts

});


}
catch(error){

res.status(500).json({

message:error.message

});

}

};