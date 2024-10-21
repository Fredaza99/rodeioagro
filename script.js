let clients = [];
let stock = [];

// Função para buscar clientes do arquivo JSON no GitHub
function loadClientsFromGitHub() {
  return fetch(https://fredaza99.github.io/rodeioagro/clients.json') // Atualize o URL para o correto
    .then(response => response.json())
    .then(data => {
      clients = data;
      return clients;
    })
    .catch(error => console.error('Erro ao carregar clientes:', error));
}

// Função para buscar estoque do arquivo JSON no GitHub
function loadStockFromGitHub() {
  return fetch('https://seu-usuario.github.io/nome-do-repositorio/stock.json') // Atualize o URL para o correto
    .then(response => response.json())
    .then(data => {
      stock = data;
      return stock;
    })
    .catch(error => console.error('Erro ao carregar estoque:', error));
}
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

    // No salvamento, este código apenas redireciona sem salvar, pois não podemos salvar no JSON remotamente
    window.location.href = 'pedidos.html';
  });
}
if (window.location.pathname.includes('pedidos.html')) {
  const table = document.getElementById('ordersTable').getElementsByTagName('tbody')[0];
  table.innerHTML = '';

  loadClientsFromGitHub().then(clients => {
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
      });
    }
  });

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
if (window.location.pathname.includes('cliente.html')) {
  const table = document.getElementById('clientHistoryTable').getElementsByTagName('tbody')[0];
  const productFilterDropdown = document.getElementById('productFilter');

  // Limpar as opções do dropdown antes de preenchê-lo
  productFilterDropdown.innerHTML = '<option value="">Todos os Produtos</option>';

  loadStockFromGitHub().then(stock => {
    stock.forEach(product => {
      const option = document.createElement('option');
      option.value = product.productName;
      option.textContent = product.productName;
      productFilterDropdown.appendChild(option);
    });
  });

  function calculateTotalBalance() {
    const totalBalance = {};
    clients.forEach((client) => {
      const key = client.clientName + '-' + client.productName;
      if (!totalBalance[key]) {
        totalBalance[key] = client.entryQuantity - client.exitQuantity;
      } else {
        totalBalance[key] += client.entryQuantity - client.exitQuantity;
      }
    });
    return totalBalance;
  }

  function loadFilteredClients() {
    const filter = document.getElementById('clientSearchInput').value.toLowerCase();
    const selectedProduct = productFilterDropdown.value;
    table.innerHTML = '';

    const totalBalance = calculateTotalBalance();
    clients.forEach((client) => {
      const clientNameMatches = client.clientName.toLowerCase().includes(filter);
      const productMatches = selectedProduct === "" || client.productName === selectedProduct;
      if (clientNameMatches && productMatches) {
        const key = client.clientName + '-' + client.productName;
        const newRow = table.insertRow();
        newRow.insertCell(0).textContent = client.clientName;
        newRow.insertCell(1).textContent = client.productName;
        newRow.insertCell(2).textContent = client.entryDate;
        newRow.insertCell(3).textContent = client.exitDate;
        newRow.insertCell(4).textContent = client.entryQuantity;
        newRow.insertCell(5).textContent = client.exitQuantity;
        newRow.insertCell(6).textContent = totalBalance[key];
      }
    });
  }

  document.getElementById('clientSearchInput').addEventListener('input', loadFilteredClients);
  productFilterDropdown.addEventListener('change', loadFilteredClients);

  loadClientsFromGitHub().then(loadFilteredClients);
}
if (window.location.pathname.includes('estoque.html')) {
  document.getElementById('stockForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Não há funcionalidade para salvar remotamente no JSON, então apenas recarregar a página
    window.location.reload();
  });

  function calculateTotalStock() {
    const totalStock = {};
    stock.forEach(product => {
      const key = product.productName;
      if (!totalStock[key]) {
        totalStock[key] = {
          totalQuantity: product.productQuantity,
          entries: [product]
        };
      } else {
        totalStock[key].totalQuantity += product.productQuantity;
        totalStock[key].entries.push(product);
      }
    });
    return totalStock;
  }

  function loadFilteredStock() {
    const filter = document.getElementById('stockSearchInput').value.toLowerCase();
    const selectedProduct = document.getElementById('stockFilter').value;
    const stockTable = document.getElementById('stockTable').getElementsByTagName('tbody')[0];
    stockTable.innerHTML = '';

    const totalStock = calculateTotalStock();
    Object.values(totalStock).forEach((productGroup) => {
      const productNameMatches = productGroup.entries[0].productName.toLowerCase().includes(filter);
      const productMatches = selectedProduct === "" || productGroup.entries[0].productName === selectedProduct;
      if (productNameMatches && productMatches) {
        productGroup.entries.forEach(entry => {
          const newRow = stockTable.insertRow();
          newRow.insertCell(0).textContent = entry.productName;
          newRow.insertCell(1).textContent = productGroup.totalQuantity;
          newRow.insertCell(2).textContent = entry.entryDate;
          newRow.insertCell(3).textContent = entry.productQuantity;
        });
      }
    });
  }

  function populateProductDropdown() {
    const stockFilterDropdown = document.getElementById('stockFilter');
    stockFilterDropdown.innerHTML = '<option value="">Todos os Produtos</option>';
    const uniqueProducts = [...new Set(stock.map(product => product.productName))];
    uniqueProducts.forEach(productName => {
      const option = document.createElement('option');
      option.value = productName;
      option.textContent = productName;
      stockFilterDropdown.appendChild(option);
    });
  }

  loadStockFromGitHub().then(() => {
    populateProductDropdown();
    loadFilteredStock();
  });

  document.getElementById('stockSearchInput').addEventListener('input', loadFilteredStock);
  document.getElementById('stockFilter').addEventListener('change', loadFilteredStock);
}









