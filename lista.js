		const productForm = document.getElementById('productForm');
        const productTable = document.getElementById('productTable').querySelector('tbody');
        const totalPriceElement = document.getElementById('totalPrice');
        const exportBtn = document.getElementById('exportBtn');
        const importBtn = document.getElementById('importBtn');
        const importInput = document.getElementById('importInput');

        const remainingAmountElement = document.getElementById('remainingAmount');
		const remainingLabelElement = document.getElementById('remainingLabel');
		const goalValueElement = document.getElementById('goalValue');
		
        // Obtém os parâmetros da URL
        const params = new URLSearchParams(window.location.search);
		// Obtém o valor do parâmetro 'cesta' na URL
        const cestanaUrl = params.get('cesta');
		
        let totalPrice = 0;
        let spendingGoal = 0;
		
		
		
		// Permite editar a meta diretamente no texto
        goalValueElement.addEventListener('click', function () {
            const currentGoal = parseFloat(goalValueElement.textContent) || 0;
            const input = document.createElement('input');
            input.type = 'number';
            input.min = '0';
            input.step = '0.01';
            input.value = currentGoal.toFixed(2);
            input.className = 'editable';

            input.addEventListener('blur', function () {
                spendingGoal = parseFloat(input.value) || 0;
                goalValueElement.textContent = spendingGoal.toFixed(2);
                goalValueElement.classList.remove('editable');
                updateRemaining();
            });

            input.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') {
                    input.blur();
                }
            });

            goalValueElement.textContent = '';
            goalValueElement.appendChild(input);
            input.focus();
        });
		
				
        function updateTotalPrice(amount) {
            totalPrice += amount;
            totalPriceElement.textContent = totalPrice.toFixed(2);
			if (spendingGoal>0) {updateRemaining();}//Quando o limite está definido para mais de zero vai atualizando.			
		}

		function updateRemaining() {
            const remaining = spendingGoal - totalPrice;
			const absRemaining = Math.abs(remaining); // Sempre positivo
            remainingAmountElement.textContent = absRemaining.toFixed(2);

            if (remaining < 0) {
				remainingLabelElement.textContent = "PASSOU: R$ ";
                remainingAmountElement.classList.add('over-budget');
                //alert('Atenção: Você ultrapassou o limite de gastos!');
            } else {
				remainingLabelElement.textContent = "RESTANTE: R$ ";
                remainingAmountElement.classList.remove('over-budget');
            }
			removeLimite();
        }
		
		function removeLimite(){
			if (spendingGoal==0){
				remainingAmountElement.textContent="";
				remainingLabelElement.textContent = "";}
		}
		
        productForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const description = document.getElementById('productDescription').value.trim();
            const price = parseFloat(document.getElementById('productPrice').value);
            const quantity = parseInt(document.getElementById('productQuantity').value);
            const subtotal = price * quantity;

            const row = createRow(description, price, quantity, subtotal);
            productTable.appendChild(row);
            updateTotalPrice(subtotal);

            productForm.reset();
        });

        function createRow(description, price, quantity, subtotal) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="editable" data-type="description">${description}</td>
                <td class="editable" data-type="price">R$ ${price.toFixed(2)}</td>
                <td class="editable" data-type="quantity">${quantity}</td>
                <td>R$ ${subtotal.toFixed(2)}</td>
                <td>
                    <input type="checkbox" class="includeProduct" checked>
                    <button type="button" class="deleteBtn">Excluir</button>
                </td>
            `;

            const includeCheckbox = row.querySelector('.includeProduct');
			
            includeCheckbox.addEventListener('change', function() {
                if (includeCheckbox.checked) {
                    row.classList.remove('faded');
                    updateTotalPrice(subtotal);
                } else {
                    row.classList.add('faded');
                    updateTotalPrice(-subtotal);
                }
            });

            row.querySelector('.deleteBtn').addEventListener('click', function() {
                if (confirm('Tem certeza de que deseja excluir este item?')) {
                    productTable.removeChild(row);
                    if (includeCheckbox.checked) {
                        updateTotalPrice(-subtotal);
                    }
                }
            });

            const editableCells = row.querySelectorAll('.editable');
            editableCells.forEach(cell => {
                cell.addEventListener('click', function() {
                    if (!cell.querySelector('input')) {
                        const originalValue = cell.textContent.replace('R$ ', '').trim();
                        const input = document.createElement('input');
                        input.type = (cell.dataset.type === 'price' || cell.dataset.type === 'quantity') ? 'number' : 'text';
                        input.value = originalValue;
                        input.min = cell.dataset.type === 'quantity' ? 1 : 0;
                        input.step = cell.dataset.type === 'price' ? '0.01' : '1';

                        cell.textContent = '';
                        cell.appendChild(input);
                        input.focus();

                        input.addEventListener('blur', function() {
                            const newValue = input.value;
                            if (cell.dataset.type === 'description') {
                                cell.textContent = newValue;
                            } else if (cell.dataset.type === 'price') {
                                const oldSubtotal = parseFloat(row.querySelector('td:nth-child(4)').textContent.replace('R$ ', ''));
                                const newPrice = parseFloat(newValue);
                                const quantity = parseInt(row.querySelector('td:nth-child(3)').textContent);
                                const newSubtotal = newPrice * quantity;
                                updateTotalPrice(newSubtotal - oldSubtotal);
                                row.querySelector('td:nth-child(4)').textContent = `R$ ${newSubtotal.toFixed(2)}`;
                                cell.textContent = `R$ ${newPrice.toFixed(2)}`;
                            } else if (cell.dataset.type === 'quantity') {
                                const oldSubtotal = parseFloat(row.querySelector('td:nth-child(4)').textContent.replace('R$ ', ''));
                                const price = parseFloat(row.querySelector('td:nth-child(2)').textContent.replace('R$ ', ''));
                                const newQuantity = parseInt(newValue);
                                const newSubtotal = price * newQuantity;
                                updateTotalPrice(newSubtotal - oldSubtotal);
                                row.querySelector('td:nth-child(4)').textContent = `R$ ${newSubtotal.toFixed(2)}`;
                                cell.textContent = newQuantity;
                            }
                        });

                        input.addEventListener('keypress', function(e) {
                            if (e.key === 'Enter') {
                                input.blur();
                            }
                        });
                    }
                });
            });

            return row;
        }


		
        exportBtn.addEventListener('click', function() {
            let csvContent = "data:text/csv;charset=utf-8," 
                + "Descrição do Produto,Preço,Quantidade,Subtotal\n";

            const rows = productTable.querySelectorAll('tr');
            rows.forEach(row => {
                const cols = row.querySelectorAll('td');
                if (cols.length > 0) {
                    const description = cols[0].innerText;
                    const price = cols[1].innerText.replace('R$ ', '');
                    const quantity = cols[2].innerText;
                    const subtotal = cols[3].innerText.replace('R$ ', '');
                    csvContent += `${description},${price},${quantity},${subtotal}\n`;
                }
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', 'listaDeProdutos.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        importBtn.addEventListener('click', function() {
            importInput.click();
        });

        importInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const lines = e.target.result.split('\n');
                    for (let i = 1; i < lines.length; i++) { // Ignora o cabeçalho
                        const line = lines[i].trim();
                        if (line) {
                            const [description, price, quantity, subtotal] = line.split(',');
                            const row = createRow(description, parseFloat(price), parseInt(quantity), parseFloat(subtotal));
                            productTable.appendChild(row);
                            updateTotalPrice(parseFloat(subtotal));
                        }
                    }
                };
                reader.readAsText(file);
            }
        });



					
        // Função para carregar os produtos iniciais
        function loadInitialData() {
            initialData.forEach(([description, price, quantity, subtotal]) => {
                //addProduct(description, price, quantity);
				subtotal = price*quantity;
				const row = createRow(description, parseFloat(price), parseInt(quantity), parseFloat(subtotal));
				productTable.appendChild(row);
				updateTotalPrice(subtotal);
				productForm.reset();
            });
        }
		//
		/*function loadProductsFromCSV() {

				const rows = [
						["Produto A", 10.50, 2,0],
						["Produto B", 25.00, 1,0],
						["Produto C", 5.75, 4,0],
					];//csvText.split("\n").map((row) => row.split(","));
					
			rows.forEach((row) => {
				if (row.length >= 3) {
					const description = row[0].trim();
					const price = parseFloat(row[1].trim());
					const quantity = parseInt(row[2].trim());
					if (description && !isNaN(price) && !isNaN(quantity)) {
						//addProduct(description, price, quantity);
						//subtotal=0.00;
						createRow(description, parseFloat(price), parseInt(quantity), parseFloat(subtotal));
						productTable.appendChild(row);
						updateTotalPrice(subtotal);
						productForm.reset();
					}
				}
			});
		}*/
                //.catch((error) => console.error("Erro ao carregar produtos do CSV:", error));
				
        //}
document.addEventListener("DOMContentLoaded", function () {
		//loadProductsFromCSV();	
	if(cestanaUrl=="G") {loadInitialData();}
		});
		//if(cestanaUrl=="G") {loadProductsFromCSV("cestaGSovinski.csv");}
