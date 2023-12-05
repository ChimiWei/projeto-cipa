const candidatos = (cipaid) => {
    const sql = `
    select I.n_votacao, I.chapa, I.nome, I.funcao, I.secao, V.total as votos
    from inscritos I
    inner join votos V on V.cipaid = I.cipaid and V.voto = I.n_votacao
    where I.cipaid = ?`

    const params = [cipaid]

    return [sql, params]
}

const getVotos = (cipaid) => {
    const sql = `
    select voto, total
    from votos
    where cipaid = ? and voto = ("BRA" AND "NUL")`

    const params = [cipaid]

    return [sql, params]
}

const getFuncComVoto = (cipaid) => {
    const sql = `
    select chapa, nome, setor, date_format(data_voto, "%d/%m/%y") as data_voto, hora_voto from pfvoto where cipaid = ?
    `

    const params = [cipaid]

    return [sql, params]
}


const cadastrarCipa = (codcoligada, codfilial, filial, ano, inscricaoini, fiminscricao, inivotacao, fimvotacao, resultado) => {
    const sql = `
    INSERT INTO cipaconfig VALUES (default, ?, ?, ?, default, ?, ?, ?, ?, ?, ?, default)`

    const params = [codcoligada, codfilial, filial, ano, inscricaoini, fiminscricao, inivotacao, fimvotacao, resultado]

    return [sql, params]
}

function editCipa(dtinivoto, cipaid) {
    const sql = `
    UPDATE cipaconfig SET dtfimvoto = ? WHERE id = ?`

    const params = [dtinivoto, cipaid]

    return [sql, params]
}

function suspendCipa(cipaid){
    const sql = `
    UPDATE cipaconfig SET ativa = 0 WHERE id = ?`

    const params = [cipaid]

    return [sql, params]
}

const cadastrarCandidato = (cipaid, n_votacao, codcoligada, codfilial, chapa, nome, funcao, secao, gestao) => {
    const sql = `
    insert into inscritos values (?, ?, ?, ?, ?, ?, default, ?, ?, default, '', default, ?);
    `
    const params = [cipaid, n_votacao, codcoligada, codfilial, chapa, nome, funcao, secao, gestao]
    return [sql, params]
}

const cadastrarVoto = (cipaid, n_votacao) => {
    const sql = `
    insert into votos values (?, ?,  default);
    `
    const params = [cipaid, n_votacao]
    return [sql, params]
}

const addToken = (cipaid, codcoligada, codfilial, token) => {
    const sql = `
    insert into cipatoken values (?, ?, ?, ?);
    `
    const params = [cipaid, codcoligada, codfilial, token]
    return [sql, params]
}

const addVoto = (cipaid, n_votacao) => {
    const sql = 'update votos set total = total + 1 where cipaid = ? and voto = ?;'

    const params = [cipaid, n_votacao]
    return [sql, params]
}

const checarVoto = (cipaid, chapa) => {
    const sql =
        'select chapa from pfvoto where cipaid = ? and chapa = ?;'

    const params = [cipaid, chapa]
    return [sql, params]

}

const getTotalVotos = (cipaid, chapa) => {
    const sql =`
    select count(chapa) as total from pfvoto where cipaid = ?
        `

    const params = [cipaid]
    return [sql, params]

}

const registrarVoto = (cipaid, codcoligada, codfilial, chapa, nome, setor,) => {
    const sql = 'insert into pfvoto values (?, ?, ?, ?, default, ?, ?, default)'
    const params = [cipaid, codcoligada, codfilial, chapa, nome, setor]

    return [sql, params]
}

const maxNVotacao = (cipaid) => {
    const sql = `select right('1000' + max(n_votacao)+1, 3) as maxnvotacao from inscritos where cipaid = ?`
    const params = [cipaid]

    return [sql, params]
}

const getCipaToken = (cipaid) => {
    const sql = `select token from cipatoken where cipaid = ?`
    const params = [cipaid]

    return [sql, params]
}

const deleteCipa = (cipaid) => {
    const sql = `DELETE FROM cipaconfig WHERE id = ? `

    const params = [cipaid]

    return [sql, params]
}

const deleteInscritos = (cipaid) => {
    const sql = `DELETE FROM inscritos WHERE cipaid = ?`

    const params = [cipaid]

    return [sql, params]
}

const deleteVoto = (cipaid) => {
    const sql = `DELETE FROM votos WHERE cipaid = ?`

    const params = [cipaid]

    return [sql, params]
}

const deleteRegistroVoto = (cipaid) => {
    const sql = `DELETE FROM pfvoto WHERE cipaid = ?`

    const params = [cipaid]

    return [sql, params]
}

const deleteToken = (cipaid) => {
    const sql = `DELETE FROM cipatoken WHERE cipaid = ?`

    const params = [cipaid]

    return [sql, params]
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
    select F.CHAPA, F.NOME, F.CODFILIAL, S.DESCRICAO AS SECAO, PF.NOME AS FUNCAO
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

const funcComCpf = (chapa, codfilial) => { // Dados do Funcionário
    const sql = `
    select F.chapa, F.nome, F.codcoligada, F.codfilial, S.DESCRICAO AS secao, right(P.CPF, 3) as confirmacao
    from PFUNC F
    inner join PPESSOA P on P.CODIGO = F.CODPESSOA
    inner join PSECAO S on S.CODCOLIGADA = F.CODCOLIGADA AND S.CODIGO = F.CODSECAO
    where F.CHAPA = @chapa and F.CODFILIAL = @codfilial`
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

const funcComColigada = (codfilial, chapa) => {
    const sql = `
    select F.CHAPA, F.NOME, F.CODCOLIGADA, F.CODFILIAL, S.DESCRICAO AS SECAO, PF.NOME AS FUNCAO, 
    GC.NOMEFANTASIA AS GCNOME, GC.RUA AS GCRUA, GC.NUMERO AS GCNUMERO, GC.BAIRRO AS GCBAIRRO, GC.CIDADE AS GCCIDADE,
    GC.ESTADO AS GCESTADO, GC.CGC AS GCCGC, GC.TELEFONE AS GCTELEFONE
    
    from PFUNC F
    inner join GCOLIGADA GC on GC.CODCOLIGADA = F.CODCOLIGADA
    inner join PSECAO S on S.CODCOLIGADA = F.CODCOLIGADA AND S.CODIGO = F.CODSECAO
    inner join PFUNCAO PF on PF.CODCOLIGADA = F.CODCOLIGADA AND PF.CODIGO = F.CODFUNCAO
    
    where F.CODCOLIGADA = 1 AND F.CODFILIAL = @codfilial AND F.CHAPA = @chapa`

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

const funcTotalFilial = (codfilial) => {
    const sql = `
    select count(F.chapa) as total
    from PFUNC F
    where F.CODFILIAL = @codfilial AND F.CODSITUACAO <> 'D'
    `

    const params = [
        {
            name: 'codfilial',
            type: 'int',
            value: codfilial
        }
    ]

    return { sql, params }

}

module.exports = {
    mysql: {
        candidatos,
        getVotos,
        cadastrarCipa,
        editCipa,
        suspendCipa,
        cadastrarCandidato,
        cadastrarVoto,
        addToken,
        addVoto,
        registrarVoto,
        checarVoto,
        getTotalVotos,
        getFuncComVoto,
        maxNVotacao,
        getCipaToken,
        deleteCipa,
        deleteInscritos,
        deleteVoto,
        deleteRegistroVoto,
        deleteToken
    },
    mssql: {
        funcionario,
        funcComCpf,
        funcComColigada,
        funcTotalFilial,
    }
}