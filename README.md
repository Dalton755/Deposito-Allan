# Venda web do depósito

Projeto pronto para **GitHub Pages** com interface de recibo, modo **Venda** e **Fiado**, gravando em uma **planilha Google Sheets** com a mesma estrutura da sua planilha.

## O que este projeto faz

- Página web com visual de recibo parecido com o modelo enviado
- Soma automática por item e total geral
- Ao clicar em **Enviar**, pergunta se foi pago
- Se foi pago, pergunta o **tipo de pagamento** e grava em **Registros**
- Se não foi pago, abre o fluxo de **Fiado**
- No fiado, permite:
  - carregar clientes em aberto
  - adicionar mais itens
  - salvar saldo aberto
  - registrar pagamento total ou parcial
- Usa as abas:
  - `Registros`
  - `Fiado`
  - `Config`

## Estrutura esperada da planilha

### Aba `Registros`
Colunas A:H

1. Número Pedido
2. Data
3. Nome
4. Quantidade de itens
5. Descrição
6. Valor total
7. Total Unitario
8. Tipo Pagamento

### Aba `Fiado`
Colunas A:K

1. Número Pedido
2. Data
3. Nome
4. Quantidade de itens
5. Descrição
6. Valor total
7. Total Unitario
8. Valor pago
9. Valor em aberto
10. Última atualização
11. Itens Detalhados

> A coluna **K** guarda os itens detalhados em JSON para reabrir o fiado com os itens já carregados.

## Como configurar

### 1) Suba a planilha para o Google Sheets
- Importe o arquivo modelo atualizado para o Google Sheets.
- Copie o **ID da planilha** na URL.

### 2) Crie as credenciais Google
Você vai precisar de:
- **Google Sheets API** ativada
- **API Key**
- **OAuth Client ID** do tipo **Web application**

No Client ID, adicione o domínio do seu GitHub Pages em **Authorized JavaScript origins**, por exemplo:

- `https://SEU-USUARIO.github.io`

> No Google OAuth, use apenas a **origem** (domínio), sem o caminho do repositório.

Se for testar localmente, adicione também algo como:
- `http://127.0.0.1:5500`

### 3) Publique no GitHub Pages
- Crie um repositório
- Envie estes arquivos
- Em **Settings > Pages**, publique pela branch principal e pasta raiz

### 4) Abra o site e clique em `Configurar`
Preencha:
- Nome da loja
- API Key
- Client ID
- Spreadsheet ID

Depois clique em **Conectar planilha**.

## Observações importantes

- Este projeto usa **Google Sheets**, não `.xlsm` direto no GitHub Pages.
- O `.xlsm` foi mantido como **modelo de estrutura**.
- Para usar online, o caminho mais seguro é importar a planilha para o Google Sheets.

## Próximas melhorias possíveis

- imprimir cupom
- busca de produto com preço automático
- dashboard de vendas
- login próprio
- relatório por período
- baixa automática de estoque
