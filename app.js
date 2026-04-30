'use strict';

// ─── STATE ────────────────────────────────────────────────────
var state = {
  plantio: null, area: 1.5, covas: 1875, espaco: '4 x 2 m',
  registros: [], calDone: []
};

function saveLocal() {
  try { localStorage.setItem('angola_v3', JSON.stringify(state)); } catch(e) { console.warn('Erro ao salvar:', e); }
}

function loadLocal() {
  try {
    var s = localStorage.getItem('angola_v3');
    if (s) { state = JSON.parse(s); return true; }
  } catch(e) { console.warn('Erro ao carregar:', e); }
  return false;
}

// ─── DADOS DO CALENDÁRIO ──────────────────────────────────────
var calendario = [
  { dap:'0',     tipo:'adub', prod:'NPK 10-30-10',           detalhe:'50g/cova — misturar com terra, 5cm antes da semente', fase:'Plantio' },
  { dap:'15–20', tipo:'adub', prod:'Ureia',                  detalhe:'15g/cova — 10cm da planta, aplicar antes da chuva', fase:'Estabelecimento' },
  { dap:'15–20', tipo:'adub', prod:'KCl',                    detalhe:'15g/cova — antes da chuva', fase:'Estabelecimento' },
  { dap:'15–20', tipo:'ins',  prod:'Decis 25 EC',            detalhe:'Vaquinha, mosca branca, pulgão — cedo da manhã', fase:'Estabelecimento' },
  { dap:'17–22', tipo:'fung', prod:'Cuprozeb / Mancozebe',   detalhe:'1–2 dias após inseticida — prevenção míldio e mancha', fase:'Estabelecimento' },
  { dap:'35–40', tipo:'adub', prod:'Ureia',                  detalhe:'15g/cova — antes da chuva, 10cm da planta', fase:'Desenvolvimento' },
  { dap:'35–40', tipo:'adub', prod:'KCl',                    detalhe:'25g/cova — antes da chuva', fase:'Desenvolvimento' },
  { dap:'37–42', tipo:'ins',  prod:'Azamax',                 detalhe:'1–2 dias após adubação — seletivo abelha ✅', fase:'Desenvolvimento' },
  { dap:'39–44', tipo:'fung', prod:'Amistar WG',             detalhe:'1–2 dias após inseticida — oídio e míldio, 1ª de 2x', fase:'Desenvolvimento' },
  { dap:'42–46', tipo:'fol',  prod:'Boro 10% + Potássio K22%', detalhe:'Juntos OK — 2–3 dias após fungicida', fase:'Desenvolvimento' },
  { dap:'46–50', tipo:'fol',  prod:'Nitrato de Cálcio',      detalhe:'SOZINHO — 3–4 dias após Boro+K. 1ª de 3 aplicações', fase:'Desenvolvimento' },
  { dap:'50–54', tipo:'ins',  prod:'Decis 25 EC',            detalhe:'⚠️ ÚLTIMA aplicação — antes de florir', fase:'Pré-floração' },
  { dap:'55–60', tipo:'adub', prod:'Ureia',                  detalhe:'10g/cova — dose reduzida, foco no K', fase:'Floração' },
  { dap:'55–60', tipo:'adub', prod:'KCl',                    detalhe:'25g/cova — suporte à floração', fase:'Floração' },
  { dap:'57–62', tipo:'ins',  prod:'Prêmio (1ª aplic.)',     detalhe:'1–2 dias após adubação — ✅ seletivo abelha, máx 3x', fase:'Floração' },
  { dap:'59–64', tipo:'fung', prod:'Cuprozeb / Mancozebe',   detalhe:'1–2 dias após inseticida — proteção na floração', fase:'Floração' },
  { dap:'61–65', tipo:'fol',  prod:'Boro 10% + Potássio K22%', detalhe:'Juntos OK — 1–2 dias após fungicida. ⭐ CRÍTICO floração', fase:'Floração' },
  { dap:'65–69', tipo:'fol',  prod:'Nitrato de Cálcio',      detalhe:'SOZINHO — 3–4 dias após Boro+K. 2ª aplicação', fase:'Floração' },
  { dap:'70–74', tipo:'adub', prod:'KCl',                    detalhe:'25g/cova — enchimento dos frutos', fase:'Frutificação' },
  { dap:'71–75', tipo:'ins',  prod:'Prêmio (2ª aplic.)',     detalhe:'1–2 dias após adubação — lagarta e broca ✅', fase:'Frutificação' },
  { dap:'73–77', tipo:'fung', prod:'Amistar WG',             detalhe:'1–2 dias após inseticida — 2ª e última do ciclo', fase:'Frutificação' },
  { dap:'75–79', tipo:'fol',  prod:'Boro 10% + Potássio K22%', detalhe:'Juntos OK — peso e qualidade do fruto', fase:'Frutificação' },
  { dap:'79–83', tipo:'fol',  prod:'Nitrato de Cálcio',      detalhe:'SOZINHO — 3–4 dias após Boro+K. 3ª aplicação', fase:'Frutificação' },
  { dap:'80–85', tipo:'adub', prod:'Ureia',                  detalhe:'5g/cova — dose mínima final', fase:'Frutificação' },
  { dap:'80–85', tipo:'adub', prod:'KCl',                    detalhe:'25g/cova — finalização enchimento', fase:'Frutificação' },
  { dap:'82–86', tipo:'ins',  prod:'Prêmio (3ª aplic.)',     detalhe:'ÚLTIMA — broca do fruto ⚠️ não exceder 3 aplicações', fase:'Frutificação' },
  { dap:'90–120',tipo:'col',  prod:'Colheita',               detalhe:'Casca firme, pedúnculo seco e corticoso, som oco', fase:'Colheita' },
];

