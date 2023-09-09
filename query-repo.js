const cadastrarCipa = (ano, inscricaoini, inscricaofim, votacaoini, votacaofim, resultado) => {
    const query = `
    INSERT INTO cipaconfig VALUES (default, default, '${ano}', '${inscricaoini}','${inscricaofim}', 
    '${votacaoini}', '${votacaofim}', '${resultado}', default)`

    return query
}

const cadastrarCandidato = (chapa, cipaid, n_votacao, nome, funcao, secao, gestao) => {
    const query = `
    insert into inscritos values (default, '${chapa}', ${cipaid}, '${n_votacao}', '${nome}',
     default, '${funcao}', '${secao}', default, '', default, ${gestao});
    `
    return query
}

const maxNVotacao = () => {
    const query = `select right('1000' + max(n_votacao)+1, 3) as maxnvotacao from inscritos`

    return query
}

const funcionario = (chapa) => { // Dados do Funcionário
    const query = `
    select F.CHAPA, F.NOME, S.DESCRICAO AS SECAO, PF.NOME AS FUNCAO
    from PFUNC F
    inner join PSECAO S on S.CODCOLIGADA = F.CODCOLIGADA AND S.CODIGO = F.CODSECAO
    inner join PFUNCAO PF on PF.CODCOLIGADA = F.CODCOLIGADA AND PF.CODIGO = F.CODFUNCAO
    
    where F.CHAPA = '${chapa}'` 

    return query
}

const funcComColigada = (chapa) => {
    const query = `
    select F.CHAPA, F.NOME, S.DESCRICAO AS SECAO, PF.NOME AS FUNCAO, 
    GC.NOMEFANTASIA AS GCNOME, GC.RUA AS GCRUA, GC.NUMERO AS GCNUMERO, GC.BAIRRO AS GCBAIRRO, GC.CIDADE AS GCCIDADE,
    GC.ESTADO AS GCESTADO, GC.CGC AS GCCGC, GC.TELEFONE AS GCTELEFONE
    
    from PFUNC F
    inner join GCOLIGADA GC on GC.CODCOLIGADA = F.CODCOLIGADA
    inner join PSECAO S on S.CODCOLIGADA = F.CODCOLIGADA AND S.CODIGO = F.CODSECAO
    inner join PFUNCAO PF on PF.CODCOLIGADA = F.CODCOLIGADA AND PF.CODIGO = F.CODFUNCAO
    
    where F.CODCOLIGADA = 1 AND F.CHAPA = '${chapa}'`
    return query
}

const deleteCipa = (cipaid) => {
    const query = `DELETE FROM cipaconfig WHERE id = '${cipaid}' `

    return query
}

const deleteInscritos = (cipaid) => {
    const query = `DELETE FROM inscritos WHERE cipaid = '${cipaid}'`

    return query
}


module.exports = {
    cadastrarCipa,
    cadastrarCandidato,
    funcionario,
    funcComColigada,
    deleteCipa,
    deleteInscritos,
    maxNVotacao
}