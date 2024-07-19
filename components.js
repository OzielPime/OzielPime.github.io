const numeroWhatsApp= "5542991467224"
var nomeSalvo = localStorage.getItem('nomeVisitante');
var mensagem='';

// Função para carregar o cabeçalho
function loadHeader() {
    const headerContainer = document.getElementById('header-container');
    const xhr = new XMLHttpRequest();
    
    xhr.open('GET', 'header.html', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
			
            headerContainer.innerHTML = xhr.responseText;
			
				const whatsappLinkHeader = document.getElementById('botaoWhatsHeader');
				// Se o nome não estiver salvo
				if (!nomeSalvo) {
					//mostrarPopup();
					mensagem = `Oi, eu vim do seu site`;
				} else {
					// Se o nome estiver salvo
					//mostrarNomeSalvo();
					mensagem = `Oi! Me chamo ${nomeSalvo}, eu vim do seu site`;
				}				

				// Define o valor do atributo href da âncora"https://wa.me/message/3JE4GCAF6ERHP1";//
				const urlHeader = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodeURIComponent(mensagem)}`;
				whatsappLinkHeader.href = urlHeader;
        }
    };


			
    xhr.send();
	

}

// Função para carregar o rodapé
function loadFooter() {
    const footerContainer = document.getElementById('footer-container');
    const xhr = new XMLHttpRequest();
    
    xhr.open('GET', 'footer.html', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            footerContainer.innerHTML = xhr.responseText;
        }
    };
    xhr.send();	
}


function DadosDoCliente() {
	// Se o nome não estiver salvo, mostra o pop-up
	if (!nomeSalvo) {
		mostrarPopup();
	} else {
		// Se o nome estiver salvo, mostra na mensagem
		mostrarNomeSalvo();
	}
}
		// Verifica se o nome do visitante já foi salvo
        window.onload = function() {
            

            			
        };
