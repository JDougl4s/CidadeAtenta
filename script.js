/* Cidade Atenta · lógica do protótipo (JavaScript puro, sem dependências) */
(() => {
  'use strict';

  /* ---------- Constantes e dados de exemplo ---------- */
  const CHAVE_OCORRENCIAS = 'cidadeAtenta.ocorrencias';
  const CHAVE_ACESSIBILIDADE = 'cidadeAtenta.acessibilidade';
  const ROTAS = ['inicio', 'registrar', 'acompanhar', 'demo'];
  const MAX_ARQUIVOS = 5;
  const TIPOS_ARQUIVO = {
    'image/jpeg': 'imagem', 'image/png': 'imagem', 'image/webp': 'imagem',
    'video/mp4': 'video', 'video/webm': 'video',
  };
  const LIMITE_MB = { imagem: 5, video: 20 };
  const TAMANHOS_TEXTO = [87.5, 100, 112.5, 125, 137.5];
  const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const TELEFONE_RE = /^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/;
  const PROTOCOLO_RE = /^CA-\d{4}-[A-Z0-9]{6}$/;

  const CATEGORIAS = [
    { id: 'buracos', nome: 'Buracos e danos nas vias', icone: '<path d="M4 20 9 4M20 20l-5-16M12 7v2m0 4v2m0 4v1"/>' },
    { id: 'saneamento', nome: 'Problemas de saneamento básico', icone: '<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16"/>' },
    { id: 'iluminacao', nome: 'Falta de iluminação pública', icone: '<path d="M9 18h6m-5 3h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>' },
    { id: 'lixo', nome: 'Acúmulo de lixo e descarte irregular', icone: '<path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"/>' },
    { id: 'calcadas', nome: 'Problemas em calçadas e acessibilidade urbana', icone: '<circle cx="12" cy="5" r="2"/><path d="M6 9h12M12 9v5l-3 6m3-6 3 6"/>' },
    { id: 'vazamentos', nome: 'Vazamentos de água', icone: '<path d="M8 3S4.5 7 4.5 9.5a3.5 3.5 0 0 0 7 0C11.5 7 8 3 8 3z"/><path d="M16.5 10s-3 3.2-3 5.2a3 3 0 0 0 6 0c0-2-3-5.2-3-5.2z"/>' },
    { id: 'outros', nome: 'Outros problemas urbanos', icone: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4m0 4h.01"/>' },
  ];

  const STATUS = {
    pendente: { nome: 'Pendente', icone: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' },
    atendimento: { nome: 'Em atendimento', icone: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>' },
    resolvido: { nome: 'Resolvido', icone: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.5 2.5L16 9.5"/>' },
  };
  const ORDEM_STATUS = Object.keys(STATUS);

  const EXEMPLOS = [
    { protocolo: 'CA-2026-7H3KQ2', categoria: 'buracos', rua: 'Rua das Palmeiras', numero: '120', bairro: 'Vila Esperança', referencia: 'Perto do ponto de ônibus', descricao: 'Buraco grande na faixa da direita, com risco para motociclistas.', identificacao: 'identificada', anexos: 2, status: 'resolvido', criadoEm: '2026-09-28T09:15:00', historico: [{ status: 'atendimento', data: '2026-10-02T10:00:00' }, { status: 'resolvido', data: '2026-10-09T16:30:00' }] },
    { protocolo: 'CA-2026-M4XP9D', categoria: 'iluminacao', rua: 'Avenida dos Ipês', numero: '', bairro: 'Jardim das Flores', referencia: 'Em frente à praça', descricao: 'Três postes apagados há mais de uma semana, deixando a área escura à noite.', identificacao: 'anonima', anexos: 1, status: 'atendimento', criadoEm: '2026-10-03T19:40:00', historico: [{ status: 'atendimento', data: '2026-10-07T08:20:00' }] },
    { protocolo: 'CA-2026-R2TN6H', categoria: 'vazamentos', rua: 'Rua Santa Clara', numero: '45', bairro: 'Centro', referencia: '', descricao: 'Vazamento constante na calçada, formando poça e desperdiçando água.', identificacao: 'anonima', anexos: 0, status: 'atendimento', criadoEm: '2026-10-14T07:55:00', historico: [{ status: 'atendimento', data: '2026-10-15T11:10:00' }] },
    { protocolo: 'CA-2026-Q9LW2T', categoria: 'lixo', rua: 'Travessa do Cajueiro', numero: '', bairro: 'Bela Vista', referencia: 'Terreno ao lado do mercado', descricao: 'Entulho e sacos de lixo acumulados há vários dias, atraindo animais.', identificacao: 'identificada', anexos: 1, status: 'pendente', criadoEm: '2026-10-10T14:05:00', historico: [] },
    { protocolo: 'CA-2026-V5CJ8E', categoria: 'calcadas', rua: 'Rua Açucena', numero: '300', bairro: 'Nova Esperança', referencia: '', descricao: 'Calçada quebrada e sem rampa, dificultando a passagem de cadeirantes.', identificacao: 'anonima', anexos: 0, status: 'pendente', criadoEm: '2026-10-18T10:30:00', historico: [] },
  ];

  /* ---------- Utilidades ---------- */
  const clonar = objeto => JSON.parse(JSON.stringify(objeto));
  const esc = texto => String(texto ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const svg = (conteudo, classe = 'ico') => `<svg class="${classe}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${conteudo}</svg>`;
  const formatarData = iso => new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  const nomeCategoria = id => (CATEGORIAS.find(c => c.id === id) ?? CATEGORIAS.at(-1)).nome;
  const textoLocal = o => `${o.rua}${o.numero ? `, nº ${o.numero}` : ''}, ${o.bairro}${o.referencia ? ` (ref.: ${o.referencia})` : ''}`;
  const badge = status => `<span class="badge badge-${status}">${svg(STATUS[status].icone, 'ico-sm')}<span>${STATUS[status].nome}</span></span>`;
  const ultimaData = (o, status) => o.historico.filter(h => h.status === status).pop()?.data;

  /* ---------- Armazenamento local ---------- */
  function carregar() {
    try {
      const salvas = JSON.parse(localStorage.getItem(CHAVE_OCORRENCIAS));
      if (Array.isArray(salvas)) return salvas;
    } catch (erro) { /* dados inválidos: volta aos exemplos */ }
    return clonar(EXEMPLOS);
  }
  let ocorrencias = carregar();

  function persistir() {
    try {
      localStorage.setItem(CHAVE_OCORRENCIAS, JSON.stringify(ocorrencias));
    } catch (erro) {
      console.warn('Não foi possível salvar neste navegador.', erro);
    }
  }

  /* ---------- Modal (com foco controlado e tecla Esc) ---------- */
  const modal = document.getElementById('modal');
  const caixa = document.getElementById('modal-caixa');
  const conteudoModal = document.getElementById('modal-conteudo');
  let focoAnterior = null;

  function abrirModal(html) {
    if (modal.hidden) focoAnterior = document.activeElement;
    conteudoModal.innerHTML = html;
    modal.hidden = false;
    document.body.classList.add('modal-aberto');
    (conteudoModal.querySelector('h2') ?? caixa).focus();
  }

  function fecharModal() {
    modal.hidden = true;
    conteudoModal.innerHTML = '';
    document.body.classList.remove('modal-aberto');
    if (focoAnterior?.isConnected && !focoAnterior.closest('[hidden]')) focoAnterior.focus();
  }

  function perguntar(titulo, texto, rotuloOk, aoConfirmar) {
    abrirModal(`
      <h2 id="modal-titulo" tabindex="-1">${titulo}</h2>
      <p>${texto}</p>
      <div class="acoes">
        <button type="button" class="btn btn-ghost" data-fechar>Cancelar</button>
        <button type="button" class="btn btn-primary" id="btn-ok">${rotuloOk}</button>
      </div>`);
    document.getElementById('btn-ok').addEventListener('click', () => {
      fecharModal();
      aoConfirmar();
    });
  }

  modal.addEventListener('click', e => {
    if (e.target.closest('[data-fechar]') || e.target.closest('a')) fecharModal();
  });

  modal.addEventListener('keydown', e => {
    if (e.key === 'Escape') { fecharModal(); return; }
    if (e.key !== 'Tab') return;
    const focaveis = [...caixa.querySelectorAll('button, a[href], input, textarea, select')];
    const primeiro = focaveis[0];
    const ultimo = focaveis.at(-1);
    if (!primeiro) return;
    if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
  });

  /* ---------- Acessibilidade (tamanho do texto e alto contraste) ---------- */
  let preferencias = { escala: 1, contraste: false };
  try {
    preferencias = { ...preferencias, ...JSON.parse(localStorage.getItem(CHAVE_ACESSIBILIDADE)) };
  } catch (erro) { /* usa as preferências padrão */ }

  function aplicarAcessibilidade() {
    preferencias.escala = Math.min(Math.max(preferencias.escala, 0), TAMANHOS_TEXTO.length - 1);
    document.documentElement.style.fontSize = `${TAMANHOS_TEXTO[preferencias.escala]}%`;
    document.documentElement.classList.toggle('alto-contraste', preferencias.contraste);
    document.getElementById('contraste').setAttribute('aria-pressed', String(preferencias.contraste));
    try {
      localStorage.setItem(CHAVE_ACESSIBILIDADE, JSON.stringify(preferencias));
    } catch (erro) { /* sem persistência, o ajuste vale só nesta página */ }
  }

  document.getElementById('fonte-mais').addEventListener('click', () => { preferencias.escala++; aplicarAcessibilidade(); });
  document.getElementById('fonte-menos').addEventListener('click', () => { preferencias.escala--; aplicarAcessibilidade(); });
  document.getElementById('contraste').addEventListener('click', () => {
    preferencias.contraste = !preferencias.contraste;
    aplicarAcessibilidade();
  });

  /* ---------- Navegação por rotas (hash) ---------- */
  let rotaAtual = null;

  function mostrarRota(rota, focar = false) {
    rotaAtual = rota;
    document.querySelectorAll('.view').forEach(view => { view.hidden = view.id !== rota; });
    document.querySelectorAll('[data-rota]').forEach(link => {
      if (link.dataset.rota === rota) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    if (rota === 'demo') renderizarDemo();
    if (focar) {
      const titulo = document.querySelector(`#${rota} h1`);
      titulo.setAttribute('tabindex', '-1');
      titulo.focus();
      window.scrollTo(0, 0);
    }
  }

  const rotaDoHash = () => (ROTAS.includes(location.hash.slice(1)) ? location.hash.slice(1) : null);

  window.addEventListener('hashchange', () => {
    const rota = rotaDoHash() ?? rotaAtual;
    if (rota) mostrarRota(rota, true);
  });

  /* ---------- Categorias (cartões com rádio acessível) ---------- */
  const grade = document.getElementById('categorias');
  grade.innerHTML = CATEGORIAS.map(c => `
    <label class="cat-opcao">
      <input class="sr-only" type="radio" name="categoria" value="${c.id}">
      ${svg(c.icone)}
      <span class="cat-nome">${c.nome}</span>
    </label>`).join('');

  grade.addEventListener('change', () => {
    grade.querySelectorAll('.cat-opcao').forEach(l => l.classList.toggle('selecionada', l.querySelector('input').checked));
    setErro('categoria', '');
  });

  /* ---------- Formulário de registro ---------- */
  const form = document.getElementById('form-ocorrencia');
  const descricao = document.getElementById('descricao');
  const contador = document.getElementById('contador');
  const anonimo = document.getElementById('anonimo');
  const blocoIdentidade = document.getElementById('bloco-identidade');
  const inputAnexos = document.getElementById('anexos');
  const listaPrevias = document.getElementById('previas');
  const avisoForm = document.getElementById('aviso-form');
  let arquivos = [];

  const REGRAS = {
    categoria: () => (form.querySelector('input[name="categoria"]:checked') ? '' : 'Escolha o tipo de ocorrência.'),
    rua: v => (v.trim().length >= 3 ? '' : 'Informe a rua ou avenida.'),
    bairro: v => (v.trim().length >= 2 ? '' : 'Informe o bairro.'),
    descricao: v => (v.trim().length >= 20 ? '' : `Descreva melhor o problema. Faltam ${20 - v.trim().length} caractere(s).`),
    nome: v => (v.trim().length >= 3 ? '' : 'Informe seu nome completo.'),
    email: v => (EMAIL_RE.test(v.trim()) ? '' : 'Informe um e-mail válido, como nome@exemplo.com.'),
    telefone: v => (!v.trim() || TELEFONE_RE.test(v.trim()) ? '' : 'Use o formato (DDD) 91234-5678 ou deixe o campo em branco.'),
  };

  function setErro(id, mensagem) {
    const campo = document.getElementById(id);
    if (campo) {
      campo.classList.toggle('is-invalid', Boolean(mensagem));
      campo.setAttribute('aria-invalid', String(Boolean(mensagem)));
    }
    document.getElementById(`erro-${id}`).textContent = mensagem;
    return !mensagem;
  }

  function validarCampo(id) {
    const campo = document.getElementById(id);
    return setErro(id, REGRAS[id](campo ? campo.value : ''));
  }

  function atualizarContador() {
    contador.textContent = `${descricao.value.trim().length} caractere(s) · mínimo de 20`;
  }

  form.addEventListener('input', e => {
    if (e.target === descricao) atualizarContador();
    const id = e.target.id;
    if (REGRAS[id] && document.getElementById(`erro-${id}`).textContent) validarCampo(id);
  });

  anonimo.addEventListener('change', () => {
    blocoIdentidade.hidden = anonimo.checked;
    ['nome', 'email', 'telefone'].forEach(id => setErro(id, ''));
  });

  /* Anexos: validação, prévia e remoção antes do envio */
  inputAnexos.addEventListener('change', () => {
    const problemas = [];
    for (const arquivo of inputAnexos.files) {
      const tipo = TIPOS_ARQUIVO[arquivo.type];
      if (!tipo) problemas.push(`“${arquivo.name}” não é um formato aceito.`);
      else if (arquivo.size > LIMITE_MB[tipo] * 1024 * 1024) problemas.push(`“${arquivo.name}” passa de ${LIMITE_MB[tipo]} MB.`);
      else if (arquivos.length >= MAX_ARQUIVOS) problemas.push(`O limite é de ${MAX_ARQUIVOS} arquivos.`);
      else arquivos.push({ nome: arquivo.name, tipo, url: URL.createObjectURL(arquivo) });
    }
    inputAnexos.value = '';
    setErro('anexos', problemas.join(' '));
    renderizarPrevias();
  });

  function renderizarPrevias() {
    listaPrevias.innerHTML = '';
    arquivos.forEach((arquivo, indice) => {
      const item = document.createElement('li');
      item.className = 'previa';

      const midia = document.createElement(arquivo.tipo === 'imagem' ? 'img' : 'video');
      midia.src = arquivo.url;
      if (arquivo.tipo === 'imagem') {
        midia.alt = `Prévia da imagem ${arquivo.nome}`;
      } else {
        midia.muted = true;
        midia.preload = 'metadata';
        midia.setAttribute('aria-label', `Prévia do vídeo ${arquivo.nome}`);
      }

      const nome = document.createElement('span');
      nome.className = 'previa-nome';
      nome.textContent = arquivo.nome;

      const remover = document.createElement('button');
      remover.type = 'button';
      remover.className = 'previa-remover';
      remover.setAttribute('aria-label', `Remover ${arquivo.nome}`);
      remover.innerHTML = svg('<path d="M6 6l12 12M18 6 6 18"/>', 'ico-sm');
      remover.addEventListener('click', () => {
        URL.revokeObjectURL(arquivo.url);
        arquivos.splice(indice, 1);
        renderizarPrevias();
        setErro('anexos', '');
        inputAnexos.focus();
      });

      item.append(midia, nome, remover);
      listaPrevias.append(item);
    });
  }

  /* Limpeza do formulário: o evento "reset" ocorre antes da limpeza dos campos */
  form.addEventListener('reset', () => {
    setTimeout(() => {
      arquivos.forEach(arquivo => URL.revokeObjectURL(arquivo.url));
      arquivos = [];
      renderizarPrevias();
      form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
      form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
      form.querySelectorAll('.erro').forEach(p => { p.textContent = ''; });
      grade.querySelectorAll('.cat-opcao').forEach(l => l.classList.remove('selecionada'));
      blocoIdentidade.hidden = false;
      avisoForm.textContent = '';
      atualizarContador();
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const ids = ['categoria', 'rua', 'bairro', 'descricao', ...(anonimo.checked ? [] : ['nome', 'email', 'telefone'])];
    const invalidos = ids.filter(id => !validarCampo(id));

    if (invalidos.length) {
      avisoForm.textContent = 'Revise os campos destacados antes de enviar.';
      const primeiro = invalidos[0];
      const alvo = primeiro === 'categoria' ? form.querySelector('input[name="categoria"]') : document.getElementById(primeiro);
      alvo.focus();
      return;
    }
    avisoForm.textContent = '';
    mostrarRevisao(coletar());
  });

  function coletar() {
    const valor = id => document.getElementById(id).value.trim();
    return {
      categoria: form.querySelector('input[name="categoria"]:checked').value,
      rua: valor('rua'),
      numero: valor('numero'),
      bairro: valor('bairro'),
      referencia: valor('referencia'),
      descricao: valor('descricao'),
      identificacao: anonimo.checked ? 'anonima' : 'identificada',
      anexos: arquivos.length,
    };
  }

  /* Confirmação antes do envio */
  function mostrarRevisao(dados) {
    abrirModal(`
      <h2 id="modal-titulo" tabindex="-1">Revise sua ocorrência</h2>
      <p class="ajuda">Depois do envio, a ocorrência não poderá ser alterada.</p>
      <dl class="dados">
        <div><dt>Tipo</dt><dd>${esc(nomeCategoria(dados.categoria))}</dd></div>
        <div><dt>Identificação</dt><dd>${dados.identificacao === 'anonima' ? 'Anônima' : 'Identificada (o contato não é salvo nesta demonstração)'}</dd></div>
        <div class="larga"><dt>Local</dt><dd>${esc(textoLocal(dados))}</dd></div>
        <div class="larga"><dt>Descrição</dt><dd>${esc(dados.descricao)}</dd></div>
        <div><dt>Anexos</dt><dd>${dados.anexos} arquivo(s)</dd></div>
      </dl>
      <div class="acoes">
        <button type="button" class="btn btn-ghost" data-fechar>Voltar e editar</button>
        <button type="button" class="btn btn-primary" id="btn-enviar">Confirmar envio</button>
      </div>`);
    document.getElementById('btn-enviar').addEventListener('click', e => registrar(dados, e.currentTarget));
  }

  function gerarProtocolo() {
    const ano = new Date().getFullYear();
    let protocolo;
    do {
      const codigo = Array.from({ length: 6 }, () => ALFABETO[Math.floor(Math.random() * ALFABETO.length)]).join('');
      protocolo = `CA-${ano}-${codigo}`;
    } while (ocorrencias.some(o => o.protocolo === protocolo));
    return protocolo;
  }

  function registrar(dados, botao) {
    botao.disabled = true;
    botao.textContent = 'Registrando…';
    setTimeout(() => {
      const ocorrencia = {
        protocolo: gerarProtocolo(),
        ...dados,
        status: 'pendente',
        criadoEm: new Date().toISOString(),
        historico: [],
      };
      ocorrencias.push(ocorrencia);
      persistir();
      form.reset();
      mostrarSucesso(ocorrencia);
    }, 700);
  }

  function mostrarSucesso(o) {
    abrirModal(`
      ${svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 'sucesso')}
      <h2 id="modal-titulo" tabindex="-1">Denúncia registrada com sucesso</h2>
      <p>Guarde o número de protocolo. Ele permite acompanhar o andamento da ocorrência na aba Acompanhar.</p>
      <p class="protocolo">${esc(o.protocolo)}</p>
      <dl class="dados">
        <div><dt>Data do registro</dt><dd>${formatarData(o.criadoEm)}</dd></div>
        <div><dt>Tipo</dt><dd>${esc(nomeCategoria(o.categoria))}</dd></div>
        <div class="larga"><dt>Local</dt><dd>${esc(textoLocal(o))}</dd></div>
        <div><dt>Status inicial</dt><dd>${badge(o.status)}</dd></div>
      </dl>
      <div class="acoes">
        <button type="button" class="btn btn-ghost" data-fechar>Fechar</button>
        <a class="btn btn-primary" href="#acompanhar">Consultar andamento</a>
      </div>`);
  }

  /* ---------- Consulta por protocolo (somente leitura) ---------- */
  const formConsulta = document.getElementById('form-consulta');
  const campoProtocolo = document.getElementById('protocolo');
  const resultado = document.getElementById('resultado');

  formConsulta.addEventListener('submit', e => {
    e.preventDefault();
    const protocolo = campoProtocolo.value.trim().toUpperCase();
    campoProtocolo.value = protocolo;

    const valido = setErro('protocolo', PROTOCOLO_RE.test(protocolo) ? '' : 'Formato inválido. Use o protocolo recebido, como CA-2026-7H3KQ2.');
    if (!valido) {
      resultado.innerHTML = '';
      campoProtocolo.focus();
      return;
    }

    const ocorrencia = ocorrencias.find(o => o.protocolo === protocolo);
    resultado.innerHTML = ocorrencia
      ? renderizarConsulta(ocorrencia)
      : `<div class="card vazio">
           <h2 tabindex="-1">Nenhuma ocorrência encontrada</h2>
           <p>Confira o número digitado. Os protocolos são salvos apenas neste navegador.</p>
         </div>`;
    resultado.querySelector('h2').focus();
  });

  document.getElementById('acompanhar').addEventListener('click', e => {
    const exemplo = e.target.closest('[data-exemplo]');
    if (!exemplo) return;
    campoProtocolo.value = exemplo.dataset.exemplo;
    formConsulta.requestSubmit();
  });

  function renderizarConsulta(o) {
    const etapas = [
      { status: 'pendente', titulo: 'Ocorrência registrada', texto: 'Recebida e aguardando análise.' },
      { status: 'atendimento', titulo: 'Em atendimento', texto: 'A equipe responsável analisa ou executa o serviço.' },
      { status: 'resolvido', titulo: 'Resolvida', texto: 'O problema foi marcado como solucionado.' },
    ];
    const atual = ORDEM_STATUS.indexOf(o.status);

    const itens = etapas.map((etapa, i) => {
      const estado = i === 0 || i < atual || (i === atual && i === 2)
        ? 'concluida'
        : i === atual ? 'andamento' : 'aguardando';
      const rotulo = { concluida: 'Concluída', andamento: 'Em andamento', aguardando: 'Aguardando' }[estado];
      const data = i === 0 ? o.criadoEm : ultimaData(o, etapa.status);
      return `
        <li class="${estado}">
          <p class="etapa">${etapa.titulo}<small>${rotulo}</small></p>
          <p class="ajuda">${etapa.texto}${data ? ` · ${formatarData(data)}` : ''}</p>
        </li>`;
    }).join('');

    return `
      <article class="card" aria-labelledby="res-protocolo">
        <div class="resultado-topo">
          <div>
            <p class="ajuda">Número do protocolo</p>
            <h2 id="res-protocolo" tabindex="-1">${esc(o.protocolo)}</h2>
          </div>
          ${badge(o.status)}
        </div>
        <dl class="dados">
          <div><dt>Tipo</dt><dd>${esc(nomeCategoria(o.categoria))}</dd></div>
          <div><dt>Registrada em</dt><dd>${formatarData(o.criadoEm)}</dd></div>
          <div class="larga"><dt>Local</dt><dd>${esc(textoLocal(o))}</dd></div>
          <div class="larga"><dt>Descrição</dt><dd>${esc(o.descricao)}</dd></div>
        </dl>
        <h3>Andamento do atendimento</h3>
        <ol class="linha-tempo">${itens}</ol>
        <p class="ajuda">Consulta somente leitura. A ocorrência não pode ser editada nem excluída.</p>
      </article>`;
  }

  /* ---------- Painel de demonstração (simulação administrativa) ---------- */
  const tabelaDemo = document.getElementById('tabela-demo');
  const filtro = document.getElementById('filtro');
  const avisoDemo = document.getElementById('aviso-demo');

  function renderizarDemo() {
    const lista = ocorrencias.filter(o => !filtro.value || o.status === filtro.value);
    tabelaDemo.innerHTML = lista.length
      ? lista.map(o => `
          <tr>
            <th scope="row">${esc(o.protocolo)}</th>
            <td>${esc(nomeCategoria(o.categoria))}</td>
            <td>${esc(o.bairro)}</td>
            <td>${formatarData(o.criadoEm)}</td>
            <td>${badge(o.status)}</td>
            <td>
              <label class="sr-only" for="sim-${esc(o.protocolo)}">Simular status de ${esc(o.protocolo)}</label>
              <select id="sim-${esc(o.protocolo)}" data-protocolo="${esc(o.protocolo)}">
                ${ORDEM_STATUS.map(s => `<option value="${s}"${s === o.status ? ' selected' : ''}>${STATUS[s].nome}</option>`).join('')}
              </select>
            </td>
          </tr>`).join('')
      : '<tr><td class="vazio" colspan="6">Nenhuma ocorrência com este status.</td></tr>';
  }

  filtro.addEventListener('change', renderizarDemo);

  tabelaDemo.addEventListener('change', e => {
    const select = e.target.closest('select[data-protocolo]');
    if (!select) return;
    const o = ocorrencias.find(x => x.protocolo === select.dataset.protocolo);
    if (!o) return;
    o.status = select.value;
    o.historico.push({ status: o.status, data: new Date().toISOString() });
    persistir();
    renderizarDemo();
    avisoDemo.textContent = `Status de ${o.protocolo} alterado para “${STATUS[o.status].nome}” (simulação).`;
    document.getElementById(`sim-${o.protocolo}`)?.focus();
  });

  document.getElementById('restaurar').addEventListener('click', () => {
    perguntar(
      'Restaurar exemplos?',
      'As ocorrências registradas neste navegador serão removidas e os exemplos voltarão ao estado original.',
      'Restaurar',
      () => {
        ocorrencias = clonar(EXEMPLOS);
        persistir();
        renderizarDemo();
        avisoDemo.textContent = 'Exemplos restaurados.';
      },
    );
  });

  /* ---------- Inicialização ---------- */
  aplicarAcessibilidade();
  atualizarContador();
  mostrarRota(rotaDoHash() ?? 'inicio');
})();
