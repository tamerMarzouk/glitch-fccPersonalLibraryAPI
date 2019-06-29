
var objectId=require('mongodb').ObjectId;
var htmlencode=require('htmlencode');

function dbHandler(db){
  
  this.addBookTitle=(title,done)=>{
  db.collection('Library').insertOne({title:htmlencode.htmlEncode(title),comments:[]},(err,result)=>{
    //retrive object from result
    let obj=result.insertedCount==1?result.ops[0]:{};
    done(err,obj);
  })
};
  //add comment to a book given it's DB id
  // callback done will be called at the end 
  this.addComment=(id,comment,done)=>{
     try{
    var _id=new objectId(id);
    }catch(ex){
      done(null,null);
      return;
    }
    let filteredComment=htmlencode.htmlEncode(comment);
    db.collection('Library').updateOne({_id:_id},{$push:{comments:filteredComment}},(err,result)=>{
    done(err,result);
    })
  };
  
  // returns title,_id, and commentcount for all books
  this.getBooks=(done)=>{
    db.collection('Library').aggregate([{$project:{'_id':1,'title':1,commentcount:{$size:"$comments"}}}],(err,result)=>{
      result.toArray().then(docs=>{
        done(null,docs)
      })
    
    })
  };
  
  this.getBook=(id,done)=>{
    try{
    var _id=new objectId(id);
    }catch(ex){
      done(null,null);
      return;
    }
    db.collection('Library').findOne({_id:_id},(err,result)=>{
      done(err,result)
    })
  };
  
  this.deleteBook=(id,done)=>{
      try{
    var _id=new objectId(id);
    }catch(ex){
      done(null,null);
      return;
    }
    db.collection('Library').deleteOne({_id:_id},(err,result)=>{
      done(err,result);
    });
  }
  
  this.deleteAll=(done=>{
    db.collection('Library').deleteMany({},(err,result)=>{
      done(err,result);
    })
    
  })
  return this;
}


module.exports=dbHandler;