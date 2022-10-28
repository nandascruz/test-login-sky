const mongoose = require('mongoose');

const User = mongoose.model('User', {
    nome: String,
    email: String,
    senha: String,
    telefones: [{
    DDD: String, 
    telefone: String
    }],
   
    data_criacao: {type: Date, default: Date.now},
    data_atualizacao: {type: Date, default: Date.now},
    ultimo_login: {type: Date, default: Date.now},
});



module.exports = User


