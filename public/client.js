  var items = [];
  var itemsRaw = [];
var displayBooks=(data)=>{
  items=[];
   $.each(data, function(i, val) {
     itemsRaw.push(val);
      items.push('<li class="bookItem" id="' + i + '">' + val.title + ' - ' + val.commentcount + ' comments</li>');
      return ( i !== 14);
    });
    if (items.length > 14) {
      items.push('<p>...and '+ (data.length - 14)+' more!</p>');
    }
  $('#display').html('');
    $('<ul/>', {
      'class': 'listWrapper',
      html: items.join('')
      }).appendTo('#display');
}

var displayOneBook=(book)=>{
 book.commentcount=0;
  var mybooks=itemsRaw.concat([]);
  mybooks.push(book);
  itemsRaw=[];
  
  displayBooks(mybooks);
 
}


var refreshBooks=()=>{
  items=[];
  itemsRaw=[];
  $.getJSON('/api/books', function(data) {
    //var items = [];
    $('#display').html('');
    //clear bookdetails
    $('#detailTitle').html('');
    $('#detailComments').html('');
    displayBooks(data);
    
  });
}

var refreshComments=(id)=>{
  var comments = [];
  console.log('requesting id:',id)
    $.getJSON('/api/books/'+id, function(data) {
      
      $.each(data.comments, function(i, val) {
        comments.push('<li>' +val+ '</li>');
      });
      comments.push('<br><div id="newCommentForm"><input style="width:300px" type="text" class="form-control" id="commentToAdd" name="comment" placeholder="New Comment"></div>');
      comments.push('<br><button class="btn btn-info addComment" id="'+ data._id+'">Add Comment</button>');
      comments.push('<button class="btn btn-danger deleteBook" id="'+ data._id+'">Delete Book</button>');
      $('#detailComments').html(comments.join(''));
      //clear the comment textbox
      $('#comment').html('');
    });
}

$( document ).ready(function() {

  
  refreshBooks();
  
  
  $('#display').on('click','li.bookItem',function(event) {
    event.preventDefault();
    $("#detailTitle").html('<b>'+itemsRaw[this.id].title+'</b> (id: '+itemsRaw[this.id]._id+')');
     refreshComments(itemsRaw[this.id]._id);
  });
  
  $('#bookDetail').on('click','button.deleteBook',function(event) {
    event.preventDefault();
    $.ajax({
      url: '/api/books/'+this.id,
      type: 'delete',
      success: function(data) {
        //update list
        $('#detailComments').html('<p style="color: red;">'+data+'</p>');
        alert(data);
        refreshBooks();
      }
    });
  });  
  
  $('#bookDetail').on('click','button.addComment',function(event) {
    event.preventDefault();
    var newComment = $('#commentToAdd').val();
    var id=this.id;
    $.ajax({
      url: '/api/books/'+id,
      type: 'post',
      dataType: 'json',
      data: {comment:newComment},
      success: function(data) {
        refreshBooks();
      }
    });
  });
  
  $('#newBook').click(function(event) {
    event.preventDefault();
    
    $.ajax({
      url: '/api/books',
      type: 'POST',
      dataType: 'json',
      data: $('#newBookForm').serialize(),
      success: function(data) {
        //update list
        console.log(data)
        displayOneBook(data);
        $('#bookTitleToAdd').text='';
      },
      error: (xhr,status,err)=>{
        console.log(xhr.statusCode(),status,err)
      }
    });
  });
  
  $('#deleteAllBooks').click(function() {
    $.ajax({
      url: '/api/books',
      type: 'delete',
      dataType: 'json',
      data: $('#newBookForm').serialize(),
      success: function(data) {
        //update list
        refreshBooks();
      }
    });
  }); 
  
  
});