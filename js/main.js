// ==========================================
// 1. DADOS LOCAIS (STORAGE)
// ==========================================
var projetosIniciais = [
  {
    id: 1,
    titulo: "Apoio Comunitário",
    descricao: "Distribuição de cestas básicas e apoio às famílias da região.",
    imagem: "https://via.placeholder.com/300x180"
  },
  {
    id: 2,
    titulo: "Oficinas Educacionais",
    descricao: "Aulas de reforço escolar e informática para crianças e jovens.",
    imagem: "https://via.placeholder.com/300x180"
  },
  {
    id: 3,
    titulo: "Cuidado Animal",
    descricao: "Resgate, vacinação e feiras de adoção para animais abandonados.",
    imagem: "https://via.placeholder.com/300x180"
  }
];

function obterProjetosSalvos() {
  var dadosSalvos = localStorage.getItem('ong_projetos');
  if (!dadosSalvos) {
    localStorage.setItem('ong_projetos', JSON.stringify(projetosIniciais));
    return projetosIniciais;
  }
  return JSON.parse(dadosSalvos);
}

function salvarContato(novoContato) {
  var contatosSalvos = JSON.parse(localStorage.getItem('ong_contatos')) || [];
  contatosSalvos.push(novoContato);
  localStorage.setItem('ong_contatos', JSON.stringify(contatosSalvos));
}

// ==========================================
// 2. RENDERING DO GRÁFICO (CHART.JS)
// ==========================================
var instanciaGrafico = null;

function inicializarGrafico() {
  var ctx = document.getElementById('graficoDoacoes');
  
  if (!ctx) return;

  if (instanciaGrafico) {
    instanciaGrafico.destroy();
    instanciaGrafico = null;
  }

  if (typeof Chart === 'undefined') {
    console.error('Biblioteca Chart.js ainda não foi carregada no navegador.');
    return;
  }

  instanciaGrafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Alimentos', 'Aulas', 'Resgates'],
      datasets: [{
        label: 'Meta Atingida (%)',
        data: [85, 60, 40],
        backgroundColor: ['#1b4d3e', '#e07a5f', '#2196F3'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}

// ==========================================
// 3. MÁSCARAS E FORMULÁRIO
// ==========================================
function aplicarMascaras() {
  var cpfInput = document.getElementById('CPF');
  if (cpfInput) {
    cpfInput.addEventListener('input', function(e) {
      var v = e.target.value.replace(/\D/g, '');
      if (v.length > 11) v = v.substring(0, 11); // Limitação de 11 dígitos numéricos
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
      v = v.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
      e.target.value = v;
    });
  }

  var telInput = document.getElementById('Telefone');
  if (telInput) {
    telInput.addEventListener('input', function(e) {
      var v = e.target.value.replace(/\D/g, '');
      if (v.length > 11) v = v.substring(0, 11); // Limitação para até 11 dígitos numéricos (DDD + NÚMERO)
      v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
      if (v.length > 13) {
        v = v.replace(/(\d{5})(\d{4})$/, '$1-$2');
      } else {
        v = v.replace(/(\d{4})(\d{4})$/, '$1-$2');
      }
      e.target.value = v;
    });
  }
}

function exibirToast(mensagem) {
  var toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast';
    document.body.appendChild(toastContainer);
  }
  toastContainer.innerHTML = '<span>✓ ' + mensagem + '</span>';
  toastContainer.style.display = 'flex';
  
  setTimeout(function() {
    toastContainer.style.display = 'none';
  }, 4000);
}

function inicializarValidacaoFormulario() {
  var form = document.getElementById('formContato');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var isFormValid = true;

    var nomeInput = document.getElementById('nome');
    var emailInput = document.getElementById('email');
    var cpfInput = document.getElementById('CPF');
    var telInput = document.getElementById('Telefone');
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validação Nome
    if (nomeInput && nomeInput.value.trim() === '') {
      exibirErro(nomeInput, 'O campo nome é obrigatório.');
      isFormValid = false;
    } else if (nomeInput) {
      removerErro(nomeInput);
    }

    // Validação E-mail
    if (emailInput && emailInput.value.trim() === '') {
      exibirErro(emailInput, 'O campo e-mail é obrigatório.');
      isFormValid = false;
    } else if (emailInput && !emailRegex.test(emailInput.value.trim())) {
      exibirErro(emailInput, 'Por favor, insira um e-mail válido.');
      isFormValid = false;
    } else if (emailInput) {
      removerErro(emailInput);
    }

    // Validação CPF
    if (cpfInput && cpfInput.value.trim() !== '' && cpfInput.value.length < 14) {
      exibirErro(cpfInput, 'CPF incompleto.');
      isFormValid = false;
    } else if (cpfInput) {
      removerErro(cpfInput);
    }

    if (isFormValid) {
      salvarContato({
        nome: nomeInput ? nomeInput.value.trim() : '',
        email: emailInput ? emailInput.value.trim() : '',
        cpf: cpfInput ? cpfInput.value : '',
        telefone: telInput ? telInput.value : '',
        data: new Date().toISOString()
      });

      var msgSucesso = document.getElementById('feedback-sucesso');
      if (msgSucesso) {
        msgSucesso.textContent = 'Formulário enviado e salvo com sucesso!';
        msgSucesso.style.display = 'block';
      }

      exibirToast('Obrigado! Seu cadastro foi realizado com sucesso.');
      form.reset();
    }
  });
}

