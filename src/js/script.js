// Função para carregar uma "subpágina" na área de conteúdo
function loadPage(pageName) {
    fetch(`pages/${pageName}.html`)
        .then(response => response.text())
        .then(html => {
            document.getElementById('content').innerHTML = html;
        })
        .catch(error => {
            console.error(`Erro ao carregar a página ${pageName}: ${error}`);
        });
}

// Manipular os eventos de navegação (por exemplo, quando um link é clicado)
window.addEventListener('popstate', event => {
    const pageName = event.state.pageName || 'page1'; // Página padrão
    loadPage(pageName);
});

// Carregar a página inicial ao carregar a SPA
window.onload = () => {
    loadPage('page1'); // Página inicial padrão
}
