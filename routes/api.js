/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var mongo=require('../db');
var htmlencode=require('htmlencode');
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app,db) {
var library=mongo(db);
  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    library.getBooks((err,result)=>{
      res.send(result);
    })
    })
    
    .post(function (req, res){
      var title = htmlencode.htmlEncode(req.body.title);
     
    if(title==''){
      res.status(400).send('please provide a valid book title!');
      return;
    }
      //response will contain new book object including atleast _id and title
    if(title!=undefined){
    library.addBookTitle(title,(err,result)=>{
      res.send(result);
    })}else{
      res.status(400).send('please provide a valid book title!')
    }
    
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
    //delete all books
    library.deleteAll((err,result)=>{
      if(err){
        res.status(404).send('db error while deleting');
        return;
      }else {
        if(result.deletedCount>0){
          res.send('complete delete successful');  
        } else {
          res.status(404).send('nothing to delete');
        }
      }
      
      
    })
    
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
   
      //json res format: {"_id": bookid,"title": book_title, "comments": [comment,comment,...]}
     library.getBook(bookid,(err,result)=>{
      if(err==null && result==null){
        //not found
        res.status(404).send('no book exists');
        return;
      }
      res.send(result);
    })
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
    library.addComment(bookid,comment,(err,result)=>{
      if(err==null && result==null){
        //not found
        res.status(404).send('not found');
        return;
      }
      //if modifiedCount>=1 then return all books
      //console.log(result.modifiedCount);
      if(result.modifiedCount>=1){
        library.getBooks((err,docs)=>{
        res.send(docs);
        })
      }else{
        res.status(403).send('unable to add comment!');
      }
    })
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
    library.deleteBook(bookid,(err,result)=>{
      //console.log(result);
      if(result.deletedCount==1){
        res.status(200).send('delete successful');
      }else{
        res.status(404).send('not found!');
      }
    })
    });
  
      
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});
};
