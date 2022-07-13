let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let mysql = require('mysql');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.get('/',(req,res)=>{
    return res.send({
        error:false, 
        message:'Main'
    })
})

//Connect to MySQL
let dbCon = mysql.createConnection({
    host: 'localhost',
    user:'root',
    password:'root',
    database:'bookstore'
})

dbCon.connect();

//Object Book Format
function receivedFormat(books) {
    let temp_books = []

    books.forEach((element) => {
        temp_books.push({
                        "name":element.title,
                        "genre":element.genre,
                        "author":{
                            "name":element.author_name,
                            "gender":element.author_gender
                        }
                    })
    });
    return temp_books;   
}

//GET ALL BOOKS
app.get('/getAllBooks',(req,res)=>{
    dbCon.query('SELECT * FROM books',(error,results)=>{
        if(error) throw error;

        let message = ""

        if(results === undefined || results.length == 0){
            message = "There is no book.";
        }else{
            message = "Success"
        }

        return res.send({result:receivedFormat(results), message});

    })
})

//GET BOOK
app.get('/getBook/:id',(req,res)=>{
    let id = req.params.id;
    if(!id){
        return res.status(400).send({error: true, message:"Fill all required field"})
    } else {
        dbCon.query('SELECT * FROM books where id=?',id,(error,results)=>{
            if(error) throw error;
    
            let message = ""
    
            if(results === undefined || results.length == 0){
                message = "This book is not existed.";
            }else{
                message = "Success"
            }
    
            return res.send({result:receivedFormat(results), message});
    
        })
    }
})

//ADD BOOK
app.post('/addBook',(req,res)=>{
    let title = req.body.title;
    let genre = req.body.genre;
    let author_name = req.body.author_name;
    let author_gender = req.body.author_gender;
    if(!title || !author_name || !genre || !author_gender){
        return res.status(400).send({error: true, message:"Fill all required fields"})
    } else {
        dbCon.query('INSERT INTO books (title,genre,author_name,author_gender) VALUES(?,?,?,?)',[title,genre,author_name,author_gender],(error,results)=>{
            if(error) throw error;
            return res.send({result:results,message:"Book Added"})
        })
    }
})

//GET BOOK
app.get('/deleteBook/:id',(req,res)=>{
    let id = req.params.id;
    if(!id){
        return res.status(400).send({error: true, message:"Fill all required field"})
    } else {
        dbCon.query('DELETE FROM books WHERE id=?;',id,(error,results)=>{
            if(error) throw error;
    
            let message = ""
            
            //Check if there is row that has been affected by delete query
            if(results.affectedRows === 0){
                message = "Book is not existed";
            }else{
                message = "Delete Completed"
            }
    
            return res.send({result:results, message});
    
        })
    }
})

//UPDATE BOOK BY BOOK ID
app.put('/updateBook',(req,res)=>{
    let id = req.body.id;
    let title = req.body.title;
    let genre = req.body.genre;
    let author_name = req.body.author_name;
    let author_gender = req.body.author_gender;
    if(!title || !author_name || !genre || !author_gender){

        return res.status(400).send({message:"Fill all required fields"})

    } else {
        
        dbCon.query('UPDATE books SET title = ?, author_name = ?, genre = ?,author_gender = ? WHERE id = ?;',[title,author_name,genre,author_gender,id],(error,results)=>{
            
            if(error) throw error;
            let message = "";

            //Check if there is row that has been changed
            if(results.changedRows === 0){
                message = "Book is not founded or already updated"
            }
            else{
                message = "Book has been updated."
            }
            return res.send({result:results,message:message})
        })

    }
})

app.listen(3000,()=>{
    console.log('Node App is running on port 3000')
})

module.exports =app;