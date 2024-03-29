var express = require('express')
var mysql = require('mysql')
var member = express.Router()


const jwt = require('jsonwebtoken');



var conn = mysql.createConnection({
    host:'goodcare.cp8ms84moy7l.ap-northeast-1.rds.amazonaws.com',
    user:'admin',
    password:'iii23265860',
    database:'Goodcare'

})

member.get('/',function(req,res){
    conn.query('select * from member',[],function(err,result){
        res.send(result)
        
    })
})

member.post('/register',function(req,res){
    const { name , birthday, gender, email, address, tel, account , pwd} = req.body
    // console.log(req.body)
    const sql = 'insert into member (name , birthday, gender, email, address, tel, account , pwd) values (?,?,?,?,?,?,?,?)';
    conn.query(sql,[name , birthday, gender, email, address, tel, account , pwd],function(err,result){
        if (err) {
            console.error(err);
            res.send('Error inserting data into database');
            return;
        }
    })
    res.send('ok')
})



member.get('/login',authenticateToken,(req,res) => {
    // console.log(req.user.name)
    
    conn.query('select * from member',[],function(err,result){
        if(err){
            console.error(err)
        }
        res.json(result.filter(p => p.account === req.user.name))
        
    })
})


member.post('/login',(req,res) => {
    const account = req.body.account
    const pwd = req.body.pwd
    conn.query(
        'select * from member where account= ? and pwd = ?',[account,pwd],function(err,result){
            if(result.length===0){

                res.send('account or paasword no correct')
                console.log( result)
                return
            }
            else{
                const user = {name:account}
                const accessToken = generateAccessToken(user)
                // jwt.sign(user,process.env.ACCESS_TOKEN_SECRET)
                const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
                res.json({result:result,accessToken:accessToken , refreshToken:refreshToken})
                console.log(user)
                
            }
        }
    )
    
})
function authenticateToken(req,res,next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err,user) => {
        if(err) return res.sendStatus(403)
        req.user = user
        // console.log(user)
        next()
    })
}

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn: '7200s'})
}

member.post('/modify',function(req,res){
    const {account,removePwd ,tel , address} = req.body
    const pwd = removePwd
    // console.log(account,pwd)
    conn.query('update member set pwd = ? , tel = ? , address = ? where account = ?',[pwd,tel,address,account]
    ,function(err,result){
        if (err) {
            console.log('update err');
            // res.send('Error inserting data into database');
            return;
        }
        else{
            console.log(result)
            console.log('member update')
            res.send('member update')
        }
    })
})

member.post('/forget',function(req,res){
    const {account, email} = req.body
    // console.log(req.body)
    conn.query('select * from member where account = ? and email = ?',[account,email],function(err,result){
        if(result.length===0){

            res.send('account or email no correct')
            // console.log( result)
            return
        }
        else{
            res.send('forget ok')
        }
    })

})

member.post('/reforget',function(req,res){
    
    const {account,email,pwd} = req.body
    conn.query('update member set pwd =? where account = ? and email = ?', [pwd,account,email], function(err,result){
        if(err){
            res.send('restart err')
        }
        res.send('restart ok')
        console.log(result)
    })
})














// member.post('/login', function(req,res){
//     const{account,pwd} = req.body
//     console.log(req.body)
//     const sql = 'SELECT * from member WHERE account = ? AND pwd = ?';
//     conn.query(sql,[account,pwd],function(err,result){
//         console.log(result)
//         if (err) {
//             res.status(500).json({ status: "登入失败", err: "服務器錯誤 請稍後在試！" });
//             return;
//         }
//         else if (result.length === 0) {
//             res.status(401).json({ status: "登入失败", err: "帳號或密碼錯誤" });
//             return;
//         }
//         else{
//             // const accesstoke = 
//             const token = user.generateAuthToken()
//             res.status(200).json({ status: "登入成功" })
//         };
        
//     })
//     // res.send('登入成功')
// })



module.exports = member;