var fases = [
  { nome:'Plantio',         dapMin:0,  dapMax:14,  desc:'Semeadura e estabelecimento inicial.', emoji:'🌱', cor:'#2d6a4f', alertas:['Garantir 5cm de terra entre adubo e semente','Solo deve ter alguma umidade no plantio'] },
  { nome:'Estabelecimento', dapMin:15, dapMax:34,  desc:'Plantas com 3–4 folhas. Foco em raízes e arranque vegetativo.', emoji:'🌿', cor:'#264653', alertas:['Monitorar mosca branca e pulgão','Decis + Cuprozeb — intervalo 1–2 dias entre eles'] },
  { nome:'Desenvolvimento', dapMin:35, dapMax:49,  desc:'Ramas crescendo vigorosamente. Grande demanda nutricional.', emoji:'🍃', cor:'#40916c', alertas:['Boro + Potássio juntos OK — Nitrato Ca SOZINHO 3–4 dias depois','Amistar WG — 1ª aplicação do ciclo'] },
  { nome:'Pré-floração',    dapMin:50, dapMax:54,  desc:'Primeiras flores masculinas aparecendo.', emoji:'🌼', cor:'#b45309', alertas:['⚠️ ÚLTIMA chance do Decis — abelhas chegando!','Prepare Azamax e Prêmio para a floração'] },
  { nome:'Floração',        dapMin:55, dapMax:74,  desc:'Fase CRÍTICA — somente inseticidas seletivos para abelhas!', emoji:'🌸', cor:'#6d28d9', alertas:['🐝 Só Azamax e Prêmio — NUNCA Decis na floração','⭐ Boro + K juntos — Nitrato Ca SOZINHO 3–4 dias depois'] },
  { nome:'Frutificação',    dapMin:75, dapMax:89,  desc:'Frutos em desenvolvimento e enchimento. Foco em K e Ca.', emoji:'🎃', cor:'#c2410c', alertas:['Nitrato de Cálcio 3ª aplicação — SOZINHO sempre','Prêmio 3ª e ÚLTIMA aplicação — broca do fruto'] },
  { nome:'Pré-Colheita',    dapMin:90, dapMax:120, desc:'Angola pronta para colheita! Verificar maturação.', emoji:'🚜', cor:'#15803d', alertas:['Casca firme — difícil furar com a unha','Pedúnculo seco e corticoso — som oco ao bater'] },
];

// ─── HELPERS ──────────────────────────────────────────────────
function getDap() {
  if (!state.plantio) return 0;
  var p = new Date(state.plantio + 'T00:00:00');
  var h = new Date(); h.setHours(0,0,0,0);
  return Math.max(0, Math.floor((h - p) / 86400000));
}