function exibirErro(inputElement, mensagem) {
  var formGroup = inputElement.closest('.form-group') || inputElement.parentElement;
  var errorSpan = formGroup ? formGroup.querySelector('.error-message') : null;
  if (formGroup) {
    formGroup.classList.add('input-error');
  }
  if (errorSpan) errorSpan.textContent = mensagem;
}

function removerErro(inputElement) {
  var formGroup = inputElement.closest('.form-group') || inputElement.parentElement;
  var errorSpan = formGroup ? formGroup.querySelector('.error-message') : null;
  if (formGroup) {
    formGroup.classList.remove('input-error');
  }
  if (errorSpan) errorSpan.textContent = '';
}

// ==========================================
// 4. ROUTER SPA E HTML COMPLETO DAS SEÇÕES
// ==========================================
function gerarHTMLProjetos() {
  var projetos = obterProjetosSalvos();
  return projetos.map(function(projeto) {
    return '<article class="card-projeto">' +
      '<h3>' + projeto.titulo + '</h3>' +
      '<p>' + projeto.descricao + '</p>' +
    '</article>';
  }).join('');
}

function obterFormularioHTML() {
  return `
    <section id="voluntariado" class="container secao-espacada">
      <h2>Seja um Voluntário / Faça uma Doação</h2>
      <p>Preencha o formulário abaixo para se candidatar como voluntário em nossos projetos:</p>

      <form id="formContato" class="form-container" action="#" method="POST" novalidate>
        <fieldset>
          <legend>Dados Pessoais</legend>

          <div class="form-group">
            <label for="nome">Nome Completo:</label>
            <input type="text" id="nome" name="nome" placeholder="Digite seu nome">
            <span class="error-message"></span>
          </div>

          <div class="form-group">
            <label for="email">E-mail:</label>
            <input type="email" id="email" name="email" placeholder="seu@email.com">
            <span class="error-message"></span>
          </div>

          <div class="form-group">
            <label for="data-nascimento">Data de Nascimento:</label>
            <input type="date" id="data-nascimento" name="data_nascimento">
          </div>

          <div class="form-group">
            <label for="Telefone">Telefone:</label>
            <input type="tel" id="Telefone" name="Telefone" placeholder="(11) 99999-9999" maxlength="15">
            <span class="error-message"></span>
          </div>

          <div class="form-group">
            <label for="CPF">CPF:</label>
            <input type="text" id="CPF" name="CPF" placeholder="000.000.000-00" maxlength="14">
            <span class="error-message"></span>
          </div>
        </fieldset>

        <fieldset>
          <legend>Endereço de Correspondência</legend>

          <div class="form-group">
            <label for="CEP">CEP:</label>
            <input type="text" id="CEP" name="CEP" placeholder="00000-000" maxlength="9">
          </div>

          <div class="form-group">
            <label for="logradouro">Rua/Avenida:</label>
            <input type="text" id="logradouro" name="logradouro">
          </div>

          <div class="form-group">
            <label for="numero">Número:</label>
            <input type="number" id="numero" name="numero">
          </div>

          <div class="form-group">
            <label for="cidade">Cidade:</label>
            <input type="text" id="cidade" name="cidade">
          </div>

          <div class="form-group">
            <label for="estado">Estado (UF):</label>
            <input type="text" id="estado" name="estado" maxlength="2">
          </div>
        </fieldset>

        <fieldset>
          <legend>Áreas de Interesse no Voluntariado</legend>
          <p>Selecione as áreas em que gostaria de atuar:</p>
          <p><input type="checkbox" id="pedagogico" name="interesses[]" value="pedagogico"> <label for="pedagogico" style="display:inline;">Apoio pedagógico</label></p>
          <p><input type="checkbox" id="eventos" name="interesses[]" value="eventos"> <label for="eventos" style="display:inline;">Organização de eventos</label></p>
          <p><input type="checkbox" id="comunicacao" name="interesses[]" value="comunicacao"> <label for="comunicacao" style="display:inline;">Gestão de redes sociais</label></p>
        </fieldset>

        <br>
        <button type="submit" class="btn">Enviar Cadastro</button>
        <div id="feedback-sucesso" class="alert alert-success" style="display:none; margin-top:15px;"></div>
      </form>
    </section>
  `;
}

