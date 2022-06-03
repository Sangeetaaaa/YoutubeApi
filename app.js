//requiring modules
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const https = require("https")
const axios = require("axios")






//setting up the app
const app = express()
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));





// connecting to mongoose and creating a new dataabase

mongoose.connect("mongodb://localhost:27017/youtubeVideosDB", {useNewUrlParser: true})



// creating a schema for blogdb
const itemSchema = new mongoose.Schema ({
  title: String,
  description: String,
  thumbnails: {
    url: String
  },
  videoId: String,
  publishTime: String,
})
const Entry = new mongoose.model("Entry", itemSchema);








app.get("/", async function (req, res)  {

//   setTimeout(function(){
    
//  }, 5000);

    //fetch the youtube api
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search?key=AIzaSyDSSPc4FVOsQ0BVdN__LLBDGlKzfAi-Vnw&part=snippet&q=cricket&order=date&maxResults=30&publishedAfter=2022-01-01T00:00:00Z&type=video')
    let searchData = response.data.items

    let entries = []  // array for storing all the youtube video items details  

    for (let i=0; i<searchData.length;i++) {
      let snippet = searchData[i].snippet
      const obj = { title: snippet.title, description: snippet.description,
        thumbnails: { url: snippet.thumbnails.high.url },
        videoId: searchData[i].id.videoId, publishTime: snippet.publishTime }

      entries.push(obj)
    }


    Entry.deleteMany({}, (err) => {
      if(err) {console.log(err)} 
    })

    //add entries to the database
    Entry.create(entries, function(err, response) {
      if (!err) {
          res.redirect("/home/1")
       }
    })

})

// show the stored youtube videos 

app.get("/home/:pageno", (req, res) => {
  let currentPage = req.params.pageno
  let startingIndex = (currentPage - 1) * 5
  Entry.find((err, foundEntries) => {
    res.render("home", {foundEntries: foundEntries, startingIndex: startingIndex, previousPage: currentPage - 1, nextPage: parseInt(currentPage) + 1})
  });
})



//search api - To search the stored videos in the database 
app.post("/search", (req, res) => {
  let searchQuery = req.body.search
  
  //Find specific word match and render the founditems to search page 
  Entry.find({title : { '$regex' : new RegExp(searchQuery, "i") }}, (err, foundEntries) => {
    if (!err) {res.render("search", {foundEntries})}
    else {console.log(err)}
  })
})
  



  //setting a server, which is running the port 3000
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
  
app.listen(port, () => {
  console.log("Server started on port 3000");
})

