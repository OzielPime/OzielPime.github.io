
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