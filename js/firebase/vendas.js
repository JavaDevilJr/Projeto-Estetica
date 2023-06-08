// Obtém a data atual
var dataAtual = new Date();

// Define o campo "Data de Emissão" com o valor padrão de hoje
var dataEmissaoInput = document.getElementById('dataEmissao');
dataEmissaoInput.value = dataAtual.toISOString().split('T')[0];

// Preencher o seletor de cliente
var clienteSelect = document.getElementById('cliente')
async function loadClientes() {
    // Limpar o combobox de clientes antes de carregar os clientes            
    try {
        const snapshot = await firebase.database().ref('clientes').orderByChild('nome').once('value');
        snapshot.forEach(item => {
            let option = document.createElement("option");
            option.value = item.ref._delegate._path.pieces_[1]
            option.text = item.val().nome.toUpperCase();
            clienteSelect.appendChild(option)
        });
    } catch (error) {
        console.log("Erro ao carregar clientes:", error)
        let option = document.createElement("option")
        option.value = 'error'
        option.text = 'Erro ao carregar os clientes'
        clienteSelect.appendChild(option)
    }
}


// Preencher o seletor de serviço
var servicoSelect = document.getElementById('servico')
var valorServico = document.getElementById('valor')
// Adicionar evento de alteração ao combobox de serviço
servicoSelect.addEventListener('change', function () {
    let selectedService = servicoSelect.value;
    let selectedValue = servicoSelect.options[servicoSelect.selectedIndex].text
    // Preencher o campo "valor" com o valor do serviço selecionado
    
});

async function loadServicos() {           
    try {
        const snapshot = await firebase.database().ref('servicos').orderByChild('servico').once('value');
        snapshot.forEach(item => {
            let option = document.createElement("option");
            option.value = item.ref._delegate._path.pieces_[1];
            option.text = item.val().servico.toUpperCase();
            servicoSelect.appendChild(option);
            
        });
    } catch (error) {
        console.log("Erro ao carregar serviços:", error);
        let option = document.createElement("option");
        option.value = 'error'
        option.text = 'Erro ao carregar os serviços'
        servicoSelect.appendChild(option);
    }
}




// Array para armazenar os serviços prestados
var servicosPrestados = [];

// Adicionar serviço ao array servicosPrestados e atualizar a tabela
function adicionarServico() {
    var dataEmissao = document.getElementById('dataEmissao').value
    var cliente = document.getElementById('cliente').options[document.getElementById('cliente').selectedIndex].text
    var descricao = document.getElementById('servico').options[document.getElementById('servico').selectedIndex].text
    var quantidade = document.getElementById('quantidade').value
    var valorUnitario = document.getElementById('valor').value
    var subtotal = (quantidade * valorUnitario).toFixed(2)

    if (!cliente) {
        alert("⚠️ Selecione o cliente!");
        return;
      }
    if (!descricao) {
        alert("⚠️ Selecione o serviço!");
        return;
      }
    
      // Verificar se quantidade e valorUnitario são números válidos
      if (quantidade <= 0 || isNaN(quantidade)) {
        alert("⚠️ A quantidade deve ser um número maior que zero!");
        return;
      }
    
      if (valorUnitario <= 0 || isNaN(valorUnitario)) {
        alert("⚠️ O valor deve ser um número maior que zero!");
        return;
      }

    servicosPrestados.push({
        dataEmissao: dataEmissao,
        cliente: cliente,
        descricao: descricao,
        quantidade: quantidade,
        valorUnitario: valorUnitario,
        subtotal: subtotal
    })

    

    // Limpar os campos
    document.getElementById('valor').value = '';

    // Atualizar a tabela
    atualizarTabela();
}

// Atualizar a tabela com os serviços prestados
function atualizarTabela() {
    let tabela = document.getElementById('servicosPrestadosTableBody')
    tabela.innerHTML = ''
    var valorTotal = 0            

    for (let i = 0; i < servicosPrestados.length; i++) {
        let servico = servicosPrestados[i];
        let novaLinha = tabela.insertRow()
        novaLinha.insertCell().textContent = new Date(servico.dataEmissao).toLocaleDateString("pt-BR", { timeZone: "UTC" })
        novaLinha.insertCell().innerHTML = '<small>' + servico.cliente + '</small>'
        novaLinha.insertCell().innerHTML = '<small>' + servico.descricao + '</small>'
        novaLinha.insertCell().innerHTML = '<small>' + servico.quantidade + '</small>'
        novaLinha.insertCell().innerHTML = '<small>' + servico.valorUnitario + '</small>'
        novaLinha.insertCell().innerHTML = '<small>' + servico.subtotal + '</small>'
        valorTotal += parseFloat(servico.subtotal)                
    }
    document.getElementById('valorTotal').innerHTML = parseFloat(valorTotal).toFixed(2);
}

// Evento de clique para adicionar um serviço
let adicionarServicoButton = document.getElementById('adicionarServico');
adicionarServicoButton.addEventListener('click', function () {
    adicionarServico();
});

// Evento de envio do formulário para salvar o pedido no Firebase
document.getElementById('pedidoForm').addEventListener('submit', function (event) {
    event.preventDefault();

    var dataEmissao = document.getElementById('dataEmissao').value;
    var cliente = document.getElementById('cliente').value;

    // Objeto para armazenar os dados do pedido
    var dadosPedido = {
        dataEmissao: dataEmissao,
        valorTotal: document.getElementById('valorTotal').innerHTML,
        cliente: cliente,
        servicosPrestados: servicosPrestados
    };

    // Salvar o pedido no Firebase
    firebase.database().ref('pedidos').push(dadosPedido)
    .then(function (docRef) {   
        alerta('Pedido salvo com sucesso!', 'success');
        // Limpar os campos
        document.getElementById('pedidoForm').reset() //limpa o form
        servicosPrestados = [];
        atualizarTabela();
    })
    .catch(function (error) {
        alerta('Erro ao salvar o pedido: ' + error, 'danger');
    });
});
//botão para imprimir
const btnImprimir = document.getElementById("btnImprimir");

btnImprimir.addEventListener("click",(evt)=>{
  const conteudo = document.getElementById('tabelaVendas').innerHTML

  let estilo = "<style>"
  estilo += "table {width: 100%;font: 25px Calibri;}"
  estilo += "table, tr, th {border: solid 2px #888; border-collapse: collapse;";
  estilo += "padding: 4px 8px;text-align: center;}";
  estilo += "</style>";

  const win = window.open('','', 'height=700,width=700');

  win.document.write('<html><head>');
  win.document.write('<title>Nathália Pimenta Estética</title>');
  win.document.write(estilo);
  win.document.write('</head>');
  win.document.write('<legend> Nathália Pimenta Estética</legend><br><br>');
  win.document.write('<body>');
  win.document.write(conteudo);
  win.document.write('</body></html>');
  win.print()
})