var routes = {
  '/': `
    <section id="sobre" class="container secao-espacada">
      <h2>Sobre a ONG</h2>
      <p>Nossa ONG ajuda pessoas da comunidade com projetos sociais e educativos para promover a inclusão e o desenvolvimento local.</p>
    </section>

    <section id="grafico-secao" class="container secao-espacada">
      <h2>Impacto das Nossas Ações</h2>
      <div class="grafico-container">
        <canvas id="graficoDoacoes"></canvas>
      </div>
    </section>

    <section id="projetos" class="container secao-espacada">
      <h2>Nossos Projetos Sociais</h2>
      <div id="lista-projetos" class="grid-projetos">${gerarHTMLProjetos()}</div>
    </section>

    ${obterFormularioHTML()}

    <section id="doacoes" class="container secao-espacada">
      <h2>Faça uma Doação</h2>
      <p>Sua contribuição financeira ajuda a manter nossos projetos ativos e impactar mais famílias.</p>
      <button type="button" class="btn btn-secondary">Fazer Doação via PIX</button>
    </section>
  `,
  '/projetos': `
    <section id="projetos" class="container secao-espacada">
      <h2>Nossos Projetos Sociais</h2>
      <div id="lista-projetos" class="grid-projetos">${gerarHTMLProjetos()}</div>
    </section>
  `,
  '/doar': obterFormularioHTML(),
  '/contato': `
    <section id="contato" class="container secao-espacada">
      <h2>Contato</h2>
      <p>E-mail: contato@ong.org</p>
      <p>Telefone: (11) 99999-9999</p>
      <p>Endereço: Rua Principal, 123 - São Paulo, SP</p>
    </section>
  `
};

function navigateTo(url) {
  window.history.pushState(null, null, url);
  renderView(url);
}

function renderView(path) {
  var appContainer = document.getElementById('app');
  if (!appContainer) return;

  var routeKey = routes[path] ? path : '/';
  appContainer.innerHTML = routes[routeKey];

  if (routeKey === '/' || routeKey === '/doar') {
    inicializarValidacaoFormulario();
    aplicarMascaras();
  }

  if (routeKey === '/') {
    setTimeout(function() {
      inicializarGrafico();
    }, 100);
  }
}

// ==========================================
// 5. INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
  var menuBtn = document.getElementById('menuBtn');
  var navList = document.getElementById('navList');

  if (menuBtn && navList) {
    menuBtn.addEventListener('click', function() {
      navList.classList.toggle('active');
    });
  }

  document.addEventListener('click', function(e) {
    var targetLink = e.target.closest('[data-link]');
    if (targetLink) {
      e.preventDefault();
      var href = targetLink.getAttribute('href');
      navigateTo(href);
    }
  });

  window.addEventListener('popstate', function() {
    renderView(window.location.pathname);
  });

  renderView(window.location.pathname);
});