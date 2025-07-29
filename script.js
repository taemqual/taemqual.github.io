const API_URL = "https://script.google.com/macros/s/AKfycbwm_OiYzpU_lSMarAiFUtTpn7GP0wjCCLCwHgtCI2DoPayZSTRS__1LlbpSEpVJ-gdZ9Q/exec";

    const mensagemContainerElem = document.getElementById('mensagem-status-container');
    const atualizacaoStatusElem = document.getElementById('atualizacao-status');
    const historicoCorpoElem = document.getElementById('historico-corpo');

    async function fetchStatus() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error('Falha na resposta da rede: ' + response.statusText);
            }
            const dados = await response.json();

            // --- ESTADO DE SUCESSO ---
            // A renderização é feita usando a abordagem segura que já funcionava
            mensagemContainerElem.innerHTML = '';
            const principalElem = document.createElement('span');
            principalElem.className = 'status-principal';
            principalElem.textContent = dados.status_atual.horario_msg || "Aguardando início da pauta";
            mensagemContainerElem.appendChild(principalElem);

            if (dados.status_atual.processo_msg) {
                const secundarioElem = document.createElement('span');
                secundarioElem.className = 'status-secundario';
                secundarioElem.textContent = dados.status_atual.processo_msg;
                mensagemContainerElem.appendChild(secundarioElem);
            }
            
            atualizacaoStatusElem.textContent = "Última atualização: " + dados.status_atual.atualizacao;
            
            historicoCorpoElem.innerHTML = '';
            if (dados.historico && dados.historico.length > 0) {
                dados.historico.forEach(item => {
                    // A quebra de linha do histórico volta a ser feita com <br>
                    let historicoHtml = item.horario_msg;
                    if (item.processo_msg) {
                        historicoHtml += "<br>" + item.processo_msg;
                    }
                    const linha = document.createElement('tr');
                    // Inserimos a célula da mensagem com innerHTML para interpretar o <br>
                    linha.innerHTML = `
                        <td data-label="Audiência">${historicoHtml}</td>
                        <td data-label="Início">${item.inicio}</td>
                        <td data-label="Fim">${item.fim}</td>
                        <td data-label="Duração">${item.duracao}</td>
                    `;
                    historicoCorpoElem.appendChild(linha);
                });
            } else {
                 const linhaVazia = document.createElement('tr');
                 linhaVazia.innerHTML = `<td colspan="4" style="text-align:center; color:#888;">Nenhuma audiência realizada ainda.</td>`;
                 historicoCorpoElem.appendChild(linhaVazia);
            }

        } catch (error) {
            // --- ESTADO DE ERRO ---
            mensagemContainerElem.innerHTML = '<span class="status-principal" style="color: #d93025;">Erro ao carregar dados</span>';
            atualizacaoStatusElem.textContent = "Verifique a conexão e tente novamente.";
            historicoCorpoElem.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#888;">-</td></tr>`;
            console.error("Erro no fetch:", error);
        }
    }

    // --- LÓGICA DE INICIALIZAÇÃO ---
    function setInitialLoadingState() {
        mensagemContainerElem.innerHTML = '<span class="status-principal">Carregando...</span><span class="status-secundario">Aguarde um instante.</span>';
        atualizacaoStatusElem.textContent = '';
        historicoCorpoElem.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#888;">Buscando histórico...</td></tr>`;
    }

    setInitialLoadingState();
    setInterval(fetchStatus, 15000);
    fetchStatus();