function getFase(dap) {
  return fases.find(function(f) { return dap >= f.dapMin && dap <= f.dapMax; }) || fases[fases.length - 1];
}

function parseDapRange(dap) {
  var s = String(dap);
  if (s.indexOf('–') >= 0) {
    var p = s.split('–').map(Number);
    return [p[0], p[1]];
  }
  var n = parseInt(s); return [n, n];
}

function fmtData(dateStr) {
  if (!dateStr) return '—';
  var d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR');
}

function fmtMoeda(v) {
  if (!v && v !== 0) return '—';
  return 'R$ ' + parseFloat(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 2800);
}

function showTab(name) {
  var names = ['inicio','calendario','registro','historico','indicacoes','relatorio','insumos'];
  document.querySelectorAll('.tab').forEach(function(t, i) {
    t.classList.toggle('active', names[i] === name);
  });
  document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
  var panel = document.getElementById('panel-' + name);
  if (panel) panel.classList.add('active');
  if (name === 'historico') renderHistorico();
  if (name === 'calendario') renderCalendario();
  if (name === 'relatorio') renderRelatorio();
}

// ─── INIT ─────────────────────────────────────────────────────
function init() {
  var ok = loadLocal();
  setTimeout(function() {
    var l = document.getElementById('loadingScreen');
    l.classList.add('hide');
    setTimeout(function() { l.style.display = 'none'; }, 400);
    if (!ok || !state.plantio) {
      document.getElementById('setupData').valueAsDate = new Date();
      document.getElementById('setupOverlay').classList.add('show');
    } else {
      atualizar();
    }
  }, 700);
}

function iniciar() {
  var data = document.getElementById('setupData').value;
  if (!data) { showToast('⚠️ Informe a data de plantio!'); return; }
  var btn = document.getElementById('btnComecar');
  btn.disabled = true;
  btn.textContent = 'Salvando...';
  state.plantio = data;
  state.area = parseFloat(document.getElementById('setupArea').value) || 1.5;
  state.covas = parseInt(document.getElementById('setupCovas').value) || 1875;
  state.espaco = document.getElementById('setupEspaco').value || '4 x 2 m';
  if (!state.registros) state.registros = [];
  if (!state.calDone) state.calDone = [];
  saveLocal();
  document.getElementById('setupOverlay').classList.remove('show');
  btn.disabled = false;
  btn.textContent = '🌱 INICIAR MONITORAMENTO';
  atualizar();
  showToast('🌱 Lavoura configurada com sucesso!');
}

function resetar() {
  if (!confirm('Reconfigurar lavoura? Os registros serão mantidos.')) return;
  state.plantio = null;
  saveLocal();
  document.getElementById('setupData').valueAsDate = new Date();
  document.getElementById('setupArea').value = state.area;
  document.getElementById('setupCovas').value = state.covas;
  document.getElementById('setupEspaco').value = state.espaco;
  var btn = document.getElementById('btnComecar');
  btn.disabled = false;
  btn.textContent = '🌱 INICIAR MONITORAMENTO';
  document.getElementById('setupOverlay').classList.add('show');
}

// ─── ATUALIZAR ────────────────────────────────────────────────
function atualizar() {
  if (!state.plantio) return;
  var dap = getDap();
  var fase = getFase(dap);
  var restam = Math.max(0, 100 - dap);
  var pct = Math.min(100, Math.round((dap / 100) * 100));

  document.getElementById('dapNum').textContent = dap;
  document.getElementById('pillArea').textContent = state.area + ' ha';
  document.getElementById('pillCovas').textContent = Number(state.covas).toLocaleString('pt-BR') + ' covas';
  document.getElementById('pillEspaco').textContent = state.espaco;
  document.getElementById('pillPlantio').textContent = '🌱 ' + fmtData(state.plantio);
  var dc = new Date(state.plantio + 'T00:00:00'); dc.setDate(dc.getDate() + 100);
  document.getElementById('pillColheita').textContent = '🎃 ~' + dc.toLocaleDateString('pt-BR');

  document.getElementById('statDap').textContent = dap;
  document.getElementById('statRestam').textContent = restam;
  document.getElementById('statRegistros').textContent = state.registros.length;
  document.getElementById('statPulv').textContent = state.registros.filter(function(r) { return r.tipo && r.tipo.indexOf('Pulverização') >= 0; }).length;

  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressPct').textContent = pct + '%';

  var fa = document.getElementById('faseAtual');
  fa.setAttribute('data-emoji', fase.emoji);
  fa.style.background = 'linear-gradient(135deg, ' + fase.cor + ', #264653)';
  document.getElementById('faseNome').textContent = fase.emoji + ' ' + fase.nome;
  document.getElementById('faseDesc').textContent = fase.desc;
  document.getElementById('faseAlertas').innerHTML = fase.alertas.map(function(a) {
    return '<div class="alerta-item">⚡ ' + a + '</div>';
  }).join('');

  renderProximas(dap);
  renderCalendario(dap);

  document.getElementById('regData').valueAsDate = new Date();
  document.getElementById('regDap').value = dap;
}

