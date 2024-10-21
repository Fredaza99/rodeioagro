// Declarar 'clients' e 'stock' como arrays vazios, a serem preenchidos pelos arquivos JSON
let clients = [];
let stock = [];

// URLs corretas dos arquivos JSON
const urlClients = 'https://fredaza99.github.io/rodeioagro/data/clients.json';
const urlStock = 'https://fredaza99.github.io/rodeioagro/data/stock.json';

// Exemplo de fetch para carregar clientes na index.html
fetch(urlClients)
  .then(response => response.json())
  .then(data => {
    console.log('Clientes:', data);
    // Manipule os dados dos clientes aqui
  })
  .catch(error => console.error('Erro ao carregar clientes:', error));

// Exemplo de fetch para carregar estoque na index.html
fetch(urlStock)
  .then(response => response.json())
  .then(data => {
    console.log('Estoque:', data);
    // Manipule os dados de estoque aqui
  })
  .catch(error => console.error('Erro ao carregar estoque:', error));


// Função para buscar clientes do arquivo JSON no GitHub
function loadClientsFromGitHub() {
  return fetch(urlClients)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao carregar clientes');
      }
      return response.json();
    })
    .then(data => {
      clients = data;
      console.log('Clientes carregados:', clients);
    })
    .catch(error => console.error('Erro ao carregar clientes:', error));
}

// Função para buscar estoque do arquivo JSON no GitHub
function loadStockFromGitHub() {
  return fetch(urlStock)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao carregar estoque');
      }
      return response.json();
    })
    .then(data => {
      stock = data;
      console.log('Estoque carregado:', stock);
    })
    .catch(error => console.error('Erro ao carregar estoque:', error));
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

    // Função para salvar dados de clientes no arquivo JSON (com back-end ou outras soluções)
    // Por enquanto, é um exemplo de como você pode salvar os dados localmente
    localStorage.setItem('clients', JSON.stringify(clients));

    window.location.href = 'pedidos.html';
  });
}

// Carregar pedidos na página de Lista de Pedidos
if (window.location.pathname.includes('pedidos.html')) {
  const table = document.getElementById('ordersTable').getElementsByTagName('tbody')[0];
  table.innerHTML = '';

  loadClientsFromGitHub().then(() => {
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
          localStorage.setItem('clients', JSON.stringify(clients));
          window.location.reload();
        });
        deleteCell.appendChild(deleteButton);
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

// Carregar clientes e produtos na página de pesquisa de clientes
if (window.location.pathname.includes('cliente.html')) {
  const table = document.getElementById('clientHistoryTable').getElementsByTagName('tbody')[0];
  const productFilterDropdown = document.getElementById('productFilter');

  productFilterDropdown.innerHTML = '<option value="">Todos os Produtos</option>';

  loadStockFromGitHub().then(() => {
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

// Adicionar produto ao estoque via formulário
if (window.location.pathname.includes('estoque.html')) {
  document.getElementById('stockForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const productName = document.getElementById('productName').value;
    const productQuantity = parseInt(document.getElementById('productQuantity').value);
    const entryDate = document.getElementById('entryDate').value;

    const product = { productName, productQuantity, entryDate };
    stock.push(product);

    localStorage.setItem('stock', JSON.stringify(stock));
    window.location.reload();
  });

  function calculateTotalStock() {
    const totalStock = {};
    stock.forEach(product => {
      const key = product.productName;
      if (!totalStock[key]) {
        totalStock[key] = { totalQuantity: product.productQuantity, entries: [product] };
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

          const deleteCell = newRow.insertCell(4);
          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Excluir';
          deleteButton.classList.add('delete-btn');
          deleteButton.addEventListener('click', () => {
            stock.splice(stock.indexOf(entry), 1);
            localStorage.setItem('stock', JSON.stringify(stock));
            window.location.reload();
          });
          deleteCell.appendChild(deleteButton);
        });
      }
    });
  }

  document.getElementById('stockSearchInput').addEventListener('input', loadFilteredStock);
  document.getElementById('stockFilter').addEventListener('change', loadFilteredStock);

  loadStockFromGitHub().then(loadFilteredStock);
}









