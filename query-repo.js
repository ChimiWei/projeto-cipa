const cadastrarCipa = (codfilial, filial, ano, inscricaoini, fiminscricao, inivotacao, fimvotacao, resultado) => {
    const sql = `
    INSERT INTO cipaconfig VALUES (1, ?, default, ?, default, ?, ?, ?, ?, ?, ?, default)`

    const params = [codfilial, filial, ano, inscricaoini, fiminscricao, inivotacao, fimvotacao, resultado]

    return [sql, params]
}

const cadastrarCandidato = (cipaid, chapa, n_votacao, nome, funcao, secao, gestao) => {
    const sql = `
    insert into inscritos values (?, ?, ?, default, ?, default, ?, ?, default, '', default, ?);
    `
    const params = [cipaid, chapa, n_votacao, nome, funcao, secao, gestao]
    return { sql, params }
}

const addVoto = (votos_r, cipaid, chapa, n_votacao) => {
    const sql =
        'update inscritos set votos_r = ? where cipaid = ? and chapa = ? and n_votacao = ?;'

    const params = [++votos_r, cipaid, chapa, n_votacao]
    return 
}

const checarVoto = (cipaid, chapa) => {
    const sql =
        'select chapa from pfvoto where cipaid = ? and chapa = ?;'

    const params = [cipaid, chapa]
    return [sql, params]

}

const registrarVoto = (cipaid, chapa) => {
    const sql = 'insert into pfvoto values (?, ?, default)'
    const params = [cipaid, chapa]

    return [sql, params]
}

const maxNVotacao = () => {
    const query = `select right('1000' + max(n_votacao)+1, 3) as maxnvotacao from inscritos`

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

const deleteVoto = (cipaid) => {
    const query = `DELETE FROM votos WHERE cipaid = '${cipaid}'`

    return query
}

// ------------- MSSQL -------------- //

/*const funcionario = (chapa) => { // Dados do Funcionário
    const query = `
    select F.CHAPA, F.NOME, S.DESCRICAO AS SECAO, PF.NOME AS FUNCAO
    from PFUNC F
    inner join PSECAO S on S.CODCOLIGADA = F.CODCOLIGADA AND S.CODIGO = F.CODSECAO
    inner join PFUNCAO PF on PF.CODCOLIGADA = F.CODCOLIGADA AND PF.CODIGO = F.CODFUNCAO
    
    where F.CHAPA = '${chapa}'` 

    return query
}
*/
const funcionario = (codfilial, chapa) => { // Dados do Funcionário
    const sql = `
    select F.CHAPA, F.NOME, S.DESCRICAO AS SECAO, PF.NOME AS FUNCAO
    from PFUNC F
    inner join PSECAO S on S.CODCOLIGADA = F.CODCOLIGADA AND S.CODIGO = F.CODSECAO
    inner join PFUNCAO PF on PF.CODCOLIGADA = F.CODCOLIGADA AND PF.CODIGO = F.CODFUNCAO
    
    where F.CODFILIAL = @codfilial AND F.CHAPA = @chapa`
    const params = [
        {
            name: 'chapa',
            type: 'varchar',
            value: chapa
        },
        {
            name: 'codfilial',
            type: 'int',
            value: codfilial
        }
    ]
    return { sql, params }
}

const funcComCpf = (chapa) => { // Dados do Funcionário
    const sql = `
    select F.CHAPA, F.NOME, right(P.CPF, 3) as CONFIRMACAO
    from PFUNC F
    inner join PPESSOA P on P.CODIGO = F.CODPESSOA
    
    where F.CHAPA = @chapa`
    const params = [
        {
            name: 'chapa',
            type: 'varchar',
            value: chapa
        }
    ]
    return { sql, params }
}

const funcComColigada = (chapa) => {
    const sql = `
    select F.CHAPA, F.NOME, S.DESCRICAO AS SECAO, PF.NOME AS FUNCAO, 
    GC.NOMEFANTASIA AS GCNOME, GC.RUA AS GCRUA, GC.NUMERO AS GCNUMERO, GC.BAIRRO AS GCBAIRRO, GC.CIDADE AS GCCIDADE,
    GC.ESTADO AS GCESTADO, GC.CGC AS GCCGC, GC.TELEFONE AS GCTELEFONE
    
    from PFUNC F
    inner join GCOLIGADA GC on GC.CODCOLIGADA = F.CODCOLIGADA
    inner join PSECAO S on S.CODCOLIGADA = F.CODCOLIGADA AND S.CODIGO = F.CODSECAO
    inner join PFUNCAO PF on PF.CODCOLIGADA = F.CODCOLIGADA AND PF.CODIGO = F.CODFUNCAO
    
    where F.CODCOLIGADA = 1 AND F.CHAPA = @chapa`

    const params = [
        {
            name: 'chapa',
            type: 'varchar',
            value: chapa
        }
    ]
    return { sql, params }
}


module.exports = {
    mysql: {
        cadastrarCipa,
        cadastrarCandidato,
        addVoto,
        registrarVoto,
        checarVoto,
        maxNVotacao,
        deleteCipa,
        deleteInscritos,
        deleteVoto
    },
    mssql: {
        funcionario,
        funcComCpf,
        funcComColigada,
    }
}