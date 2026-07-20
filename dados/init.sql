CREATE TABLE IF NOT EXISTS notas (
  rowid INTEGER PRIMARY KEY AUTOINCREMENT,
  data_cadastro TEXT,
  mes_cadastro TEXT,
  fornecedor TEXT,
  tipo TEXT,
  tipo_documento TEXT,
  numero TEXT,
  boleto TEXT,
  bol TEXT,
  nf TEXT,
  bol2 TEXT,
  nf2 TEXT,
  sol_ped TEXT,
  totalizacao TEXT,
  ap TEXT,
  servidor TEXT,
  email TEXT,
  carimbo TEXT,
  ass_eng TEXT,
  malote TEXT,
  observacoes TEXT,
  historico TEXT,
  data_solicitacao TEXT,
  data_aguarde_totalizacao TEXT,
  data_aguarde_carimbo TEXT,
  data_aguarde_engenharia TEXT,
  data_depositado TEXT
);

CREATE TABLE IF NOT EXISTS fornecedores (
  nome TEXT PRIMARY KEY,
  tipo_documento TEXT
);