// ─── PRÓXIMAS AÇÕES ───────────────────────────────────────────
function renderProximas(dap) {
  var el = document.getElementById('proximasAcoes');
  var prox = calendario.filter(function(c) {
    var r = parseDapRange(c.dap);
    return r[1] >= dap && r[0] <= dap + 15;
  }).slice(0, 5);
  if (!prox.length) {
    el.innerHTML = '<div class="empty-state"><div class="icon">✅</div><p>Sem ações nos próximos dias</p></div>';
    return;
  }
  el.innerHTML = prox.map(function(c) {
    return '<div class="cal-item tipo-' + c.tipo + '" style="margin-bottom:8px"><div class="cal-dap">DAP ' + c.dap + '</div><div class="cal-produto">' + c.prod + '</div><div class="cal-detalhe">' + c.detalhe + '</div></div>';
  }).join('');
}

// ─── CALENDÁRIO ───────────────────────────────────────────────
function renderCalendario(dap) {
  if (dap === undefined) dap = getDap();
  var list = document.getElementById('calList');
  var html = ''; var lastFase = '';
  calendario.forEach(function(c, i) {
    if (c.fase !== lastFase) {
      lastFase = c.fase;
      html += '<div class="cal-fase-label">' + c.fase.toUpperCase() + '</div>';
    }
    var done = state.calDone.indexOf(i) >= 0;
    var range = parseDapRange(c.dap);
    var isAtual = !done && dap >= range[0] && dap <= range[1];
    html += '<div class="cal-item tipo-' + c.tipo + (done ? ' done' : '') + (isAtual ? ' atual' : '') + '">';
    html += '<div class="cal-dap">DAP ' + c.dap + '</div>';
    html += '<div class="cal-produto">' + c.prod + '</div>';
    html += '<div class="cal-detalhe">' + c.detalhe + '</div>';
    html += '<div class="cal-check" data-idx="' + i + '"></div>';
    html += '</div>';
  });
  list.innerHTML = html;

  // Eventos nos checks
  list.querySelectorAll('.cal-check').forEach(function(el) {
    el.addEventListener('click', function() {
      toggleCal(parseInt(this.getAttribute('data-idx')));
    });
  });
}

function toggleCal(i) {
  var idx = state.calDone.indexOf(i);
  if (idx >= 0) state.calDone.splice(idx, 1);
  else state.calDone.push(i);
  saveLocal();
  renderCalendario();
  showToast(state.calDone.indexOf(i) >= 0 ? '✓ Marcado como realizado!' : 'Desmarcado');
}

// ─── SALVAR REGISTRO ──────────────────────────────────────────
function salvarRegistro() {
  var tipo = document.getElementById('regTipo').value;
  var prod = document.getElementById('regProduto').value.trim();
  if (!tipo) { showToast('⚠️ Selecione o tipo de registro!'); return; }
  if (!prod) { showToast('⚠️ Informe o produto ou atividade!'); return; }
  var btn = document.getElementById('btnSalvar');
  btn.disabled = true;
  btn.textContent = 'Salvando...';
  var reg = {
    id: Date.now(),
    data: document.getElementById('regData').value,
    dap: parseInt(document.getElementById('regDap').value) || 0,
    tipo: tipo,
    produto: prod,
    quantidade: document.getElementById('regQtd').value || null,
    unidade: document.getElementById('regUnidade').value,
    valor: document.getElementById('regValor').value || null,
    obs: document.getElementById('regObs').value.trim() || null,
  };
  state.registros.unshift(reg);
  saveLocal();
  document.getElementById('regTipo').value = '';
  document.getElementById('regProduto').value = '';
  document.getElementById('regQtd').value = '';
  document.getElementById('regValor').value = '';
  document.getElementById('regObs').value = '';
  btn.disabled = false;
  btn.textContent = '💾 SALVAR REGISTRO';
  atualizar();
  showToast('✅ Registro salvo com sucesso!');
  setTimeout(function() { showTab('historico'); }, 600);
}

