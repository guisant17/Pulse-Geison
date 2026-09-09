/* PULSE — Busca e categorias. Funciona abrindo index.html diretamente. */
'use strict';

(() => {
  const catalogo = document.querySelector('#catalogo');
  const controles = document.querySelector('#controles-catalogo');
  const busca = document.querySelector('#busca-produto');
  const categoria = document.querySelector('#filtro-categoria');
  const ordem = document.querySelector('#ordenar-produtos');
  const limpar = document.querySelector('#limpar-filtros');
  const contador = document.querySelector('#contador-produtos');
  const vazio = document.querySelector('#sem-resultados');

  if (!catalogo || !controles || !busca || !categoria || !limpar || !contador || !vazio) return;

  // Ignora diferenças de maiúsculas, acentos e hífens na busca.
  const normalizar = (texto) => texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Os produtos continuam no HTML: não é necessário manter duas listas.
  const secoes = [...catalogo.querySelectorAll(':scope > section')].map((secao) => ({
    elemento: secao,
    produtos: [...secao.querySelectorAll('.produto')].map((produto) => ({
      elemento: produto,
      nome: produto.querySelector('h4').textContent,
      preco: Number(produto.querySelector('.preco').textContent.replace(/[^0-9,]/g, '').replace(',', '.')),
      texto: normalizar([
        secao.querySelector('h3')?.textContent,
        produto.querySelector('h4')?.textContent,
        produto.querySelector('dl')?.textContent,
        produto.querySelector('.etiqueta')?.textContent,
      ].join(' ')),
    })),
  }));

  function filtrar() {
    const termos = normalizar(busca.value).split(' ').filter(Boolean);
    let total = 0;

    secoes.forEach((secao) => {
      let visiveis = 0;
      const ordenados = [...secao.produtos];
      if (ordem.value === 'menor') ordenados.sort((a,b) => a.preco - b.preco);
      if (ordem.value === 'maior') ordenados.sort((a,b) => b.preco - a.preco);
      if (ordem.value === 'nome') ordenados.sort((a,b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      ordenados.forEach(p => secao.elemento.querySelector('.grade-produtos').append(p.elemento));
      secao.produtos.forEach((produto) => {
        const categoriaCorreta = categoria.value === 'todos' || categoria.value === secao.elemento.id;
        const corresponde = categoriaCorreta && termos.every((termo) => produto.texto.includes(termo));
        produto.elemento.hidden = !corresponde;
        if (corresponde) visiveis += 1;
      });
      secao.elemento.hidden = visiveis === 0;
      total += visiveis;
    });

    contador.textContent = total === 1 ? '1 produto encontrado' : `${total} produtos encontrados`;
    vazio.hidden = total > 0;
    limpar.disabled = busca.value === '' && categoria.value === 'todos' && ordem.value === 'padrao';
  }

  ordem.addEventListener('change', filtrar);
  busca.addEventListener('input', filtrar);
  categoria.addEventListener('change', filtrar);
  limpar.addEventListener('click', () => {
    busca.value = '';
    categoria.value = 'todos';
    ordem.value = 'padrao';
    filtrar();
    busca.focus();
  });

  // Libera a seção de destino antes da navegação, mesmo após uma busca vazia.
  document.querySelectorAll('.cabecalho nav a').forEach((link) => {
    link.addEventListener('click', () => {
      const destino = link.getAttribute('href')?.slice(1);
      if (!secoes.some((secao) => secao.elemento.id === destino)) return;
      busca.value = '';
      categoria.value = destino;
      filtrar();
    });
  });

  // Explorar o catálogo novamente mostra todos os produtos.
  document.querySelector('.apresentacao a')?.addEventListener('click', () => {
    busca.value = '';
    categoria.value = 'todos';
    ordem.value = 'padrao';
    filtrar();
  });

  controles.hidden = false;
  contador.hidden = false;
  filtrar();
})();

