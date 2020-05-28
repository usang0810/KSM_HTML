const express = require('express');
const ejs = require('ejs');

const app = express();
const PORT = 8000;

// nodejs post통신을 위한 다음 2줄 추가
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// ejs 확장자를 가진 파일을 default template으로 지정
// .ejs의 확장자를 가진 파일은 확장자를 안붙여도됨
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.static(__dirname + "/"));


app.get('/', function(req, res){
    res.render('index', {});
});

app.get('/tinyTest', function(req, res){
    res.render('TinyMCE', {});
})

app.post('/tinyPost', function(req, res){
    var textVal = req.body.mytextarea;
    console.log(textVal);
    res.render("tinyResult", {textVal:textVal});
});

app.post('/tinyajax', function(req, res){
    var result = req.body.data;
    res.send({result:result});
});

app.get('/tinyTest2', function(req, res){
    res.render('TinyMCE_test', {});
});

app.get('/tinyui', function(req, res){
    res.render('TinyMCE_ui', {});
})

app.listen(PORT, () => {
    console.log('Server is running at:', PORT);
});