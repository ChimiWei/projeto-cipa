const formatDateBelowTen = require('../helpers/formatDateBelowTen')
const ano = new Date().getFullYear()
const dia = new Date().getDate()
const mes = new Date().getMonth() + 1

const hoje = formatDateBelowTen(dia) + '/' + formatDateBelowTen(mes) + '/' + ano

const gestao = ano + '/' + (ano + 1)


module.exports =  {
    ano,
    dia,
    mes,
    hoje,
    gestao
}