const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

//Busca as avaliações no maps e vai adicionar na página. Posso tentar adicionar logo no carregamento da página em tempo real ou tentar gravar num arquivo e posteriormente ler na página mesmo que leia atualizado somente na próxima atualização/acesso.
var axios = require('axios');

function carregarAvaliacoes() {
    var config = {
        method: 'get',
        url: 'https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJ19Iaei2D6ZQRyPxN49MN1l8&fields=reviews&language=pt_BR&key=AIzaSyAUSxpJYiZhdXM0roTyKc3tNZqdSAO8mQ0',
        headers: {}
    };

    axios(config)
        .then(function (response) {
            const jsonData = JSON.stringify(response.data, null, 2); // 2 espaços para indentação
            const jsonPath = path.join(__dirname, 'avaliacoes.txt');
            fs.writeFile(jsonPath, jsonData, { encoding: 'utf8', flag: 'w' }, (err) => {
                if (err) {
                    console.error('Erro ao gravar avaliações:', err);
                } else {
                    console.log('avaliações atualizadas com quebras de linha.');
                }
            });
        })
        .catch(function (error) {
            console.log(error);
        });
}


// Função para ler o contador de acessos
function lerContador(callback) {
    const filePath = path.join(__dirname, 'contador.txt');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            // Se o arquivo não existir, inicia o contador em 0
            callback(0);
        } else {
            // Converte o conteúdo do arquivo para um número inteiro
            callback(parseInt(data) || 0);
        }
    });
}

// Função para gravar o contador de acessos
function gravarContador(contador) {
    const filePath = path.join(__dirname, 'contador.txt');
    fs.writeFile(filePath, contador.toString(), (err) => {
        if (err) {
            console.error('Erro ao gravar o contador de acessos:', err);
        } else {
            console.log('Contador de acessos atualizado:', contador);
        }
    });
}

//Servidor Medizata.

const server = http.createServer((req, res) => {

	//Tratando do parâmetro criado pelo Facebook e pelo Instagram, esse parâmetro resulta no erro 404 quando o usuário clica no link localizado nessas redes sociais, por isso vou apagar isso da url.
    const parsedUrl = url.parse(req.url, true); // Parse a URL com os parâmetros
    const queryParams = parsedUrl.query; // Obter os parâmetros da query

    if (queryParams.fbclid) {
        console.log('Valor do parâmetro fbclid:', queryParams.fbclid);
		console.log('req.url:', req.url);
		req.url=req.url.replace('?fbclid='+queryParams.fbclid,'');
		console.log('req.url substituído por:', req.url);
    }

	// Obter a data e hora atual
	const dataHoraAtual = new Date().toLocaleString();
	console.log('[Nova requisição em '+dataHoraAtual+']');
	
    //Acessando a página e definindo home.html como padrão.
    let filePath = path.join(__dirname, req.url);

	const host = req.headers.host || "localhost";
	console.log('URL acessada:', host);

	//Direcionamento por rota.
    if (req.url === '/medizata') {	
		filePath = path.join(__dirname, 'home-medizata.html');
		console.log('Era pra ter alternado para '+filePath);
	}

    if (req.url === '/blink') {	
		filePath = path.join(__dirname, 'blinkdubs.html');
		console.log('Era pra ter alternado para '+filePath);
	}

    if (req.url === '/t4k') {	
		filePath = path.join(__dirname, 'the4k.html');
		console.log('Era pra ter alternado para '+filePath);
	}
		
	//Direcionamento por hostname.
    if (req.url === '/') {	
		
			filePath = path.join(__dirname, 'nourl.html');//console.log('Era pra ter alternado para '+filePath);
		
		if (host.toLowerCase().includes("medizata")) {
			filePath = path.join(__dirname, 'home-medizata.html');
			console.log('Era pra ter alternado para '+filePath);
		}
		
		if (host.toLowerCase().includes("blinkdubs")) {
			filePath = path.join(__dirname, 'blinkdubs.html');
			console.log('Era pra ter alternado para '+filePath);
		}
		
		if (host.toLowerCase().includes("telemacocity")) {
			filePath = path.join(__dirname, 'the4k.html');
			console.log('Era pra ter alternado para '+filePath);
		}
	}
	
    // Verifique se há um parâmetro 'cdp' na query para removê-lo porque não pode ter "?cdp=..." na url para fazer o acesso na condição fs.existsSync(filePath).
    if (queryParams.cdp) {
        console.log('Valor do parâmetro cdp:', queryParams.cdp);
		console.log('filePath:', filePath);
		filePath=filePath.replace('?cdp='+queryParams.cdp,'');
    }

    if (queryParams.dub) {
        console.log('Valor do parâmetro dub:', queryParams.dub);
		console.log('filePath:', filePath);
		filePath=filePath.replace('?dub='+queryParams.dub,'');
    }
	
    // Verifica se o caminho da URL é a página principal
    if (host.toLowerCase().includes("medizata") || parsedUrl.pathname === '/home-medizata.html') {
        carregarAvaliacoes();
        // Incrementa o contador de acessos
        /*lerContador((contador) => {
            contador++;
            gravarContador(contador);

            console.log('Acesso Medizata', contador);
        });*/
	
	    // Analisar a URL para obter o caminho e a query string
		const { pathname, query } = url.parse(req.url, true);
	
		if (req.method === 'POST' && pathname === '/home-medizata.html') {
			let data = '';

			// Receber dados do corpo da solicitação
			req.on('data', (chunk) => {
				data += chunk;
			});

			// Lidar com o término da solicitação
			req.on('end', () => {
				const nomeUsuario = JSON.parse(data).nome;
				console.log(`Acesso de ${nomeUsuario}!`);
				res.writeHead(200, { 'Content-Type': 'text/plain' });
				res.end();
			});
		} else {
			// Lidar com outros tipos de solicitações ou caminhos
			//res.writeHead(404, { 'Content-Type': 'text/plain' });
			//res.end('Página não encontrada');
		}
		
	}
	
    if (fs.existsSync(filePath)) {
        // Define os tipos MIME para diferentes tipos de arquivo
        const mimeTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
            // Outros tipos MIME aqui...
        };

        let contentType = mimeTypes[path.extname(filePath)] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });

        // Lê e envia o conteúdo do arquivo
        fs.createReadStream(filePath).pipe(res);
	} else {
		res.writeHead(404, { 'Content-Type': 'text/plain' });
		res.end('404 Not Found');
    }
});

const port = 80;
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
