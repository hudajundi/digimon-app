'use strict';

require('dotenv').config();
const express = require('express');
const pg = require('pg');
const ejs = require('ejs');
const methodOverride =require('method-override');
const superagent = require('superagent'); 
const client = new pg.Client();

const app = express();

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');


///////////-----The routs & functions-------:
////the routs:
app.get('/home', mainFunction);
app.post('/favorite', addToFav);
app.get('/favorite', showFav);
app.get('/details/:id', showDetail);
app.put('/details/:id', showUpdate);
app.delete('/details/:id', showDelete);


////the function

function mainFunction(res,req){
    let array=[];
    let url='https://digimon-api.herokuapp.com/api/digimon';
    superagent(url).then(val=>{
        val.body.forEach(val=>{
           return array.push(new Digimon(val)).then(()=>{
               res.render('home-page', ({result: array})) 
            })
        })

    })
}

//////the constructor:
function Digimon(value){
    this.name= value.name;
    this.image = value.image;
    this.level= value.level;
} 

function addToFav(req,res){
    let SQL= 'INSERT INTO theDig (name,image,value) VALUES ($1,$2,$3);';
    let value = [req.body.name, req.body.image,req.body.value];
    client.query(SQL,value).then(()=>{
        res.redirect('/favorite');
    })
}

function showFav(req,res){
    let SQL = 'SELECT * FROM theDig;';
    client.query(SQL).then(val=>{
        res.render('fav-page', ({result:val.rows}))
    })
}


function showDetail(req,res){
    let SQL= 'SELECT * FROM theDig WHERE id=$1;';
    let value= [req.params.id];

    client.query(SQL,value).then(val=>{
        res.render('detail-page', ({result: val.rows}));
    })
    
}


function showUpdate(req,res){
    let SQL= 'UPDATE theDig SET name=$1,image=$2,level=$3 WHERE id=$4;';
    let value= [req.body.name, req.body.image, req.body.level, req.params.id];

    client.query(SQL, value).then(()=>{
        res.redirect('/favorite');
    })
}

function showDelete(req,res){
    let SQl ='DELETE FROM theDig WHERE id=$1;';
    let value= [req.params.id];

    client.query(SQL, value).then(()=>{
        res.redirect('/favorite')
    })
}







/// to listen:
client.connect().then(()=>{
app.listen(PORT , ()=> console.log( ' listening to ', PORT))
}).catch(error => console.log('wrong, an error..', error));
