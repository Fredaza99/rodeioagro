
// Declarar 'clients' apenas uma vez no topo do arquivo
let clients = JSON.parse(localStorage.getItem('clients')) || [];
let stock = JSON.parse(localStorage.getItem('stock')) || [];

// Função para salvar clientes no LocalStorage
function saveClientsToLocalStorage() {
  localStorage.setItem('clients', JSON.stringify(clients));
}

// Função para salvar estoque no LocalStorage
function saveStockToLocalStorage() {
  localStorage.setItem('stock', JSON.stringify(stock));
}

// Adicionar cliente via formulário na página principal
if (window.location.pathname.includes('index.html')) {
  document.getElementById('clientForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const clientName = document.getElementById('clientName').value;
    const productName = document.getElementById('productName').value;
    const entryDate = document.getElementById('entryDate').value;
    const entryQuantity = parseInt(document.getElementById('entryQuantity').value);
    const exitQuantity = parseInt(document.getElementById('exitQuantity').value || 0);
    const exitDate = document.getElementById('exitDate').value || 'Não definido';
    const saldo = entryQuantity - exitQuantity;

    const client = { clientName, productName, entryDate, entryQuantity, exitQuantity, saldo, exitDate };
    clients.push(client);
    saveClientsToLocalStorage();
    window.location.href = 'pedidos.html';
  });
}

// Carregar pedidos na página de Lista de Pedidos
if (window.location.pathname.includes('pedidos.html')) {
  const table = document.getElementById('ordersTable').getElementsByTagName('tbody')[0];
  table.innerHTML = '';

  if (clients.length > 0) {
    clients.forEach((client, index) => {
      const newRow = table.insertRow();
      newRow.insertCell(0).textContent = client.clientName;
      newRow.insertCell(1).textContent = client.productName;
      newRow.insertCell(2).textContent = client.entryDate;
      newRow.insertCell(3).textContent = client.exitDate;
      newRow.insertCell(4).textContent = client.entryQuantity;
      newRow.insertCell(5).textContent = client.exitQuantity;
      newRow.insertCell(6).textContent = client.saldo;

      const deleteCell = newRow.insertCell(7);
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Excluir';
      deleteButton.classList.add('delete-btn');
      deleteButton.addEventListener('click', () => {
        clients.splice(index, 1);
        saveClientsToLocalStorage();
        window.location.reload();
      });
      deleteCell.appendChild(deleteButton);
    });
  }

  document.getElementById('orderSearchInput').addEventListener('input', function () {
    const filter = this.value.toLowerCase();
    const rows = document.getElementById('ordersTable').getElementsByTagName('tr');
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].getElementsByTagName('td');
      let match = false;
      for (let cell of cells) {
        if (cell.textContent.toLowerCase().includes(filter)) {
          match = true;
          break;
        }
      }
      rows[i].style.display = match ? '' : 'none';
    }
  });
}

// Carregar clientes e produtos na página de pesquisa de clientes
if (window.location.pathname.includes('cliente.html')) {
  const table = document.getElementById('clientHistoryTable').getElementsByTagName('tbody')[0];
  const productFilterDropdown = document.getElementById('productFilter');

  // Limpar as opções do dropdown antes de preenchê-lo
  productFilterDropdown.innerHTML = '<option value="">Todos os Produtos</option>';

  // Verificar se o estoque está carregado corretamente do localStorage
  stock = JSON.parse(localStorage.getItem('stock')) || [];

  // Populando o dropdown com os produtos do estoque
  stock.forEach(product => {
    const option = document.createElement('option');
    option.value = product.productName;
    option.textContent = product.productName;
    productFilterDropdown.appendChild(option);
  });

  // Função para calcular o saldo total de cada cliente e produto, sem alterar os detalhes das entradas
  function calculateTotalBalance() {
    const totalBalance = {};

    // Agrupar o saldo total por cliente e produto
    clients.forEach((client) => {
      const key = client.clientName + '-' + client.productName;

      if (!totalBalance[key]) {
        totalBalance[key] = client.entryQuantity - client.exitQuantity;
      } else {
        // Mesclar apenas o saldo
        totalBalance[key] += client.entryQuantity - client.exitQuantity;
      }
    });

    return totalBalance; // Retornar o saldo total por cliente e produto
  }

  // Função para carregar e filtrar clientes
  function loadFilteredClients() {
    const filter = document.getElementById('clientSearchInput').value.toLowerCase();
    const selectedProduct = productFilterDropdown.value; // Produto selecionado no dropdown
    table.innerHTML = ''; // Limpar a tabela

    const totalBalance = calculateTotalBalance(); // Obter o saldo total por cliente e produto

    clients.forEach((client) => {
      const clientNameMatches = client.clientName.toLowerCase().includes(filter);
      const productMatches = selectedProduct === "" || client.productName === selectedProduct;

      // Verificar se o cliente e o produto selecionado correspondem aos filtros
      if (clientNameMatches && productMatches) {
        const key = client.clientName + '-' + client.productName;
        const newRow = table.insertRow();
        newRow.insertCell(0).textContent = client.clientName;
        newRow.insertCell(1).textContent = client.productName;
        newRow.insertCell(2).textContent = client.entryDate;  // Mostrar cada data de entrada
        newRow.insertCell(3).textContent = client.exitDate;   // Mostrar cada data de saída
        newRow.insertCell(4).textContent = client.entryQuantity; // Mostrar cada entrada
        newRow.insertCell(5).textContent = client.exitQuantity;  // Mostrar cada saída
        newRow.insertCell(6).textContent = totalBalance[key];  // Mostrar saldo total mesclado
      }
    });
  }

  // Aplicar o filtro quando o usuário digitar no campo de pesquisa ou selecionar um produto
  document.getElementById('clientSearchInput').addEventListener('input', loadFilteredClients);
  productFilterDropdown.addEventListener('change', loadFilteredClients);

  // Carregar os clientes inicialmente sem filtro
  loadFilteredClients();
}

