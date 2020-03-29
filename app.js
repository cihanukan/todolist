const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js")
const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"))
app.set('view engine','ejs');

mongoose.connect("mongodb+srv://admin-cihan:test123@cluster0-3qcyp.mongodb.net/todolistDB", {useNewUrlParser: true});

//Schema
const itemsSchema = new mongoose.Schema({
    name :{
        type: String,
        required: true
    }
});

//Model
const Item = mongoose.model("Item", itemsSchema);

//Documents
const buyFood = new Item({
    name:"Buy Food"
});
const cookFood = new Item({
    name:"Cook Food"
});
const eatFood = new Item({
    name:"Eat Food"
});

const defaultItems = [buyFood,cookFood, eatFood];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
})

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){

    Item.find({}, (err, foundItems)=>{
        if(foundItems.length === 0){
            Item.insertMany(defaultItems, (err)=>{
                if(err) console.log(err);
                else{
                    console.log("Items succesfully added to db");    
                }
            })
            res.redirect("/");
        }
        else{
            res.render("list", {
                listTitle : "Today",
                newListItems : foundItems
            });
        }
    })
});

app.get("/:customListName" ,(req, res)=>{

    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, (err, foundList)=>{
        if(!err){
            if(!foundList){
                //Create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
                list.save();
                res.redirect("/"+customListName);
            }else{
                //Show and existing lists

                res.render("list", {
                    listTitle: customListName,
                    newListItems: foundList.items
                })

            }

        }
    })

    
    
})

app.post("/", function(req,res){

    var item = req.body.newItem;
    var listName = req.body.button;

    const insertItem = new Item({
        name: item
    })

    //console.log(listName);

    if(listName === "Today"){
        insertItem.save();
        res.redirect("/");
    }
    else{    
        List.findOne({name: listName}, (err, foundList)=>{
            foundList.items.push(insertItem);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete", (req, res)=>{
    const deletedItemId = req.body.checkbox;
    const listName = req.body.listName;
    
    if(listName === "Today"){
        Item.findByIdAndRemove(deletedItemId, (err)=>{
            if(err){
                console.log(err);
            }else{
                console.log("Item succesfully deleted from list");
                res.redirect("/");
            }
        })
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: deletedItemId}}}, (err, foundList)=>{
            if(!err){
                res.redirect("/" + listName);
            }
        });
    }
})



app.get("/about", function(req, res){
    res.render("about");
});

app.post("/work", function(req, res){
    let item = req.body.newItem;
    workListItems.push(item);
    console.log(workListItems);
})

app.listen(3000, function(){
    console.log("Server started on port 3000");
})
