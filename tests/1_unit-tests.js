var chai = require('chai');
var assert = chai.assert;
var mongoClient=require('mongodb');
var dbHandler=require('../db.js');
var mongo;
var insertedIds=[];
suite('Unit Tests', function(){
  setup('Unit tests -Starting DB connection',(done)=>{
  console.log('setting up the connection!')
  mongoClient.connect(process.env.DB,{ useNewUrlParser: true },(err,client)=>{
    mongo=dbHandler(client.db('test'));
    done();
  })
});
  
  test('addBook',(done)=>{
    mongo.addBookTitle('welcome',(err,result)=>{
      //console.log('------------------------------',result)
      assert.isNull(err);
      assert.exists(result._id,'missing _id')
      assert.equal(result.title,'welcome','incorrect title');
      insertedIds.push(result._id);
      //console.log(insertedIds);
      done();
    });
    
  })
  
  test('getBooks',(done)=>{
    mongo.getBooks((err,result)=>{
      assert.isArray(result)
      done();
    })
  })
  test('addComment',(done)=>{
   // console.log(insertedIds)
    let id=insertedIds[0];
    mongo.addComment(id,'test comment',(err,result)=>{
     // console.log(result);
      assert.exists(result.modifiedCount)
      done();
    })
    
    
  });
  
  test('getBook',(done)=>{
    this.timeout(8000)
    let id=insertedIds[0];
    mongo.getBook(id,(err,result)=>{
     // console.log (result);
      assert.exists(result._id);
      assert.equal(result.title,'welcome','incorrect data');
      assert.isArray(result.comments);
      done();
    })
  })
  
  test('deleteBook',(done)=>{
    this.timeout(8000);
    let id=insertedIds[0];
    mongo.deleteBook(id,(err,result)=>{
      //console.log(result);
      assert.exists(result.deletedCount);
      assert.equal(result.deletedCount,1,'incorrect deleted count');
      done();
    })
  });
    test('deleteAll',(done)=>{
    this.timeout(8000);
    mongo.addBookTitle('welcome to English',(err,result)=>{
    mongo.deleteAll((err,result)=>{
      //console.log(result);
      assert.exists(result.deletedCount);
      assert.isAbove(result.deletedCount,0,'incorrect deleted count');
      done();
    })  
    })
    
  });
  //No unit tests needed for this project

});