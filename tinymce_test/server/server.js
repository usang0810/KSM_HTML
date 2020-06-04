const express = require('express');
const ejs = require('ejs');
const nodemailer = require('nodemailer');
const router = express.Router();
const multer = require('multer'); // 서버에서 이미지를 저장하기 위한 모듈
const path = require('path'); // 확장자명을 알아내기위한 모듈

const app = express();
const PORT = 8000;

// nodejs post통신을 위한 다음 2줄 추가
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ejs 확장자를 가진 파일을 default template으로 지정
// .ejs의 확장자를 가진 파일은 확장자를 안붙여도됨
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.static(__dirname + "/"));


app.get('/', function (req, res) {
    res.render('index', {});
});

app.get('/tinyTest', function (req, res) {
    res.render('TinyMCE', {});
});

app.post('/tinyPost', function (req, res) {
    var textVal = req.body.mytextarea;
    console.log("===== input data =====");
    console.log(textVal);
    res.render("tinyResult", { textVal: textVal });
});

app.post('/tinyajax', function (req, res) {
    var result = req.body.data;
    res.send({ result: result });
});

app.get('/tinyTest2', function (req, res) {
    res.render('TinyMCE_test', {});
});

app.get('/tinyui', function (req, res) {
    res.render('TinyMCE_ui', {});
});

app.get('/tinyguide', function (req, res) {
    res.render('tinymce_guide', {});
});

app.get('/tinyMail', function (req, res) {
    res.render('mail_send', {});
});

app.get('/mailSuccess', function (req, res) {
    res.render('mailSuccess', {});
});

app.post('/nodeMail', function (req, res, next) {
    let email = req.body.email;
    let content = req.body.content;

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'jysrmb@gmail.com',  // gmail 계정 아이디를 입력
            pass: 'dbtkd316425!'          // gmail 계정의 비밀번호를 입력
        }
    });

    let mailOptions = {
        from: 'jysrmb@gmail.com',    // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
        to: email,                     // 수신 메일 주소
        subject: 'Email form SM Soft Lab',   // 제목
        html: content  // 내용
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.send("mail send fail");
        }
        else {
            console.log('Email sent: ' + info.response);
            res.redirect("/mailSuccess");
        }
    });

});

var storage = multer.diskStorage({
    destination : function(req, file, cb, res){
        cb(null, 'images/upload');
    },
    filename: function(req, file, cb, res){
        var name = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
        cb(null, name);

        return name;
    }
});

var upload = multer({
    storage: storage
});

app.post('/upload', upload.single('file'), function(req, res){
    res.json({
        "location": "images/upload/" + req.file.filename
    });
});

app.listen(PORT, () => {
    console.log('Server is running at:', PORT);
});