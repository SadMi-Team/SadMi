const mysql = require('mysql2/promise');

async function conectarBD() {
    if (global.conexao && global.conexao.state !== 'disconnected') {
        return global.conexao;
    }

    const conexao = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'gestorDinheiro'
    });

    global.conexao = conexao;

    return global.conexao;
}

// ===== Exemplos =====
async function inserirUsuario(usuario) {
    const conexao = await conectarBD();
    const sql = `INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)`;
    const [resultado] = await conexao.query(sql, [usuario.nome, usuario.email, usuario.senha]);
    return resultado.insertId;  // retorna o id do registro inserido
}

async function buscarUsuarioPorId(id) {
    const conexao = await conectarBD();
    const sql = `SELECT * FROM usuarios WHERE id = ?`;
    const [rows] = await conexao.query(sql, [id]);
    return rows.length > 0 ? rows[0] : null;
}

async function atualizarUsuario(id, dados) {
    const conexao = await conectarBD();
    const sql = `UPDATE usuarios SET nome = ?, email = ? WHERE id = ?`;
    const [resultado] = await conexao.query(sql, [dados.nome, dados.email, id]);
    return resultado.affectedRows;  // número de linhas alteradas
}

async function deletarUsuario(id) {
    const conexao = await conectarBD();
    const sql = `DELETE FROM usuarios WHERE id = ?`;
    const [resultado] = await conexao.query(sql, [id]);
    return resultado.affectedRows;  // número de linhas deletadas
}

module.exports = {
    inserirUsuario,
    buscarUsuarioPorId,
    atualizarUsuario,
    deletarUsuario
};