// Adicionar produto ao estoque via formulário
if (window.location.pathname.includes('estoque.html')) {
  document.getElementById('stockForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const productName = document.getElementById('productName').value;
    const productQuantity = parseInt(document.getElementById('productQuantity').value);
    const entryDate = document.getElementById('entryDate').value;

    // Verificar se o produto já existe no estoque
    const product = { productName, productQuantity, entryDate };
    stock.push(product); // Adicionar cada entrada separadamente
    saveStockToLocalStorage();
    window.location.reload(); // Recarregar a página para atualizar a tabela de estoque
  });

  // Função para calcular o total de cada produto
  function calculateTotalStock() {
    const totalStock = {};

    stock.forEach(product => {
      const key = product.productName;

      if (!totalStock[key]) {
        totalStock[key] = {
          totalQuantity: product.productQuantity, // Quantidade total do produto
          entries: [product] // Armazena as entradas individuais
        };
      } else {
        totalStock[key].totalQuantity += product.productQuantity; // Somar quantidade
        totalStock[key].entries.push(product); // Adicionar nova entrada separada
      }
    });

    return totalStock; // Retornar o objeto com o estoque mesclado
  }

  // Preencher a tabela e filtrar produtos
  function loadFilteredStock() {
    const filter = document.getElementById('stockSearchInput').value.toLowerCase();
    const selectedProduct = document.getElementById('stockFilter').value;
    const stockTable = document.getElementById('stockTable').getElementsByTagName('tbody')[0];
    stockTable.innerHTML = ''; // Limpar a tabela

    const totalStock = calculateTotalStock(); // Obter o estoque mesclado

    Object.values(totalStock).forEach((productGroup) => {
      // Se houver um filtro por nome ou produto, aplicá-lo
      const productNameMatches = productGroup.entries[0].productName.toLowerCase().includes(filter);
      const productMatches = selectedProduct === "" || productGroup.entries[0].productName === selectedProduct;

      if (productNameMatches && productMatches) {
        // Adicionar uma linha para cada entrada, mas mostrar o saldo total do produto
        productGroup.entries.forEach(entry => {
          const newRow = stockTable.insertRow();
          newRow.insertCell(0).textContent = entry.productName; // Nome do produto
          newRow.insertCell(1).textContent = productGroup.totalQuantity; // Quantidade total
          newRow.insertCell(2).textContent = entry.entryDate; // Data de entrada
          newRow.insertCell(3).textContent = entry.productQuantity; // Quantidade de entrada

          const deleteCell = newRow.insertCell(4);
          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Excluir';
          deleteButton.classList.add('delete-btn');
          deleteButton.addEventListener('click', () => {
            stock.splice(stock.indexOf(entry), 1); // Remover a entrada específica
            saveStockToLocalStorage();
            window.location.reload();
          });
          deleteCell.appendChild(deleteButton);
        });
      }
    });
  }

  // Função para preencher o dropdown de filtro de produtos
  function populateProductDropdown() {
    const stockFilterDropdown = document.getElementById('stockFilter');
    stockFilterDropdown.innerHTML = '<option value="">Todos os Produtos</option>'; // Resetar o dropdown

    const uniqueProducts = [...new Set(stock.map(product => product.productName))]; // Obter produtos únicos
    uniqueProducts.forEach(productName => {
      const option = document.createElement('option');
      option.value = productName;
      option.textContent = productName;
      stockFilterDropdown.appendChild(option);
    });
  }

  // Aplicar os filtros quando o usuário digitar ou selecionar um produto
  document.getElementById('stockSearchInput').addEventListener('input', loadFilteredStock);
  document.getElementById('stockFilter').addEventListener('change', loadFilteredStock);

  // Preencher o dropdown de produtos
  populateProductDropdown();

  // Carregar o estoque inicialmente sem filtros
  loadFilteredStock();
}








