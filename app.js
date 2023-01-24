const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser")
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const ejs = require("ejs");
const multer = require("multer");

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("images"));  
app.set('view engine', 'ejs');

const storage = multer.diskStorage(
    {
    destination: function(req, file, cb) {
        cb(null, './images');
    },

    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

var upload = multer({storage: storage});

function isAuthenticated (req, res, next) {
    if (req.session.user) next()
    else next('route')
  }

//session 
app.use(sessions({
    secret: 'secret',
    saveUninitialized:true,
    resave: false
}));    

app.get('/', isAuthenticated, (req, res)=>{
    res.render('profile');
    console.log("seassion works");
    console.log(req.session.user.image);

});

app.get('/', (req, res)=>{
    res.render('register');

});

app.get('/register', (req, res)=>{
    res.render('register');
})


//register redirects to posted that posts the data to the database, then it redirects to login.
app.post('/posted', upload.single('file'), (req, res)=>{
    const birthday= req.body.birthday;
    const pass = req.body.password;
    const passcon = req.body.confirmPassword;

    if(pass === passcon)
    {

        async function main() {
            const hashedPass1 = await bcrypt.hash(pass, 10);

            //creates a user using prisma create method
            const createuser = await prisma.user.create({
                data: {

                        name:req.body.fullName,
                        username:req.body.userName,
                        birthday: new Date(birthday),
                        password: hashedPass1,
                        image:req.file.filename,
                        time: new Date()

                    },
            });
        }
        main()
        .then(async () => {
            await prisma.$disconnect()
        })
        .catch(async (e) => {
            console.error(e)
            await prisma.$disconnect()
            process.exit(1)
        })
        res.render('login'); 
    }
    else
    {
        res.render('register'); 

    }

})


app.get('/login', (req, res)=>{
    res.render('login');

});


app.post('/send', (req, res) =>{

    const userN = req.body.userName
    const pass = req.body.password;

    async function main() {
        req.session.regenerate(async(err)=>{
            const findUser = await prisma.user.findUnique({
                where:{
                    username: userN,
                    }
    
            });
            const tempPassword = findUser.password;
            const bild = findUser.image
            const valid =await bcrypt.compare(req.body.password,tempPassword)
    
            if(valid === true )
                {
                    req.session.user = findUser;
                    req.session.image = findUser.image;
                    req.session.save(function(err){
                        if(err) return next(err)
                        res.render('profile',
                        {
                            bild: bild
                        });
                    })
                }
                    else{
                        console.log("wrong password");
                    }
            console.log(findUser);
        })

    }

    main()
})
app.get('/delete', function(req, res) {
    res.render('delete');
})
app.post('/deleted', (req, res) =>{

    const userN = req.body.userName
    const pass = req.body.password;

    async function main() {
        req.session.regenerate(async(err)=>{
            const findUser = await prisma.user.findUnique({
                where:{
                    username: userN,
                    }
    
            });
            const tempPassword = findUser.password;
            const valid =await bcrypt.compare(req.body.password,tempPassword)
    
            if(valid === true )
                {
                        if(err) return next(err)
                        const deleteuser = await prisma.User.delete(
                        {
                            where:
                            {
                                username:req.body.userName,
                            },
                        })
                        req.session.destroy();
                        res.render("login");
                }
                    else{
                        console.log("wrong password");
                    }
            console.log(findUser);
        })
    }
    main()
})
app.get('/update', function(req, res)
{
    res.render('update');
})

app.post('/updated', (req, res) =>{
    const userN = req.body.userName
    const newPass = req.body.newpassword
    console.log(newPass);

    async function main() {
        req.session.regenerate(async(err)=>{
            const findUser = await prisma.user.findUnique({
                where:{
                    username: userN,
                    }
    
            });
            const tempPassword = findUser.password;
            const valid =await bcrypt.compare(req.body.password,tempPassword)
    
            if(valid === true )
                {
                        if(err) return next(err)
                        const updatepassword = await prisma.user.update(
                        {
                            where:
                            {
                                username:userN,
                            },
                            data: 
                            {
                                password: await bcrypt.hash(newPass, 10),
                            },

                        })
                        req.session.destroy();
                        res.render("login");
                }
                    else
                    {
                        console.log("wrong password");
                    }
            console.log(findUser);
                }

        )
        }
        main()
    });

app.listen(2500);