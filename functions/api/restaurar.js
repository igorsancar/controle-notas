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

export async function onRequestPost(context) {
  const { env, request } = context;
  try {
    const { key } = await request.json();
    const raw = await env.BACKUPS.get(key);
    if (!raw) {
      return new Response(JSON.stringify({ ok: false, error: "Backup não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    const data = JSON.parse(raw);
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

    return new Response(JSON.stringify({ ok: true, restored: key }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
}
