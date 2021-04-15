const express = require('express');
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const pointInPolygon = require("point-in-polygon");

const PORT=8081||process.env.PORT;

mongoose.connect("mongodb+srv://girish:girish@cluster0.s7cjk.mongodb.net/Xmeme?retryWrites=true&w=majority",
    {useNewUrlParser: true, useUnifiedTopology: true}).then(() => console.log("Mongo DB connected"));

const mongooseSchema = new mongoose.Schema({
    asset_id: Number,
    asset_unique_number: String,
    asset_info: String,
    time_stamp: String,
    latitude: Number,
    longitude: Number,
    asset_type_id_foreign_key: Number
});

const GeoFenceSchema = new mongoose.Schema({
    asset_id: Number,
    coordinates: Array
});

const GeoRouteSchema = new mongoose.Schema({
    asset_id: Number,
    positivecoordinates: Array,
    negativecoordinates: Array
});

const userSchema=new mongoose.Schema({
     name:String,
     username:String,
     password:String
})
const assets = mongoose.model("asset", mongooseSchema);
const geofence = mongoose.model("geofence", GeoFenceSchema);
const georoute = mongoose.model("georoute", GeoRouteSchema);
const users=mongoose.model("user",userSchema);

app.use(cors());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use("/login",async (req,res)=>{
    const name=req.body.name;
    const username=req.body.username;
    const password=req.body.password;
    const obj1={
        name:name,
        username:username,
        password:password
    }
    await users.find({username:username,password:password},(err,ans)=>{
        if(!err && ans.length!==0)
        {
            const obj2={
                token:"jumbogps123"
            }
            res.send(obj2);
        }
        else {
            res.send(false);
        }
    })

})

app.get('/api/asset_type', (req, res) => {
    const arr = [];
    const obj =
        {
            asset_type_id: 1,
            asset_type_name: "Truck_driver",
            description: "This asset type will be for all trucks"
        }
    arr.push(obj);
    res.send(obj);
})

app.get('/api/asset_id', async (req, res) => {
    let finalResponse = {
        data: null,
        geofenceResponse: null,
        georouteResponse: null
    };
    await assets.find(async (err, ans) => {
        if (!err) {
            const geofenceResponse = [];
            const georouteResponse = [];
            for (let i = 0; i < ans.length; i++) {
                await geofence.find({asset_id: ans[i].asset_id}, (err, answer) => {
                    if (!err && answer.length !== 0) {
                        const arr = [ans[i].longitude, ans[i].latitude];
                        const coordinates = answer[0].coordinates;
                        const boolflag = (pointInPolygon(arr, coordinates));
                        if (boolflag === false) {
                            const obj1 = {
                                asset_id: answer[0].asset_id,
                                geofence: false
                            }

                            geofenceResponse.push(obj1);
                        }

                    }
                })

                await georoute.find({asset_id: ans[i].asset_id}, (err, answer) => {
                    if (!err && answer.length !== 0) {

                        const arr1 = [ans[i].longitude, ans[i].latitude];
                        const positivecoordinates = answer[0].positivecoordinates;
                        const negativecoordinates = answer[0].negativecoordinates;
                        const boolflag = (pointInPolygon(arr1, positivecoordinates))
                        const negativeboolflag = (pointInPolygon(arr1, negativecoordinates));
                        if (boolflag === false && negativeboolflag === false) {
                            const obj1 = {
                                asset_id: answer[0].asset_id,
                                georoute: false
                            }
                            georouteResponse.push(obj1);
                        }
                    } else if(err) {
                        console.log("Error= ", err);
                    }
                })
            }

            finalResponse = {
                data: ans,
                geofenceResponse: geofenceResponse,
                georouteResponse: georouteResponse
            }
            res.send(finalResponse);
        } else {
            res.send(err);
        }
    })

})

app.get("/api/asset_type/:assettype", async (req, res) => {
    const arr = [];
    const assetType=(req.params.assettype);
    if(assetType==='truck') {
        const obj1 = {
            asset_id: 1,
            asset_info: "The truck belongs to Rahul",
            asset_unique_number: "1",
            time_stamp: "2017-03-01T12:48:00Z",
            latitude: 16.8524,
            longitude: 74.5815,
            asset_type_id_foreign_key: 2
        }

        const obj2={
            asset_id: 2,
            asset_info: "The vehicle carries sport materials",
            asset_unique_number: "2",
            time_stamp: "2021-03-01T12:48:00Z",
            latitude: 18.5204,
            longitude: 73.8567,
            asset_type_id_foreign_key: 3
        }
        const obj3={
            asset_id: 5,
            asset_info: "The truck is carrying the material from capital of India",
            asset_unique_number: "5",
            time_stamp: "2021-08-22T12:48:00Z",
            latitude:28.7041,
            longitude:77.1025,
            asset_type_id_foreign_key:6
        }

        arr.push(obj1);
        arr.push(obj2);
        arr.push(obj3);

        res.send(arr);
    }
    else if(assetType==='driver')
    {
      const obj1={
          asset_id: 3,
          asset_info: "The salesman has contract with Mohan Fabrics",
          asset_unique_number: "3",
          time_stamp: "2021-05-02T12:48:00Z",
          latitude:19.9975,
          longitude:73.7898,
          asset_type_id_foreign_key:4
      }
      const obj2={
          asset_id: 4,
          asset_info: "The delivery person delivers all items in Maharashtra district ",
          asset_unique_number: "4",
          time_stamp: "2021-08-22T12:48:00Z",
          latitude:19.0948,
          longitude:74.748,
          asset_type_id_foreign_key:5
      }
        const obj4={
            asset_id: 6,
            asset_info: "This salesperson is awarded with the best employee from Mohan Fabrics...",
            asset_unique_number: "6",
            time_stamp: "2021-09-25T12:48:00Z",
            latitude:18.1853,
            longitude:76.042,
            asset_type_id_foreign_key:7
        }
      arr.push(obj1);
      arr.push(obj2);
      arr.push(obj4);
      res.send(arr);
    }
    else {
        const response=await assets.find();
        res.send(response);
    }


})

