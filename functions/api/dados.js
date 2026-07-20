const keyMap = {
  'Data Cadastro': 'data_cadastro',
  'Mês Cadastro': 'mes_cadastro',
  'Fornecedor': 'fornecedor',
  'Tipo': 'tipo',
  'Tipo Documento': 'tipo_documento',
  'Número': 'numero',
  'Boleto': 'boleto',
  'BOL': 'bol',
  'NF': 'nf',
  'BOL2': 'bol2',
  'NF2': 'nf2',
  'SOL/PED': 'sol_ped',
  'Totalização': 'totalizacao',
  'AP': 'ap',
  'Servidor': 'servidor',
  'E-mail': 'email',
  'Carimbo': 'carimbo',
  'Ass. Eng.': 'ass_eng',
  'Malote': 'malote',
  'Observações': 'observacoes',
  'historico': 'historico',
  '_ts_solicitacao': 'data_solicitacao',
  '_ts_aguarde_total': 'data_aguarde_totalizacao',
  '_ts_aguarde_carimbo': 'data_aguarde_carimbo',
  '_ts_aguarde_eng': 'data_aguarde_engenharia',
  '_ts_depositado': 'data_depositado'
};

const chkKeys = new Set(['BOL','NF','BOL2','NF2','AP','Servidor','E-mail']);
const frontKeys = Object.keys(keyMap);
const colNames = frontKeys.map(k => keyMap[k]);
const placeholders = colNames.map(() => '?').join(',');

export async function onRequestGet(context) {
  const { env } = context;
  try {
    const { results } = await env.DB.prepare("SELECT * FROM notas ORDER BY rowid").all();
    const data = results.map(r => {
      const row = {};
      frontKeys.forEach(fk => {
        const ck = keyMap[fk];
        let v = r[ck];
        if (fk === 'historico') {
          row[fk] = v ? JSON.parse(v) : [];
        } else if (chkKeys.has(fk)) {
          row[fk] = v === 'X';
        } else {
          row[fk] = v != null ? v : null;
        }
      });
      return row;
    });
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch {
    return new Response(JSON.stringify([]), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
}

export async function onRequestPost(context) {
  const { env, request } = context;
  try {
    const data = await request.json();
    await env.DB.prepare("DELETE FROM notas").run();

    if (data.length > 0) {
      const stmt = env.DB.prepare(
        `INSERT INTO notas (${colNames.join(',')}) VALUES (${placeholders})`
      );
      const batch = data.map(row => {
        const vals = frontKeys.map(fk => {
          let v = row[fk];
          if (fk === 'historico') {
            return v && v.length ? JSON.stringify(v) : null;
          }
          if (chkKeys.has(fk)) {
            return v === true || v === 'X' ? 'X' : null;
          }
          return v != null ? String(v) : null;
        });
        return stmt.bind(...vals);
      });
      await env.DB.batch(batch);
    }

    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    await env.BACKUPS.put(`backup_${ts}`, JSON.stringify(data));

    return new Response(JSON.stringify({ ok: true, backup: `backup_${ts}` }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
}
