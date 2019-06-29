/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
var insertedIds=[];
chai.use(chaiHttp);

suite('Functional Tests', function() {

  test(' add a book title POST /api/books', (done)=>{
    this.timeout(2000);
    let title='Book title';
    chai.request(server)
    .post('/api/books')
    .send({title:title})
    .end((err,res)=>{
      assert.equal(res.status,200,'HTTP Status should be 200!');
      assert.equal(res.body.title,title,'incorrect book title');
      assert.isArray(res.body.comments)
      insertedIds.push(res.body._id);
      done();
    })
  })
  
  test(' XSS add a book title POST /api/books', (done)=>{
    this.timeout(2000);
    let title='<script>alert(1)</script>';
    chai.request(server)
    .post('/api/books')
    .send({title:title})
    .end((err,res)=>{
      assert.equal(res.status,200,'HTTP Status should be 200!');
      assert.equal(res.body.title,'&lt;script&gt;alert(1)&lt;/script&gt;','Possible XSS');
      assert.isArray(res.body.comments)
      insertedIds.push(res.body._id);
      done();
    })
  });
  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  
  test('GET /api/books/:_id', (done)=>{
    this.timeout(3000)
    let id=insertedIds[0];
    chai.request(server)
    .get('/api/books/'+id)
    .end((err,res)=>{
      assert.equal(res.status,200);
      assert.equal(res.body._id,id,'incorrect data received');
      done();
    })
  });
  
  test('missing book GET /api/books/anything',(done)=>{
    this.timeout(3000);
    chai.request(server)
    .get('/api/books/anything')
    .end((err,res)=>{
      assert.equal(res.status,404);
      assert.equal(res.text,'no book exists');
      done();
    })
  })

  test('Post comment to book POST /api/books/:id',(done)=>{
    this.timeout(3000);
    let _id=insertedIds[0];
    chai.request(server)
    .post('/api/books/'+_id)
    .send({comment:'this comment'})
    .end((err,res)=>{
      assert.equal(res.status,200);
      assert.isArray(res.body);
     
      done();
    })
  })
  
  test('Post comment to book and confirm data POST /api/books/:id',(done)=>{
    this.timeout(3000);
    let _id=insertedIds[0];
    let comment='testing comment 93,'
    chai.request(server)
    .post('/api/books/'+_id)
    .send({comment:comment})
    .end((err,res)=>{
      assert.equal(res.status,200);
      assert.isArray(res.body);
      //now read the comment and make sure it's the same
      chai.request(server)
        .get('/api/books/'+_id)
        .end((err,res)=>{
        assert.equal(res.status,200)
        assert.include(res.body.comments,comment);
         done();
      })
     
     
    })
  })
  
  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
         .post('/api/books')
        .send({title:'Routing Test'})
        .end((err,res)=>{
          assert.equal(res.status,200);
          done();
        });
       
      });
      
      test('Test POST /api/books with no title given', function(done) {
       chai.request(server)
         .post('/api/books')
        .send({})
        .end((err,res)=>{
          assert.equal(res.status,400);
          done();
        });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
         .get('/api/books')
        .end((err,res)=>{
          assert.equal(res.status,200);
          assert.isArray(res.body)
          done();
        });
      });
      
    
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        
          chai.request(server)
         .get('/api/books/5d172843a84fc012280eb8c6')
        .end((err,res)=>{
          assert.equal(res.status,404);
          assert.equal(res.text,'no book exists');
          done();
        });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        let _id=insertedIds[0];
          chai.request(server)
         .get('/api/books/'+_id)
        .end((err,res)=>{
          assert.equal(res.status,200);
          assert.isArray(res.body.comments);
          done();
        });
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        let _id=insertedIds[0];
    let comment='Testing comment Xyz,'
    chai.request(server)
    .post('/api/books/'+_id)
    .send({comment:comment})
    .end((err,res)=>{
      assert.equal(res.status,200);
      assert.isArray(res.body);
      //now read the comment and make sure it's the same
      chai.request(server)
        .get('/api/books/'+_id)
        .end((err,res)=>{
        assert.equal(res.status,200)
        assert.include(res.body.comments,comment);
         done();
      })
     
     
    })
      });
      
    });

  });

  suite('Delete API /api/books' , ()=>{
    test('Delete book given valid id',done=>{
      this.timeout(3000);
      let _id=insertedIds[0];
      chai.request(server)
        .delete('/api/books/'+_id)
        .end((err,res)=>{
        assert.equal(res.status,200)
        assert.equal(res.text,'delete successful');
        done();
      })
    });
    
     test('Delete book given non valid id',done=>{
      this.timeout(3000);
      let _id=insertedIds[0];
      chai.request(server)
        .delete('/api/books/'+_id)
        .end((err,res)=>{
        assert.equal(res.status,404)
        assert.equal(res.text,'not found!');
        done();
      })
    })
    
    //delete all books
     test('Delete all books',done=>{
      this.timeout(3000);
      
      chai.request(server)
        .delete('/api/books')
        .end((err,res)=>{
        assert.equal(res.status,200)
        assert.equal(res.text,'complete delete successful');
        done();
      })
    })
    
  })

});