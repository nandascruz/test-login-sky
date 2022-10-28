const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const express = require('express');
const app = express();

//configuração json
app.use(express.json());

//modelos
const User = require('./modelos/user');


app.get('/', function(req, res){
    res.status(200).json({msg: 'LOGIN SKY API'})
});

//registro de usuario
app.post('/signup/register', function(req, res) {

    const {nome, email, senha, telefones} = req.body

    //validações
    if(!nome) {
        return res.status(422).json({msg: 'Preencha o campo NOME!'})
    }

    if(!email) {
        return res.status(422).json({msg: 'Preencha o campo EMAIL!'})
    }

    if(!senha) {
        return res.status(422).json({msg: 'Preencha o campo SENHA!'})
    }

    if(!telefones) {
        return res.status(422).json({msg: 'Preencha o campo TELEFONE!'})
    };

    //verificando se o email/user já existe
    const userExists = User.findOne({email: email})
    userExists 
    .then((data) => {
       console.log(data)

        if(data) {
            return res.status(422).json({msg: 'Email já existente!'})
        }

    //criando uma senha
const salt = bcrypt.genSalt(10)
const passwordHash = bcrypt.hash(senha, 10)
passwordHash
.then((data) => {
    console.log(data);

    //criando um usuario
     const user = new User({
        nome,
        email, 
        senha: data,
        telefones,
    })
    
    try {
        user.save()
        res.status(201).json({msg: 'Sign Up concluído! Usuário criado'})
    }
    
    catch(error){
        console.log(error)
    }

})

    })
});


// atualizando usuario 
app.patch('/update/:userid', function(req, res){

// pegar infos do body 
const {nome, email, senha, telefones} = req.body

//buscando a data do dia atual
const date = new Date();

    const dia = String(date.getDate());
    const mes = String(date.getMonth()); //janeiro = 0
    const ano = date.getFullYear();
    const dataDeHoje = new Date(ano, mes, dia);

// atualizando o usuario
    const user = {
        nome,
        email, 
        senha,
        telefones,
        data_atualizacao: dataDeHoje,
    };

    const userUpdated = User.findByIdAndUpdate({_id: req.params.userid}, user);
    userUpdated
.then((data) => {
    console.log(data);
})

    res.status(200).json(user);

});


//user login:
app.post('/login/user', async function(req, res) {

    const {email, senha} = req.body

    //validações

    if(!email) {
        return res.status(422).json({msg: 'Preencha o campo EMAIL!'})
    }

    if(!senha) {
        return res.status(422).json({msg: 'Preencha o campo SENHA!'})
    };

//verificando se o email/user já existe
    const userExists = await User.findOne({email: email})

        if(!userExists) {
            return res.status(404).json({msg: 'Email não encontrado!'})
        }

//verificando se a senha está correta
    const checkpassword = await bcrypt.compare(senha, userExists.senha);
    console.log(senha, userExists.senha)

    if(!checkpassword) {
        return res.status(404).json({msg: 'Senha incorreta.'}) 
    };

//criando o token
    try {

        const secret = "HASHPARASENHA123"
        const token = jwt.sign({
            id: userExists.id        },
        secret,
        );

        const date = new Date();
        const user = {
            ultimo_login: date,
        };
        const userUpdated = await User.findByIdAndUpdate({_id: userExists.id}, user);

        res.status(200).json({msg: "Login concluído", token})
    }

    catch(err) {
        console.log(err)

        res.status(500).json({
            msg:'Erro no servidor. Tente novamente mais tarde.'
        })
    }

});

//busca usuário
app.get('/search/:id', checkToken, async function (req, res) {

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    console.log("Token = ", token)

    const secret = "HASHPARASENHA123"
    const jwtUser = jwt.verify(token, secret)
    console.log(jwtUser);

    const id = req.params.id
    if (id == jwtUser.id){

        const searchUser = await User.findById({_id: id}, '-senha');

if(!searchUser) {
    return res.status(404).json({msg: 'Usuário não encontrado'})
}
    const ultimoLogin = searchUser.ultimo_login
    const date = new Date();
    
    ultimoLogin.setMinutes(ultimoLogin.getMinutes() + 30 );
    


    if(ultimoLogin > date) {
        res.status(200).json({searchUser})
    }
    else{
        res.status(401).json({msg: 'Sessão inválida'})
    }
    
    }
else{
    res.status(401).json({msg: 'Não autorizado!'})
}
});

function checkToken(req, res, next) { 
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
console.log(token)
    if(!token) {
        return res.status(401).json({msg: 'Não autorizado'})
    }

    try{
        const secret = "HASHPARASENHA123"

        jwt.verify(token, secret)

        next()

    } catch(error) {
        res.status(400).json({msg: "Não autorizado!"})
    }
};


//credenciais:
const dbUser = 'anandascruz'
const dbPassword = '20150719kzab'
    console.log(dbUser);
    console.log(dbPassword);

mongoose
.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.x3l1r0k.mongodb.net/?retryWrites=true&w=majority`)
.then(() => {
    app.listen(8082,function(){
        console.log("Servidor rodando na porta 8082!");
    });
    console.log("conectado ao banco")
})
.catch((err) => {
    console.log(err);

});