app.get("/api/asset_id/:id", async (req, res) => {
    const asset_id=(req.params.id);
    const arr = [];
    const response=await assets.find({asset_id:asset_id});
    res.send(response);
});

app.get("/api/history/:id", (req, res) => {
    const arr = [];
    const obj1 = {
        asset_id: 1,
        time_stamp: "2017-02-01T12:35:00Z",
        longitude: 77.856743,
        latitude: 18.52043
    }
    const obj2 = {
        asset_id: 1,
        time_stamp: "2017-02-01T12:31:00Z",
        longitude: 73.7997,
        latitude: 18.6298
    }
    const obj3 = {
        asset_id: 1,
        time_stamp: "2017-02-01T12:35:00Z",
        longitude: 72.856743,
        latitude: 20.52043
    }
    arr.push(obj1);
    arr.push(obj2);
    arr.push(obj3);
    res.send(arr);
})

app.get("/api/asset_id_max_asset/:id", async (req, res) => {
    const arr = [];
    const count=(req.params.id);
    let response=await assets.find();
    response=response.reverse();
    for(let i=0;i<count && i<response.length;i++)
    {
        let assetDetail=response[i];
        arr.push(assetDetail);
    }
    res.send(arr);
});

app.get("/my-date/:startdate/:enddate", (req, res) => {
    const startdate = req.params.startdate;
    const assetDataArr = [];
    const temparr = [];
    const obj1 = {
        asset_id: 1,
        time_stamp: "2017-03-01T12:50:00Z",
        longitude: 74.5815,
        latitude: 16.8524
    }
    const obj2 = {
        asset_id: 1,
        time_stamp: "2017-03-01T12:48:00Z",
        longitude: 68.856743,
        latitude: 18.52043
    }
    const obj3 = {
        asset_id: 1,
        time_stamp: "2017-03-01T12:35:00Z",
        longitude: 72.856743,
        latitude: 20.52043
    }
    temparr.push(obj1);
    temparr.push(obj2);
    temparr.push(obj3);

    assetDataArr.push(temparr);
    res.send(assetDataArr);

})


app.post("/api/geofence", async (req, res) => {
    const asset_id = req.body.assetId;
    const coordinates = req.body.name;
    // console.log("Coordinates= ",coordinates);
    let arr1 = [];
    const obj1 = {
        asset_id: asset_id,
        coordinates: coordinates
    }
    geofence.insertMany(obj1);

   const response=await assets.find({asset_id: asset_id});
  if(response.length!==0)
  {
      arr1=[response[0].longitude,response[0].latitude];
  }
    const boolflag = (pointInPolygon(arr1, coordinates));
    res.send(boolflag);
})

app.post("/api/georoute", async(req, res) => {
    let arr1 = [];
    const coordinates = (req.body.name);
    const asset_id = (req.body.assetId);
    const negativecoordinates = Array.from(coordinates);
    const positivecoordinates = Array.from(coordinates);

    const response=await assets.find({asset_id: asset_id});
    if(response.length!==0)
    {
      arr1=[response[0].longitude,response[0].latitude];
    }
    var i;
    for (i = 0; i < coordinates.length; i++) {
        const temp = coordinates[i];
        const temparr = [], temparr1 = [];
        temparr[0] = temp[0] - 20;
        temparr[1] = temp[1];
        temparr1[0] = temp[0] + 30;
        temparr1[1] = temp[1] + 30;
        negativecoordinates.push(temparr);
        positivecoordinates.push(temparr1);
    }
    const obj1 = {
        asset_id: asset_id,
        positivecoordinates: positivecoordinates,
        negativecoordinates: negativecoordinates
    }
    georoute.insertMany(obj1);
    const boolflag = (pointInPolygon(arr1, positivecoordinates))
    const negativeboolflag = (pointInPolygon(arr1, negativecoordinates));
    if (boolflag === false && negativeboolflag === false) {
        res.send(false);
    } else {
        res.send(true);
    }
})

app.post("/api/assetlocation", (req, res) => {
    const asset_id = req.body.asset_id;
    const asset_unique_number = req.body.asset_unique_number;
    const asset_info = req.body.asset_info;
    const time_stamp = req.body.time_stamp;
    const latitude = req.body.latitude;
    const longitude = req.body.longitude;
    const asset_type_id_foreign_key = req.body.asset_type_id_foreign_key;
    const obj1 = {
        asset_id: asset_id,
        asset_info: asset_info,
        asset_unique_number: asset_unique_number,
        time_stamp: time_stamp,
        latitude: latitude,
        longitude: longitude,
        asset_type_id_foreign_key: asset_type_id_foreign_key
    }
    assets.insertMany(obj1);


    res.send("Asset location api called ");

});


app.listen(PORT, () => {
    console.log("Server is listening to port 8081");
});

module.exports = app;