// ─── HISTÓRICO ────────────────────────────────────────────────
function renderHistorico() {
  var filtro = document.getElementById('filtroTipo') ? document.getElementById('filtroTipo').value : '';
  var list = document.getElementById('historicoList');
  var regs = filtro ? state.registros.filter(function(r) { return r.tipo === filtro; }) : state.registros;
  if (!regs.length) {
    list.innerHTML = '<div class="empty-state"><div class="icon">📋</div><p>Nenhum registro encontrado</p></div>';
    return;
  }
  var cores = {
    'Adubação Solo':'badge-verde','Adubação Foliar':'badge-roxo',
    'Pulverização - Inseticida':'badge-amarelo','Pulverização - Fungicida':'badge-azul',
    'Colheita':'badge-verde','Venda':'badge-verde','Mão de Obra':'badge-laranja'
  };
  list.innerHTML = regs.map(function(r) {
    var bc = cores[r.tipo] || 'badge-amarelo';
    var qtdStr = r.quantidade ? r.quantidade + ' ' + (r.unidade || '') : '';
    var valStr = r.valor ? 'R$ ' + parseFloat(r.valor).toFixed(2) : '';
    var detalhes = [qtdStr, valStr, r.obs].filter(Boolean).join(' · ');
    return '<div class="hist-item">' +
      '<button class="hist-del" data-id="' + r.id + '">🗑</button>' +
      '<div class="hist-topo"><div class="hist-data">📅 ' + fmtData(r.data) + '</div><div class="hist-dap">DAP ' + r.dap + '</div></div>' +
      '<span class="badge ' + bc + ' hist-tipo">' + r.tipo + '</span>' +
      '<div class="hist-produto">' + r.produto + '</div>' +
      (detalhes ? '<div class="hist-detalhe">' + detalhes + '</div>' : '') +
      '</div>';
  }).join('');

  list.querySelectorAll('.hist-del').forEach(function(btn) {
    btn.addEventListener('click', function() {
      deletarReg(parseInt(this.getAttribute('data-id')));
    });
  });
}

function deletarReg(id) {
  if (!confirm('Excluir este registro?')) return;
  state.registros = state.registros.filter(function(r) { return r.id !== id; });
  saveLocal();
  atualizar();
  renderHistorico();
  showToast('🗑 Registro excluído');
}

// ─── INDICAÇÕES ───────────────────────────────────────────────
function toggleInd(el) {
  el.classList.toggle('open');
}

