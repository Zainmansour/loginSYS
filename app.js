//////////////
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const User = require('./model/user');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { header } = require('express/lib/request');
require('dotenv').config();
/////////////
app.use(bodyParser.json());
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static("public"));
/////////////
let dburl = process.env.DB;
mongoose.connect(dburl).then(ress => console.log('connected')).catch(err => console.log(err));
/////////////

//////////////////   clear DB

// User.deleteMany({},()=>console.log('done'))

//////////////////
app.get('/', (req, res) => {
    res.redirect('/reg');
})
app.get('/reg', (req, res) => {
    res.render('reg');
})

app.get('/login', (req, res) => {
    res.render('login');
})
app.post('/login', async (req, res) => {
    let email = req.body.email;
    let password = req.body.password
    let user = await User.findOne({ $or: [{ email: email }, { username: email }] });
    if (!user) {
        res.status(404).json({ status: 'error', msg: 'user not found' });
    }
    else{
        let ok=await bcrypt.compare(password,user.password);
        if(ok){
            res.status(200).json({status:'success',msg:'Logged in'});
        }
        else {
            res.status(401).json({ status: 'error', msg: "password isn't correct" });
        }
    }
})
app.post('/reg', async (req, res) => {
    let pass = req.body.password;
    let ha = await bcrypt.hash(pass, 12);
    let user = new User({
        first_name: req.body.Fname,
        last_name: req.body.Lname,
        username: req.body.username,
        email: req.body.email,
        password: ha,
    });
    user.save().then((resa) => {
        res.json({
            'status': 'success',
            'msg': 'ok'
        });
    }).catch(err => {
        let erno;
        let msg = err.message.toString();
        if (msg.includes('duplicate key error') && msg.includes('username')) {
            erno = 'username already used';
        }
        else if (msg.includes('duplicate key error') && msg.includes('email:')) {
            erno = 'email already used'

        }
        else erno = 'error'

        res.status(400).json({ 'status': 'error', 'msg': erno });
    });
})
/////////////
app.listen(port, () => { console.log(`hello from ${port}`) });