// ─── RELATÓRIO ────────────────────────────────────────────────
function renderRelatorio() {
  var regs = state.registros;
  var dap = getDap();
  document.getElementById('relDataGeracao').textContent = new Date().toLocaleString('pt-BR');
  var totalCusto = regs.reduce(function(s, r) { return s + (parseFloat(r.valor) || 0); }, 0);
  var pulvs = regs.filter(function(r) { return r.tipo && r.tipo.indexOf('Pulverização') >= 0; });
  var adubs = regs.filter(function(r) { return r.tipo && r.tipo.indexOf('Adubação') >= 0; });

  document.getElementById('relStats').innerHTML =
    '<div class="rel-stat"><div class="val">' + regs.length + '</div><div class="lbl">Registros</div></div>' +
    '<div class="rel-stat"><div class="val" style="color:var(--laranja)">' + pulvs.length + '</div><div class="lbl">Pulverizações</div></div>' +
    '<div class="rel-stat"><div class="val" style="color:var(--roxo)">' + adubs.length + '</div><div class="lbl">Adubações</div></div>' +
    '<div class="rel-stat"><div class="val" style="color:var(--azul)">' + dap + '</div><div class="lbl">DAP atual</div></div>' +
    '<div class="rel-stat"><div class="val" style="color:var(--terra);font-size:1rem">' + fmtMoeda(totalCusto) + '</div><div class="lbl">Custo total</div></div>' +
    '<div class="rel-stat"><div class="val" style="color:var(--verde2)">' + state.calDone.length + '</div><div class="lbl">Concluídos</div></div>';

  function tableRows(arr, cols) {
    if (!arr.length) return '<tr><td colspan="' + cols + '" style="text-align:center;color:#aaa;padding:16px">Nenhum registro</td></tr>';
    return arr.map(function(r) {
      return '<tr>' + cols.map(function(c) { return '<td>' + (c(r) || '—') + '</td>'; }).join('') + '</tr>';
    }).join('');
  }

  document.querySelector('#relPulvTable tbody').innerHTML = tableRows(pulvs, [
    function(r) { return fmtData(r.data); },
    function(r) { return r.dap; },
    function(r) { return '<strong>' + r.produto + '</strong>'; },
    function(r) { return r.quantidade ? r.quantidade + ' ' + (r.unidade || '') : ''; },
    function(r) { return r.obs || ''; }
  ]);

  document.querySelector('#relAdubTable tbody').innerHTML = tableRows(adubs, [
    function(r) { return fmtData(r.data); },
    function(r) { return r.dap; },
    function(r) { return '<strong>' + r.produto + '</strong>'; },
    function(r) { return r.quantidade ? r.quantidade + ' ' + (r.unidade || '') : ''; },
    function(r) { return r.valor ? fmtMoeda(r.valor) : ''; }
  ]);

  var custos = {};
  regs.forEach(function(r) { if (r.valor) custos[r.tipo] = (custos[r.tipo] || 0) + parseFloat(r.valor); });
  var custoEntries = Object.entries(custos).sort(function(a,b) { return b[1]-a[1]; });
  document.querySelector('#relCustoTable tbody').innerHTML = custoEntries.length
    ? custoEntries.map(function(e) { return '<tr><td>' + e[0] + '</td><td><strong>' + fmtMoeda(e[1]) + '</strong></td></tr>'; }).join('') +
      '<tr style="background:var(--verde-bg)"><td><strong>TOTAL</strong></td><td><strong>' + fmtMoeda(totalCusto) + '</strong></td></tr>'
    : '<tr><td colspan="2" style="text-align:center;color:#aaa;padding:16px">Nenhum custo registrado</td></tr>';

  var obs = regs.filter(function(r) { return r.tipo && (r.tipo.indexOf('Observação') >= 0 || r.tipo.indexOf('Praga') >= 0 || r.tipo.indexOf('Doença') >= 0); });
  document.querySelector('#relObsTable tbody').innerHTML = tableRows(obs, [
    function(r) { return fmtData(r.data); },
    function(r) { return r.dap; },
    function(r) { return r.tipo; },
    function(r) { return r.produto + (r.obs ? ' — ' + r.obs : ''); }
  ]);

  var colheita = regs.filter(function(r) { return r.tipo === 'Colheita' || r.tipo === 'Venda'; });
  var totalVenda = colheita.filter(function(r) { return r.tipo === 'Venda'; }).reduce(function(s,r) { return s + (parseFloat(r.valor)||0); }, 0);
  document.querySelector('#relColheitaTable tbody').innerHTML = colheita.length
    ? colheita.map(function(r) {
        return '<tr><td>' + fmtData(r.data) + '</td><td>' + r.dap + '</td><td>' + r.tipo + '</td><td>' + (r.quantidade ? r.quantidade + ' ' + (r.unidade||'') : '—') + '</td><td>' + (r.valor ? fmtMoeda(r.valor) : '—') + '</td><td style="font-size:0.7rem">' + (r.obs||'—') + '</td></tr>';
      }).join('') + (totalVenda > 0 ? '<tr style="background:var(--verde-bg)"><td colspan="4"><strong>RECEITA TOTAL</strong></td><td><strong>' + fmtMoeda(totalVenda) + '</strong></td><td></td></tr>' : '')
    : '<tr><td colspan="6" style="text-align:center;color:#aaa;padding:16px">Nenhuma colheita registrada</td></tr>';
}

// ─── START ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  init();
});
