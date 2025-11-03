🔍 Validação customizada - Body recebido: [Object: null prototype] { filiais_ids: '3', unidades_ids: '17' }
🔍 Validação customizada - filiais_ids: 3
🔍 Validação customizada - unidades_ids: 17
🔍 Validação customizada - rotas_ids: undefined
✅ Validação customizada - Passou na validação
🚀 Controller processarPDFEGerarNecessidades chamado!
📊 Body recebido: [Object: null prototype] { filiais_ids: '3', unidades_ids: '17' }
📁 File recebido: PDF presente
🔍 Campos do body:
  filiais_ids: 3
  unidades_ids: 17
🔍 Processando seleção por filiais/unidades
📋 IDs das unidades: [ 17 ]
🔍 Buscando unidades escolares com query: SELECT id, nome_escola, filial_id FROM unidades_escolares WHERE id IN (?)
✅ Unidades escolares encontradas: 1
🔍 Verificando se há unidades escolares: 1
📁 Arquivo temporário criado: /tmp/temp_1758061996845_Parcial - Outubro.pdf
🐍 Executando processador Python...
============================================================
JSON_RESULTADO_START
{
  "sucesso": true,
  "total_refeicoes": 81,
  "total_dias": 18,
  "refeicoes": [
    {
      "data": "1/10/2025",
      "turno": "Matutino",
      "codigo": "R25.375",
      "descricao": "Carne bovina em cubos refogada com tomate e cenoura, arroz, feijão, purê de batata, salada de alface e couve fatiado e um pêssego",
      "texto_original": "R25.375 Carne bovina em cubos refogada com tomate e cenoura, arroz, feijão, purê de batata, salada de alface e couve fatiado e um pêssego"
    },
    {
      "data": "1/10/2025",
      "turno": "Vespertino",
      "codigo": "R25.375",
      "descricao": "Carne bovina em cubos refogada com tomate e cenoura, arroz, feijão, purê de batata, salada de alface e couve fatiado e um pêssego",
      "texto_original": "R25.375 Carne bovina em cubos refogada com tomate e cenoura, arroz, feijão, purê de batata, salada de alface e couve fatiado e um pêssego"
    },
    {
      "data": "1/10/2025",
      "turno": "Noturno",
      "codigo": "R25.375",
      "descricao": "Carne bovina em cubos refogada com tomate e cenoura, arroz, feijão, purê de batata, salada de alface e couve fatiado e um pêssego",
      "texto_original": "R25.375 Carne bovina em cubos refogada com tomate e cenoura, arroz, feijão, purê de batata, salada de alface e couve fatiado e um pêssego"
    },
    {
      "data": "2/10/2025",
      "turno": "Matutino",
      "codigo": "R25.97",
      "descricao": "Frango em iscas refogado com abobrinha, tomate, cebola e tempero verde, arroz, feijão, salada de pepino e uma tangerina",
      "texto_original": "R25.97 Frango em iscas refogado com abobrinha, tomate, cebola e tempero verde, arroz, feijão, salada de pepino e uma tangerina"
    },
    {
      "data": "2/10/2025",
      "turno": "Vespertino",
      "codigo": "R25.97",
      "descricao": "Frango em iscas refogado com abobrinha, tomate, cebola e tempero verde, arroz, feijão, salada de pepino e uma tangerina",
      "texto_original": "R25.97 Frango em iscas refogado com abobrinha, tomate, cebola e tempero verde, arroz, feijão, salada de pepino e uma tangerina"
    },
    {
      "data": "2/10/2025",
      "turno": "Noturno",
      "codigo": "R25.97",
      "descricao": "Frango em iscas refogado com abobrinha, tomate, cebola e tempero verde, arroz, feijão, salada de pepino e uma tangerina",
      "texto_original": "R25.97 Frango em iscas refogado com abobrinha, tomate, cebola e tempero verde, arroz, feijão, salada de pepino e uma tangerina"
    },
    {
      "data": "3/10/2025",
      "turno": "Matutino",
      "codigo": "LL25.228",
      "descricao": "Torta de carne (com carne moída, tomate, ervilha congelada, cebola e tempero verde), suco de uva integral sem adição de açúcar e uma banana",
      "texto_original": "LL25.228 Torta de carne (com carne moída, tomate, ervilha congelada, cebola e tempero verde), suco de uva integral sem adição de açúcar e uma banana"
    },
    {
      "data": "3/10/2025",
      "turno": "Vespertino",
      "codigo": "LL25.228",
      "descricao": "Torta de carne (com carne moída, tomate, ervilha congelada, cebola e tempero verde), suco de uva integral sem adição de açúcar e uma banana",
      "texto_original": "LL25.228 Torta de carne (com carne moída, tomate, ervilha congelada, cebola e tempero verde), suco de uva integral sem adição de açúcar e uma banana"
    },
    {
      "data": "3/10/2025",
      "turno": "Noturno",
      "codigo": "LL25.228",
      "descricao": "Torta de carne (com carne moída, tomate, ervilha congelada, cebola e tempero verde), suco de uva integral sem adição de açúcar e uma banana",
      "texto_original": "LL25.228 Torta de carne (com carne moída, tomate, ervilha congelada, cebola e tempero verde), suco de uva integral sem adição de açúcar e uma banana"
    },
    {
      "data": "3/10/2025",
      "turno": "Noturno",
      "codigo": "R24.202",
      "descricao": "Carne bovina moída refogada com tomate em cubos e tempero verde, arroz, feijão, salada de couve flor e brócolis e uma banana",
      "texto_original": "R24.202 Carne bovina moída refogada com tomate em cubos e tempero verde, arroz, feijão, salada de couve flor e brócolis e uma banana"
    },
    {
      "data": "3/10/2025",
      "turno": "Matutino",
      "codigo": "R24.202",
      "descricao": "Carne bovina moída refogada com tomate em cubos e tempero verde, arroz, feijão, salada de couve flor e brócolis e uma banana",
      "texto_original": "R24.202 Carne bovina moída refogada com tomate em cubos e tempero verde, arroz, feijão, salada de couve flor e brócolis e uma banana"
    },
    {
      "data": "3/10/2025",
      "turno": "Vespertino",
      "codigo": "R24.202",
      "descricao": "Carne bovina moída refogada com tomate em cubos e tempero verde, arroz, feijão, salada de couve flor e brócolis e uma banana",
      "texto_original": "R24.202 Carne bovina moída refogada com tomate em cubos e tempero verde, arroz, feijão, salada de couve flor e brócolis e uma banana"
    },
    {
      "data": "1/10/2025",
      "turno": "Matutino",
      "codigo": "R25.231",
      "descricao": "Frango em iscas acebolado, arroz, feijão, batata refogada com tomate, salada de repolho roxo e uma maçã",
      "texto_original": "R25.231 Frango em iscas acebolado, arroz, feijão, batata refogada com tomate, salada de repolho roxo e uma maçã"
    },
    {
      "data": "1/10/2025",
      "turno": "Vespertino",
      "codigo": "R25.231",
      "descricao": "Frango em iscas acebolado, arroz, feijão, batata refogada com tomate, salada de repolho roxo e uma maçã",
      "texto_original": "R25.231 Frango em iscas acebolado, arroz, feijão, batata refogada com tomate, salada de repolho roxo e uma maçã"
    },
    {
      "data": "1/10/2025",
      "turno": "Noturno",
      "codigo": "R25.231",
      "descricao": "Frango em iscas acebolado, arroz, feijão, batata refogada com tomate, salada de repolho roxo e uma maçã",
      "texto_original": "R25.231 Frango em iscas acebolado, arroz, feijão, batata refogada com tomate, salada de repolho roxo e uma maçã"
    },
    {
      "data": "2/10/2025",
      "turno": "Matutino",
      "codigo": "R25.458",
      "descricao": "Feijoada de carne bovina com legumes (feijão com carne bovina em cubos, batata doce e abóbora em cubos), arroz, farofa de cenoura ralada e uma tangerina",
      "texto_original": "R25.458 Feijoada de carne bovina com legumes (feijão com carne bovina em cubos, batata doce e abóbora em cubos), arroz, farofa de cenoura ralada e uma tangerina"
    },
    {
      "data": "2/10/2025",
      "turno": "Vespertino",
      "codigo": "R25.458",
      "descricao": "Feijoada de carne bovina com legumes (feijão com carne bovina em cubos, batata doce e abóbora em cubos), arroz, farofa de cenoura ralada e uma tangerina",
      "texto_original": "R25.458 Feijoada de carne bovina com legumes (feijão com carne bovina em cubos, batata doce e abóbora em cubos), arroz, farofa de cenoura ralada e uma tangerina"
    },
    {
      "data": "2/10/2025",
      "turno": "Noturno",
      "codigo": "R25.458",
      "descricao": "Feijoada de carne bovina com legumes (feijão com carne bovina em cubos, batata doce e abóbora em cubos), arroz, farofa de cenoura ralada e uma tangerina",
      "texto_original": "R25.458 Feijoada de carne bovina com legumes (feijão com carne bovina em cubos, batata doce e abóbora em cubos), arroz, farofa de cenoura ralada e uma tangerina"
    },
    {
      "data": "3/10/2025",
      "turno": "Matutino",
      "codigo": "LL24.22",
      "descricao": "Pão massinha com peito de frango desfiado ensopado ao molho de tomate (feito na escola), alface, tomate em fatia, suco de laranja integral sem adição de açúcar e uma banana",
      "texto_original": "LL24.22 Pão massinha com peito de frango desfiado ensopado ao molho de tomate (feito na escola), alface, tomate em fatia, suco de laranja integral sem adição de açúcar e uma banana"
    },
    {
      "data": "3/10/2025",
      "turno": "Vespertino",
      "codigo": "LL24.22",
      "descricao": "Pão massinha com peito de frango desfiado ensopado ao molho de tomate (feito na escola), alface, tomate em fatia, suco de laranja integral sem adição de açúcar e uma banana",
      "texto_original": "LL24.22 Pão massinha com peito de frango desfiado ensopado ao molho de tomate (feito na escola), alface, tomate em fatia, suco de laranja integral sem adição de açúcar e uma banana"
    },
    {
      "data": "3/10/2025",
      "turno": "Noturno",
      "codigo": "LL24.22",
      "descricao": "Pão massinha com peito de frango desfiado ensopado ao molho de tomate (feito na escola), alface, tomate em fatia, suco de laranja integral sem adição de açúcar e uma banana",
      "texto_original": "LL24.22 Pão massinha com peito de frango desfiado ensopado ao molho de tomate (feito na escola), alface, tomate em fatia, suco de laranja integral sem adição de açúcar e uma banana"
    },
    {
      "data": "6/10/2025",
      "turno": "Matutino",
      "codigo": "R25.101",
      "descricao": "Macarronada de frango (Macarrão (parafuso) com frango desfiado ensopado com molho de tomate), salada de repolho picado, salada de abóbora e uma laranja",
      "texto_original": "R25.101 Macarronada de frango (Macarrão (parafuso) com frango desfiado ensopado com molho de tomate), salada de repolho picado, salada de abóbora e uma laranja"
    },
    {
      "data": "6/10/2025",
      "turno": "Vespertino",
      "codigo": "R25.101",
      "descricao": "Macarronada de frango (Macarrão (parafuso) com frango desfiado ensopado com molho de tomate), salada de repolho picado, salada de abóbora e uma laranja",
      "texto_original": "R25.101 Macarronada de frango (Macarrão (parafuso) com frango desfiado ensopado com molho de tomate), salada de repolho picado, salada de abóbora e uma laranja"
    },
    {
      "data": "6/10/2025",
      "turno": "Noturno",
      "codigo": "R25.101",
      "descricao": "Macarronada de frango (Macarrão (parafuso) com frango desfiado ensopado com molho de tomate), salada de repolho picado, salada de abóbora e uma laranja",
      "texto_original": "R25.101 Macarronada de frango (Macarrão (parafuso) com frango desfiado ensopado com molho de tomate), salada de repolho picado, salada de abóbora e uma laranja"
    },
    {
      "data": "7/10/2025",
      "turno": "Matutino",
      "codigo": "R25.81",
      "descricao": "Carne bovina em iscas acebolada, arroz, feijão, batata doce assada, salada de alface e uma fatia de mamão",
      "texto_original": "R25.81 Carne bovina em iscas acebolada, arroz, feijão, batata doce assada, salada de alface e uma fatia de mamão"
    },
    {
      "data": "7/10/2025",
      "turno": "Vespertino",
      "codigo": "R25.81",
      "descricao": "Carne bovina em iscas acebolada, arroz, feijão, batata doce assada, salada de alface e uma fatia de mamão",
      "texto_original": "R25.81 Carne bovina em iscas acebolada, arroz, feijão, batata doce assada, salada de alface e uma fatia de mamão"
    },
    {
      "data": "7/10/2025",
      "turno": "Noturno",
      "codigo": "R25.81",
      "descricao": "Carne bovina em iscas acebolada, arroz, feijão, batata doce assada, salada de alface e uma fatia de mamão",
      "texto_original": "R25.81 Carne bovina em iscas acebolada, arroz, feijão, batata doce assada, salada de alface e uma fatia de mamão"
    },
    {
      "data": "8/10/2025",
      "turno": "Matutino",
      "codigo": null,
      "descricao": "FERIADO",
      "texto_original": "FERIADO"
    },
    {
      "data": "8/10/2025",
      "turno": "Vespertino",
      "codigo": null,
      "descricao": "FERIADO",
      "texto_original": "FERIADO"
    },
    {
      "data": "8/10/2025",
      "turno": "Noturno",
      "codigo": null,
      "descricao": "FERIADO",
      "texto_original": "FERIADO"
    },
    {
      "data": "9/10/2025",
      "turno": "Matutino",
      "codigo": "R25.575",
      "descricao": "Arroz colorido com frango (arroz integral, frango desfiado, abobrinha em cubos e milho verde congelado), feijão, salada de agrião e uma maçã",
      "texto_original": "R25.575 Arroz colorido com frango (arroz integral, frango desfiado, abobrinha em cubos e milho verde congelado), feijão, salada de agrião e uma maçã"
    },
    {
      "data": "9/10/2025",
      "turno": "Vespertino",
      "codigo": "R25.575",
      "descricao": "Arroz colorido com frango (arroz integral, frango desfiado, abobrinha em cubos e milho verde congelado), feijão, salada de agrião e uma maçã",
      "texto_original": "R25.575 Arroz colorido com frango (arroz integral, frango desfiado, abobrinha em cubos e milho verde congelado), feijão, salada de agrião e uma maçã"
    },
    {
      "data": "9/10/2025",
      "turno": "Noturno",
      "codigo": "R25.575",
      "descricao": "Arroz colorido com frango (arroz integral, frango desfiado, abobrinha em cubos e milho verde congelado), feijão, salada de agrião e uma maçã",
      "texto_original": "R25.575 Arroz colorido com frango (arroz integral, frango desfiado, abobrinha em cubos e milho verde congelado), feijão, salada de agrião e uma maçã"
    },
    {
      "data": "10/10/2025",
      "turno": "Matutino",
      "codigo": "LL25.64",
      "descricao": "Bolo de cenoura nutritivo (cenoura, maçã, aveia e farinha de trigo integral), leite com café, açúcar e uma banana",
      "texto_original": "LL25.64 Bolo de cenoura nutritivo (cenoura, maçã, aveia e farinha de trigo integral), leite com café, açúcar e uma banana"
    },
    {
      "data": "10/10/2025",
      "turno": "Vespertino",
      "codigo": "LL25.64",
      "descricao": "Bolo de cenoura nutritivo (cenoura, maçã, aveia e farinha de trigo integral), leite com café, açúcar e uma banana",
      "texto_original": "LL25.64 Bolo de cenoura nutritivo (cenoura, maçã, aveia e farinha de trigo integral), leite com café, açúcar e uma banana"
    },
    {
      "data": "10/10/2025",
      "turno": "Noturno",
      "codigo": "LL25.64",
      "descricao": "Bolo de cenoura nutritivo (cenoura, maçã, aveia e farinha de trigo integral), leite com café, açúcar e uma banana",
      "texto_original": "LL25.64 Bolo de cenoura nutritivo (cenoura, maçã, aveia e farinha de trigo integral), leite com café, açúcar e uma banana"
    },
    {
      "data": "10/10/2025",
      "turno": "Noturno",
      "codigo": "R25.312",
      "descricao": "Filé de tilápia assado (temperado com limão, alho, cebola, e tempero verde), arroz, feijão, salada de batata com cenoura e tempero verde e uma banana",
      "texto_original": "R25.312 Filé de tilápia assado (temperado com limão, alho, cebola, e tempero verde), arroz, feijão, salada de batata com cenoura e tempero verde e uma banana"
    },
    {
      "data": "10/10/2025",
      "turno": "Matutino",
      "codigo": "R25.312",
      "descricao": "Filé de tilápia assado (temperado com limão, alho, cebola, e tempero verde), arroz, feijão, salada de batata com cenoura e tempero verde e uma banana",
      "texto_original": "R25.312 Filé de tilápia assado (temperado com limão, alho, cebola, e tempero verde), arroz, feijão, salada de batata com cenoura e tempero verde e uma banana"
    },
    {
      "data": "10/10/2025",
      "turno": "Vespertino",
      "codigo": "R25.312",
      "descricao": "Filé de tilápia assado (temperado com limão, alho, cebola, e tempero verde), arroz, feijão, salada de batata com cenoura e tempero verde e uma banana",
      "texto_original": "R25.312 Filé de tilápia assado (temperado com limão, alho, cebola, e tempero verde), arroz, feijão, salada de batata com cenoura e tempero verde e uma banana"
    },
    {
      "data": "13/10/2025",
      "turno": "Matutino",
      "codigo": "LL24.83",
      "descricao": "Salada de frutas (mamão, banana e laranja), aveia*, iogurte de mel (iogurte natural batido com mel) e biscoito caseiro sem gordura trans. *servir separadamente",
      "texto_original": "LL24.83 Salada de frutas (mamão, banana e laranja), aveia*, iogurte de mel (iogurte natural batido com mel) e biscoito caseiro sem gordura trans. *servir separadamente"
    },
    {
      "data": "13/10/2025",
      "turno": "Vespertino",
      "codigo": "LL24.83",
      "descricao": "Salada de frutas (mamão, banana e laranja), aveia*, iogurte de mel (iogurte natural batido com mel) e biscoito caseiro sem gordura trans. *servir separadamente",
      "texto_original": "LL24.83 Salada de frutas (mamão, banana e laranja), aveia*, iogurte de mel (iogurte natural batido com mel) e biscoito caseiro sem gordura trans. *servir separadamente"
    },
    {
      "data": "13/10/2025",
      "turno": "Noturno",
      "codigo": "LL24.83",
      "descricao": "Salada de frutas (mamão, banana e laranja), aveia*, iogurte de mel (iogurte natural batido com mel) e biscoito caseiro sem gordura trans. *servir separadamente",
      "texto_original": "LL24.83 Salada de frutas (mamão, banana e laranja), aveia*, iogurte de mel (iogurte natural batido com mel) e biscoito caseiro sem gordura trans. *servir separadamente"
    },
    {
      "data": "14/10/2025",
      "turno": "Matutino",
      "codigo": "R25.234",
      "descricao": "Frango em cubos refogado com tomate e ervilha congelada, arroz, feijão, farofa de cenoura, salada de repolho e uma banana",
      "texto_original": "R25.234 Frango em cubos refogado com tomate e ervilha congelada, arroz, feijão, farofa de cenoura, salada de repolho e uma banana"
    },
    {
      "data": "14/10/2025",
      "turno": "Vespertino",
      "codigo": "R25.234",
      "descricao": "Frango em cubos refogado com tomate e ervilha congelada, arroz, feijão, farofa de cenoura, salada de repolho e uma banana",
      "texto_original": "R25.234 Frango em cubos refogado com tomate e ervilha congelada, arroz, feijão, farofa de cenoura, salada de repolho e uma banana"
    },
    {
      "data": "14/10/2025",
      "turno": "Noturno",
      "codigo": "R25.234",
      "descricao": "Frango em cubos refogado com tomate e ervilha congelada, arroz, feijão, farofa de cenoura, salada de repolho e uma banana",
      "texto_original": "R25.234 Frango em cubos refogado com tomate e ervilha congelada, arroz, feijão, farofa de cenoura, salada de repolho e uma banana"
    },
    {
      "data": "15/10/2025",
      "turno": "Matutino",
      "codigo": "LL23.281",
      "descricao": "Pão massinha com carne bovina moída ensopada com molho de tomate (feito na escola), alface, tomate em fatias, suco de uva integral sem adição de açúcar e uma maçã",
      "texto_original": "LL23.281 Pão massinha com carne bovina moída ensopada com molho de tomate (feito na escola), alface, tomate em fatias, suco de uva integral sem adição de açúcar e uma maçã"
    },
    {
      "data": "15/10/2025",
      "turno": "Vespertino",
      "codigo": "LL23.281",
      "descricao": "Pão massinha com carne bovina moída ensopada com molho de tomate (feito na escola), alface, tomate em fatias, suco de uva integral sem adição de açúcar e uma maçã",
      "texto_original": "LL23.281 Pão massinha com carne bovina moída ensopada com molho de tomate (feito na escola), alface, tomate em fatias, suco de uva integral sem adição de açúcar e uma maçã"
    },
    {
      "data": "15/10/2025",
      "turno": "Noturno",
      "codigo": "LL23.281",
      "descricao": "Pão massinha com carne bovina moída ensopada com molho de tomate (feito na escola), alface, tomate em fatias, suco de uva integral sem adição de açúcar e uma maçã",
      "texto_original": "LL23.281 Pão massinha com carne bovina moída ensopada com molho de tomate (feito na escola), alface, tomate em fatias, suco de uva integral sem adição de açúcar e uma maçã"
    },
    {
      "data": "16/10/2025",
      "turno": "Matutino",
      "codigo": "R25.464",
      "descricao": "Omelete de cenoura com queijo e orégano (Fortaia), arroz, feijão, salada de abobrinha com chuchu e uma fatia de mamão",
      "texto_original": "R25.464 Omelete de cenoura com queijo e orégano (Fortaia), arroz, feijão, salada de abobrinha com chuchu e uma fatia de mamão"
    },
    {
      "data": "16/10/2025",
      "turno": "Vespertino",
      "codigo": "R25.464",
      "descricao": "Omelete de cenoura com queijo e orégano (Fortaia), arroz, feijão, salada de abobrinha com chuchu e uma fatia de mamão",
      "texto_original": "R25.464 Omelete de cenoura com queijo e orégano (Fortaia), arroz, feijão, salada de abobrinha com chuchu e uma fatia de mamão"
    },
    {
      "data": "16/10/2025",
      "turno": "Noturno",
      "codigo": "R25.464",
      "descricao": "Omelete de cenoura com queijo e orégano (Fortaia), arroz, feijão, salada de abobrinha com chuchu e uma fatia de mamão",
      "texto_original": "R25.464 Omelete de cenoura com queijo e orégano (Fortaia), arroz, feijão, salada de abobrinha com chuchu e uma fatia de mamão"
    },
    {
      "data": "17/10/2025",
      "turno": "Matutino",
      "codigo": "R24.181",
      "descricao": "Frango ensopado (coxa e sobrecoxa sem osso) com molho de tomate (feito na escola) e batata, arroz, feijão, couve-flor refogado, salada de brócolis e uma fatia de melancia",
      "texto_original": "R24.181 Frango ensopado (coxa e sobrecoxa sem osso) com molho de tomate (feito na escola) e batata, arroz, feijão, couve-flor refogado, salada de brócolis e uma fatia de melancia"
    },
    {
      "data": "17/10/2025",
      "turno": "Vespertino",
      "codigo": "R24.181",
      "descricao": "Frango ensopado (coxa e sobrecoxa sem osso) com molho de tomate (feito na escola) e batata, arroz, feijão, couve-flor refogado, salada de brócolis e uma fatia de melancia",
      "texto_original": "R24.181 Frango ensopado (coxa e sobrecoxa sem osso) com molho de tomate (feito na escola) e batata, arroz, feijão, couve-flor refogado, salada de brócolis e uma fatia de melancia"
    },
    {
      "data": "17/10/2025",
      "turno": "Noturno",
      "codigo": "R24.181",
      "descricao": "Frango ensopado (coxa e sobrecoxa sem osso) com molho de tomate (feito na escola) e batata, arroz, feijão, couve-flor refogado, salada de brócolis e uma fatia de melancia",
      "texto_original": "R24.181 Frango ensopado (coxa e sobrecoxa sem osso) com molho de tomate (feito na escola) e batata, arroz, feijão, couve-flor refogado, salada de brócolis e uma fatia de melancia"
    },
    {
      "data": "13/10/2025",
      "turno": "Noturno",
      "codigo": "R25.341",
      "descricao": "Estrogonofe de carne bovina em iscas com molho branco (feito na escola), arroz, batata doce assada, salada de beterraba ralada e uma laranja",
      "texto_original": "R25.341 Estrogonofe de carne bovina em iscas com molho branco (feito na escola), arroz, batata doce assada, salada de beterraba ralada e uma laranja"
    },
    {
      "data": "13/10/2025",
      "turno": "Matutino",
      "codigo": "R25.341",
      "descricao": "Estrogonofe de carne bovina em iscas com molho branco (feito na escola), arroz, batata doce assada, salada de beterraba ralada e uma laranja",
      "texto_original": "R25.341 Estrogonofe de carne bovina em iscas com molho branco (feito na escola), arroz, batata doce assada, salada de beterraba ralada e uma laranja"
    },
    {
      "data": "13/10/2025",
      "turno": "Vespertino",
      "codigo": "R25.341",
      "descricao": "Estrogonofe de carne bovina em iscas com molho branco (feito na escola), arroz, batata doce assada, salada de beterraba ralada e uma laranja",
      "texto_original": "R25.341 Estrogonofe de carne bovina em iscas com molho branco (feito na escola), arroz, batata doce assada, salada de beterraba ralada e uma laranja"
    },
    {
      "data": "14/10/2025",
      "turno": "Noturno",
      "codigo": "R25.234",
      "descricao": "Frango em cubos refogado com tomate e e rvilha congelada, arroz, feijão, farofa de cenoura, salada de repolho e uma banana",
      "texto_original": "R25.234 Frango em cubos refogado com tomate e e rvilha congelada, arroz, feijão, farofa de cenoura, salada de repolho e uma banana"
    },
    {
      "data": "14/10/2025",
      "turno": "Matutino",
      "codigo": "R25.234",
      "descricao": "Frango em cubos refogado com tomate e e rvilha congelada, arroz, feijão, farofa de cenoura, salada de repolho e uma banana",
      "texto_original": "R25.234 Frango em cubos refogado com tomate e e rvilha congelada, arroz, feijão, farofa de cenoura, salada de repolho e uma banana"
    },
    {
      "data": "14/10/2025",
      "turno": "Vespertino",
      "codigo": "R25.234",
      "descricao": "Frango em cubos refogado com tomate e e rvilha congelada, arroz, feijão, farofa de cenoura, salada de repolho e uma banana",
      "texto_original": "R25.234 Frango em cubos refogado com tomate e e rvilha congelada, arroz, feijão, farofa de cenoura, salada de repolho e uma banana"
    },
    {
      "data": "20/10/2025",
      "turno": "Matutino",
      "codigo": "R25.401",
      "descricao": "Carreteiro (arroz integral, carne bovina em iscas, tomate e cebola), legumes refogados (cenoura e chuchu), salada de alface e uma laranja",
      "texto_original": "R25.401 Carreteiro (arroz integral, carne bovina em iscas, tomate e cebola), legumes refogados (cenoura e chuchu), salada de alface e uma laranja"
    },
    {
      "data": "20/10/2025",
      "turno": "Vespertino",
      "codigo": "R25.401",
      "descricao": "Carreteiro (arroz integral, carne bovina em iscas, tomate e cebola), legumes refogados (cenoura e chuchu), salada de alface e uma laranja",
      "texto_original": "R25.401 Carreteiro (arroz integral, carne bovina em iscas, tomate e cebola), legumes refogados (cenoura e chuchu), salada de alface e uma laranja"
    },
    {
      "data": "20/10/2025",
      "turno": "Noturno",
      "codigo": "R25.401",
      "descricao": "Carreteiro (arroz integral, carne bovina em iscas, tomate e cebola), legumes refogados (cenoura e chuchu), salada de alface e uma laranja",
      "texto_original": "R25.401 Carreteiro (arroz integral, carne bovina em iscas, tomate e cebola), legumes refogados (cenoura e chuchu), salada de alface e uma laranja"
    },
    {
      "data": "21/10/2025",
      "turno": "Matutino",
      "codigo": "LL25.303",
      "descricao": "Torta de frango com 50% aveia (com peito de frango desfiado, tomate e abobrinha em cubos, cebola e tempero verde), suco de uva integral sem adição de açúcar e uma banana",
      "texto_original": "LL25.303 Torta de frango com 50% aveia (com peito de frango desfiado, tomate e abobrinha em cubos, cebola e tempero verde), suco de uva integral sem adição de açúcar e uma banana"
    },
    {
      "data": "21/10/2025",
      "turno": "Vespertino",
      "codigo": "LL25.303",
      "descricao": "Torta de frango com 50% aveia (com peito de frango desfiado, tomate e abobrinha em cubos, cebola e tempero verde), suco de uva integral sem adição de açúcar e uma banana",
      "texto_original": "LL25.303 Torta de frango com 50% aveia (com peito de frango desfiado, tomate e abobrinha em cubos, cebola e tempero verde), suco de uva integral sem adição de açúcar e uma banana"
    },
    {
      "data": "21/10/2025",
      "turno": "Noturno",
      "codigo": "LL25.303",
      "descricao": "Torta de frango com 50% aveia (com peito de frango desfiado, tomate e abobrinha em cubos, cebola e tempero verde), suco de uva integral sem adição de açúcar e uma banana",
      "texto_original": "LL25.303 Torta de frango com 50% aveia (com peito de frango desfiado, tomate e abobrinha em cubos, cebola e tempero verde), suco de uva integral sem adição de açúcar e uma banana"
    },
    {
      "data": "22/10/2025",
      "turno": "Matutino",
      "codigo": "R25.282",
      "descricao": "Polenta com molho de carne moída (carne bovina moída e molho de tomate feito na escola), arroz, feijão, salada de couve-flor e uma tangerina",
      "texto_original": "R25.282 Polenta com molho de carne moída (carne bovina moída e molho de tomate feito na escola), arroz, feijão, salada de couve-flor e uma tangerina"
    },
    {
      "data": "22/10/2025",
      "turno": "Vespertino",
      "codigo": "R25.282",
      "descricao": "Polenta com molho de carne moída (carne bovina moída e molho de tomate feito na escola), arroz, feijão, salada de couve-flor e uma tangerina",
      "texto_original": "R25.282 Polenta com molho de carne moída (carne bovina moída e molho de tomate feito na escola), arroz, feijão, salada de couve-flor e uma tangerina"
    },
    {
      "data": "22/10/2025",
      "turno": "Noturno",
      "codigo": "R25.282",
      "descricao": "Polenta com molho de carne moída (carne bovina moída e molho de tomate feito na escola), arroz, feijão, salada de couve-flor e uma tangerina",
      "texto_original": "R25.282 Polenta com molho de carne moída (carne bovina moída e molho de tomate feito na escola), arroz, feijão, salada de couve-flor e uma tangerina"
    },
    {
      "data": "23/10/2025",
      "turno": "Matutino",
      "codigo": "LL25.740",
      "descricao": "Cuca de banana com aveia e canela, leite com café, açúcar e uma fatia de mamão",
      "texto_original": "LL25.740 Cuca de banana com aveia e canela, leite com café, açúcar e uma fatia de mamão"
    },
    {
      "data": "23/10/2025",
      "turno": "Vespertino",
      "codigo": "LL25.740",
      "descricao": "Cuca de banana com aveia e canela, leite com café, açúcar e uma fatia de mamão",
      "texto_original": "LL25.740 Cuca de banana com aveia e canela, leite com café, açúcar e uma fatia de mamão"
    },
    {
      "data": "23/10/2025",
      "turno": "Noturno",
      "codigo": "LL25.740",
      "descricao": "Cuca de banana com aveia e canela, leite com café, açúcar e uma fatia de mamão",
      "texto_original": "LL25.740 Cuca de banana com aveia e canela, leite com café, açúcar e uma fatia de mamão"
    },
    {
      "data": "24/10/2025",
      "turno": "Matutino",
      "codigo": "R25.260",
      "descricao": "Macarronada de frango (macarrão parafuso com frango desfiado ensopado com molho de tomate), salada de couve picada, salada de beterraba cozida e uma fatia de melancia",
      "texto_original": "R25.260 Macarronada de frango (macarrão parafuso com frango desfiado ensopado com molho de tomate), salada de couve picada, salada de beterraba cozida e uma fatia de melancia"
    },
    {
      "data": "24/10/2025",
      "turno": "Vespertino",
      "codigo": "R25.260",
      "descricao": "Macarronada de frango (macarrão parafuso com frango desfiado ensopado com molho de tomate), salada de couve picada, salada de beterraba cozida e uma fatia de melancia",
      "texto_original": "R25.260 Macarronada de frango (macarrão parafuso com frango desfiado ensopado com molho de tomate), salada de couve picada, salada de beterraba cozida e uma fatia de melancia"
    },
    {
      "data": "24/10/2025",
      "turno": "Noturno",
      "codigo": "R25.260",
      "descricao": "Macarronada de frango (macarrão parafuso com frango desfiado ensopado com molho de tomate), salada de couve picada, salada de beterraba cozida e uma fatia de melancia",
      "texto_original": "R25.260 Macarronada de frango (macarrão parafuso com frango desfiado ensopado com molho de tomate), salada de couve picada, salada de beterraba cozida e uma fatia de melancia"
    },
    {
      "data": "21/10/2025",
      "turno": "Noturno",
      "codigo": "R25.335",
      "descricao": "Frango em cubos refogado com tomate e ervilha congelada, arroz, feijão, farofa de beterraba, salada de repolho e uma banana",
      "texto_original": "R25.335 Frango em cubos refogado com tomate e ervilha congelada, arroz, feijão, farofa de beterraba, salada de repolho e uma banana"
    },
    {
      "data": "21/10/2025",
      "turno": "Matutino",
      "codigo": "R25.335",
      "descricao": "Frango em cubos refogado com tomate e ervilha congelada, arroz, feijão, farofa de beterraba, salada de repolho e uma banana",
      "texto_original": "R25.335 Frango em cubos refogado com tomate e ervilha congelada, arroz, feijão, farofa de beterraba, salada de repolho e uma banana"
    },
    {
      "data": "21/10/2025",
      "turno": "Vespertino",
      "codigo": "R25.335",
      "descricao": "Frango em cubos refogado com tomate e ervilha congelada, arroz, feijão, farofa de beterraba, salada de repolho e uma banana",
      "texto_original": "R25.335 Frango em cubos refogado com tomate e ervilha congelada, arroz, feijão, farofa de beterraba, salada de repolho e uma banana"
    },
    {
      "data": "23/10/2025",
      "turno": "Noturno",
      "codigo": "R25.332",
      "descricao": "Filé de Tilápia (temperado com limão, alho, cebola e tempero verde) ensopado com molho de tomate (feito na escola), arroz com espinafre, feijão, batata assada, salada de rúcula e uma fatia de mamão",
      "texto_original": "R25.332 Filé de Tilápia (temperado com limão, alho, cebola e tempero verde) ensopado com molho de tomate (feito na escola), arroz com espinafre, feijão, batata assada, salada de rúcula e uma fatia de mamão"
    },
    {
      "data": "23/10/2025",
      "turno": "Matutino",
      "codigo": "R25.332",
      "descricao": "Filé de Tilápia (temperado com limão, alho, cebola e tempero verde) ensopado com molho de tomate (feito na escola), arroz com espinafre, feijão, batata assada, salada de rúcula e uma fatia de mamão",
      "texto_original": "R25.332 Filé de Tilápia (temperado com limão, alho, cebola e tempero verde) ensopado com molho de tomate (feito na escola), arroz com espinafre, feijão, batata assada, salada de rúcula e uma fatia de mamão"
    },
    {
      "data": "23/10/2025",
      "turno": "Vespertino",
      "codigo": "R25.332",
      "descricao": "Filé de Tilápia (temperado com limão, alho, cebola e tempero verde) ensopado com molho de tomate (feito na escola), arroz com espinafre, feijão, batata assada, salada de rúcula e uma fatia de mamão",
      "texto_original": "R25.332 Filé de Tilápia (temperado com limão, alho, cebola e tempero verde) ensopado com molho de tomate (feito na escola), arroz com espinafre, feijão, batata assada, salada de rúcula e uma fatia de mamão"
    }
  ],
  "cardapio_por_data": {
    "1/10/2025": [
      {
        "data": "1/10/2025",
        "turno": "Matutino",
        "codigo": "R25.375",
        "descricao": "Carne bovina em cubos refogada com tomate e cenoura, arroz, feijão, purê de batata, salada de alface e couve fatiado e um pêssego",
        "texto_original": "R25.375 Carne bovina em cubos refogada com tomate e cenoura, arroz, feijão, purê de batata, salada de alface e couve fatiado e um pêssego"
      },
      {
        "data": "1/10/2025",
        "turno": "Vespertino",
        "codigo": "R25.375",
        "descricao": "Carne bovina em cubos refogada com tomate e cenoura, arroz, feijão, purê de batata, salada de alface e couve fatiado e um pêssego",
        "texto_original": "R25.375 Carne bovina em cubos refogada com tomate e cenoura, arroz, feijão, purê de batata, salada de alface e couve fatiado e um pêssego"
      },
      {
        "data": "1/10/2025",
        "turno": "Noturno",
        "codigo": "R25.375",
        "descricao": "Carne bovina em cubos refogada com tomate e cenoura, arroz, feijão, purê de batata, salada de alface e couve fatiado e um pêssego",
        "texto_original": "R25.375 Carne bovina em cubos refogada com tomate e cenoura, arroz, feijão, purê de batata, salada de alface e couve fatiado e um pêssego"
      },
      {
        "data": "1/10/2025",
        "turno": "Matutino",
        "codigo": "R25.231",
        "descricao": "Frango em iscas acebolado, arroz, feijão, batata refogada com tomate, salada de repolho roxo e uma maçã",
        "texto_original": "R25.231 Frango em iscas acebolado, arroz, feijão, batata refogada com tomate, salada de repolho roxo e uma maçã"
      },
      {
        "data": "1/10/2025",
        "turno": "Vespertino",
        "codigo": "R25.231",
        "descricao": "Frango em iscas acebolado, arroz, feijão, batata refogada com tomate, salada de repolho roxo e uma maçã",
        "texto_original": "R25.231 Frango em iscas acebolado, arroz, feijão, batata refogada com tomate, salada de repolho roxo e uma maçã"
      },
      {
        "data": "1/10/2025",
        "turno": "Noturno",
        "codigo": "R25.231",
        "descricao": "Frango em iscas acebolado, arroz, feijão, batata refogada com tomate, salada de repolho roxo e uma maçã",
        "texto_original": "R25.231 Frango em iscas acebolado, arroz, feijão, batata refogada com tomate, salada de repolho roxo e uma maçã"
      }
    ],
    "2/10/2025": [
      {
        "data": "2/10/2025",
        "turno": "Matutino",
        "codigo": "R25.97",
        "descricao": "Frango em iscas refogado com abobrinha, tomate, cebola e tempero verde, arroz, feijão, salada de pepino e uma tangerina",
        "texto_original": "R25.97 Frango em iscas refogado com abobrinha, tomate, cebola e tempero verde, arroz, feijão, salada de pepino e uma tangerina"
      },
      {
        "data": "2/10/2025",
        "turno": "Vespertino",
        "codigo": "R25.97",
        "descricao": "Frango em iscas refogado com abobrinha, tomate, cebola e tempero verde, arroz, feijão, salada de pepino e uma tangerina",
        "texto_original": "R25.97 Frango em iscas refogado com abobrinha, tomate, cebola e tempero verde, arroz, feijão, salada de pepino e uma tangerina"
      },
      {
        "data": "2/10/2025",
        "turno": "Noturno",
        "codigo": "R25.97",
        "descricao": "Frango em iscas refogado com abobrinha, tomate, cebola e tempero verde, arroz, feijão, salada de pepino e uma tangerina",
        "texto_original": "R25.97 Frango em iscas refogado com abobrinha, tomate, cebola e tempero verde, arroz, feijão, salada de pepino e uma tangerina"
      },
      {
        "data": "2/10/2025",
        "turno": "Matutino",
        "codigo": "R25.458",
        "descricao": "Feijoada de carne bovina com legumes (feijão com carne bovina em cubos, batata doce e abóbora em cubos), arroz, farofa de cenoura ralada e uma tangerina",
        "texto_original": "R25.458 Feijoada de carne bovina com legumes (feijão com carne bovina em cubos, batata doce e abóbora em cubos), arroz, farofa de cenoura ralada e uma tangerina"
      },
      {
        "data": "2/10/2025",
        "turno": "Vespertino",
        "codigo": "R25.458",
        "descricao": "Feijoada de carne bovina com legumes (feijão com carne bovina em cubos, batata doce e abóbora em cubos), arroz, farofa de cenoura ralada e uma tangerina",
        "texto_original": "R25.458 Feijoada de carne bovina com legumes (feijão com carne bovina em cubos, batata doce e abóbora em cubos), arroz, farofa de cenoura ralada e uma tangerina"
      },
      {
        "data": "2/10/2025",
        "turno": "Noturno",
        "codigo": "R25.458",
        "descricao": "Feijoada de carne bovina com legumes (feijão com carne bovina em cubos, batata doce e abóbora em cubos), arroz, farofa de cenoura ralada e uma tangerina",
        "texto_original": "R25.458 Feijoada de carne bovina com legumes (feijão com carne bovina em cubos, batata doce e abóbora em cubos), arroz, farofa de cenoura ralada e uma tangerina"
      }
    ],
    "3/10/2025": [
      {
        "data": "3/10/2025",
        "turno": "Matutino",
        "codigo": "LL25.228",
        "descricao": "Torta de carne (com carne moída, tomate, ervilha congelada, cebola e tempero verde), suco de uva integral sem adição de açúcar e uma banana",
        "texto_original": "LL25.228 Torta de carne (com carne moída, tomate, ervilha congelada, cebola e tempero verde), suco de uva integral sem adição de açúcar e uma banana"
      },
      {
        "data": "3/10/2025",
        "turno": "Vespertino",
        "codigo": "LL25.228",
        "descricao": "Torta de carne (com carne moída, tomate, ervilha congelada, cebola e tempero verde), suco de uva integral sem adição de açúcar e uma banana",
        "texto_original": "LL25.228 Torta de carne (com carne moída, tomate, ervilha congelada, cebola e tempero verde), suco de uva integral sem adição de açúcar e uma banana"
      },
      {
        "data": "3/10/2025",
        "turno": "Noturno",
        "codigo": "LL25.228",
        "descricao": "Torta de carne (com carne moída, tomate, ervilha congelada, cebola e tempero verde), suco de uva integral sem adição de açúcar e uma banana",
        "texto_original": "LL25.228 Torta de carne (com carne moída, tomate, ervilha congelada, cebola e tempero verde), suco de uva integral sem adição de açúcar e uma banana"
      },
      {
        "data": "3/10/2025",
        "turno": "Noturno",
        "codigo": "R24.202",
        "descricao": "Carne bovina moída refogada com tomate em cubos e tempero verde, arroz, feijão, salada de couve flor e brócolis e uma banana",
        "texto_original": "R24.202 Carne bovina moída refogada com tomate em cubos e tempero verde, arroz, feijão, salada de couve flor e brócolis e uma banana"
      },
      {
        "data": "3/10/2025",
        "turno": "Matutino",
        "codigo": "R24.202",
        "descricao": "Carne bovina moída refogada com tomate em cubos e tempero verde, arroz, feijão, salada de couve flor e brócolis e uma banana",
        "texto_original": "R24.202 Carne bovina moída refogada com tomate em cubos e tempero verde, arroz, feijão, salada de couve flor e brócolis e uma banana"
      },
      {
        "data": "3/10/2025",
        "turno": "Vespertino",
        "codigo": "R24.202",
        "descricao": "Carne bovina moída refogada com tomate em cubos e tempero verde, arroz, feijão, salada de couve flor e brócolis e uma banana",
        "texto_original": "R24.202 Carne bovina moída refogada com tomate em cubos e tempero verde, arroz, feijão, salada de couve flor e brócolis e uma banana"
      },
      {
        "data": "3/10/2025",
        "turno": "Matutino",
        "codigo": "LL24.22",
        "descricao": "Pão massinha com peito de frango desfiado ensopado ao molho de tomate (feito na escola), alface, tomate em fatia, suco de laranja integral sem adição de açúcar e uma banana",
        "texto_original": "LL24.22 Pão massinha com peito de frango desfiado ensopado ao molho de tomate (feito na escola), alface, tomate em fatia, suco de laranja integral sem adição de açúcar e uma banana"
      },
      {
        "data": "3/10/2025",
        "turno": "Vespertino",
        "codigo": "LL24.22",
        "descricao": "Pão massinha com peito de frango desfiado ensopado ao molho de tomate (feito na escola), alface, tomate em fatia, suco de laranja integral sem adição de açúcar e uma banana",
        "texto_original": "LL24.22 Pão massinha com peito de frango desfiado ensopado ao molho de tomate (feito na escola), alface, tomate em fatia, suco de laranja integral sem adição de açúcar e uma banana"
      },
      {
        "data": "3/10/2025",
        "turno": "Noturno",
        "codigo": "LL24.22",
        "descricao": "Pão massinha com peito de frango desfiado ensopado ao molho de tomate (feito na escola), alface, tomate em fatia, suco de laranja integral sem adição de açúcar e uma banana",
        "texto_original": "LL24.22 Pão massinha com peito de frango desfiado ensopado ao molho de tomate (feito na escola), alface, tomate em fatia, suco de laranja integral sem adição de açúcar e uma banana"
      }
    ],
    "6/10/2025": [
      {
        "data": "6/10/2025",
        "turno": "Matutino",
        "codigo": "R25.101",
        "descricao": "Macarronada de frango (Macarrão (parafuso) com frango desfiado ensopado com molho de tomate), salada de repolho picado, salada de abóbora e uma laranja",
        "texto_original": "R25.101 Macarronada de frango (Macarrão (parafuso) com frango desfiado ensopado com molho de tomate), salada de repolho picado, salada de abóbora e uma laranja"
      },
      {
        "data": "6/10/2025",
        "turno": "Vespertino",
        "codigo": "R25.101",
        "descricao": "Macarronada de frango (Macarrão (parafuso) com frango desfiado ensopado com molho de tomate), salada de repolho picado, salada de abóbora e uma laranja",
        "texto_original": "R25.101 Macarronada de frango (Macarrão (parafuso) com frango desfiado ensopado com molho de tomate), salada de repolho picado, salada de abóbora e uma laranja"
      },
      {
        "data": "6/10/2025",
        "turno": "Noturno",
        "codigo": "R25.101",
        "descricao": "Macarronada de frango (Macarrão (parafuso) com frango desfiado ensopado com molho de tomate), salada de repolho picado, salada de abóbora e uma laranja",
        "texto_original": "R25.101 Macarronada de frango (Macarrão (parafuso) com frango desfiado ensopado com molho de tomate), salada de repolho picado, salada de abóbora e uma laranja"
      }
    ],
    "7/10/2025": [
      {
        "data": "7/10/2025",
        "turno": "Matutino",
        "codigo": "R25.81",
        "descricao": "Carne bovina em iscas acebolada, arroz, feijão, batata doce assada, salada de alface e uma fatia de mamão",
        "texto_original": "R25.81 Carne bovina em iscas acebolada, arroz, feijão, batata doce assada, salada de alface e uma fatia de mamão"
      },
      {
        "data": "7/10/2025",
        "turno": "Vespertino",
        "codigo": "R25.81",
        "descricao": "Carne bovina em iscas acebolada, arroz, feijão, batata doce assada, salada de alface e uma fatia de mamão",
        "texto_original": "R25.81 Carne bovina em iscas acebolada, arroz, feijão, batata doce assada, salada de alface e uma fatia de mamão"
      },
      {
        "data": "7/10/2025",
        "turno": "Noturno",
        "codigo": "R25.81",
        "descricao": "Carne bovina em iscas acebolada, arroz, feijão, batata doce assada, salada de alface e uma fatia de mamão",
        "texto_original": "R25.81 Carne bovina em iscas acebolada, arroz, feijão, batata doce assada, salada de alface e uma fatia de mamão"
      }
    ],
    "8/10/2025": [
      {
        "data": "8/10/2025",
        "turno": "Matutino",
        "codigo": null,
        "descricao": "FERIADO",
        "texto_original": "FERIADO"
      },
      {
        "data": "8/10/2025",
        "turno": "Vespertino",
        "codigo": null,
        "descricao": "FERIADO",
        "texto_original": "FERIADO"
      },
      {
        "data": "8/10/2025",
        "turno": "Noturno",
        "codigo": null,
        "descricao": "FERIADO",
        "texto_original": "FERIADO"
      }
    ],
    "9/10/2025": [
      {
        "data": "9/10/2025",
        "turno": "Matutino",
        "codigo": "R25.575",
        "descricao": "Arroz colorido com frango (arroz integral, frango desfiado, abobrinha em cubos e milho verde congelado), feijão, salada de agrião e uma maçã",
        "texto_original": "R25.575 Arroz colorido com frango (arroz integral, frango desfiado, abobrinha em cubos e milho verde congelado), feijão, salada de agrião e uma maçã"
      },
      {
        "data": "9/10/2025",
        "turno": "Vespertino",
        "codigo": "R25.575",
        "descricao": "Arroz colorido com frango (arroz integral, frango desfiado, abobrinha em cubos e milho verde congelado), feijão, salada de agrião e uma maçã",
        "texto_original": "R25.575 Arroz colorido com frango (arroz integral, frango desfiado, abobrinha em cubos e milho verde congelado), feijão, salada de agrião e uma maçã"
      },
      {
        "data": "9/10/2025",
        "turno": "Noturno",
        "codigo": "R25.575",
        "descricao": "Arroz colorido com frango (arroz integral, frango desfiado, abobrinha em cubos e milho verde congelado), feijão, salada de agrião e uma maçã",
        "texto_original": "R25.575 Arroz colorido com frango (arroz integral, frango desfiado, abobrinha em cubos e milho verde congelado), feijão, salada de agrião e uma maçã"
      }
    ],
    "10/10/2025": [
      {
        "data": "10/10/2025",
        "turno": "Matutino",
        "codigo": "LL25.64",
        "descricao": "Bolo de cenoura nutritivo (cenoura, maçã, aveia e farinha de trigo integral), leite com café, açúcar e uma banana",
        "texto_original": "LL25.64 Bolo de cenoura nutritivo (cenoura, maçã, aveia e farinha de trigo integral), leite com café, açúcar e uma banana"
      },
      {
        "data": "10/10/2025",
        "turno": "Vespertino",
        "codigo": "LL25.64",
        "descricao": "Bolo de cenoura nutritivo (cenoura, maçã, aveia e farinha de trigo integral), leite com café, açúcar e uma banana",
        "texto_original": "LL25.64 Bolo de cenoura nutritivo (cenoura, maçã, aveia e farinha de trigo integral), leite com café, açúcar e uma banana"
      },
      {
        "data": "10/10/2025",
        "turno": "Noturno",
        "codigo": "LL25.64",
        "descricao": "Bolo de cenoura nutritivo (cenoura, maçã, aveia e farinha de trigo integral), leite com café, açúcar e uma banana",
        "texto_original": "LL25.64 Bolo de cenoura nutritivo (cenoura, maçã, aveia e farinha de trigo integral), leite com café, açúcar e uma banana"
      },
      {
        "data": "10/10/2025",
        "turno": "Noturno",
        "codigo": "R25.312",
        "descricao": "Filé de tilápia assado (temperado com limão, alho, cebola, e tempero verde), arroz, feijão, salada de batata com cenoura e tempero verde e uma banana",
        "texto_original": "R25.312 Filé de tilápia assado (temperado com limão, alho, cebola, e tempero verde), arroz, feijão, salada de batata com cenoura e tempero verde e uma banana"
      },
      {
        "data": "10/10/2025",
        "turno": "Matutino",
        "codigo": "R25.312",
        "descricao": "Filé de tilápia assado (temperado com limão, alho, cebola, e tempero verde), arroz, feijão, salada de batata com cenoura e tempero verde e uma banana",
        "texto_original": "R25.312 Filé de tilápia assado (temperado com limão, alho, cebola, e tempero verde), arroz, feijão, salada de batata com cenoura e tempero verde e uma banana"
      },
      {
        "data": "10/10/2025",
        "turno": "Vespertino",
        "codigo": "R25.312",
        "descricao": "Filé de tilápia assado (temperado com limão, alho, cebola, e tempero verde), arroz, feijão, salada de batata com cenoura e tempero verde e uma banana",
        "texto_original": "R25.312 Filé de tilápia assado (temperado com limão, alho, cebola, e tempero verde), arroz, feijão, salada de batata com cenoura e tempero verde e uma banana"
      }
    ],
    "13/10/2025": [
      {
        "data": "13/10/2025",
        "turno": "Matutino",
        "codigo": "LL24.83",
        "descricao": "Salada de frutas (mamão, banana e laranja), aveia*, iogurte de mel (iogurte natural batido com mel) e biscoito caseiro sem gordura trans. *servir separadamente",
        "texto_original": "LL24.83 Salada de frutas (mamão, banana e laranja), aveia*, iogurte de mel (iogurte natural batido com mel) e biscoito caseiro sem gordura trans. *servir separadamente"
      },
      {
        "data": "13/10/2025",
        "turno": "Vespertino",
        "codigo": "LL24.83",
        "descricao": "Salada de frutas (mamão, banana e laranja), aveia*, iogurte de mel (iogurte natural batido com mel) e biscoito caseiro sem gordura trans. *servir separadamente",
        "texto_original": "LL24.83 Salada de frutas (mamão, banana e laranja), aveia*, iogurte de mel (iogurte natural batido com mel) e biscoito caseiro sem gordura trans. *servir separadamente"
      },
      {
        "data": "13/10/2025",
        "turno": "Noturno",
        "codigo": "LL24.83",
        "descricao": "Salada de frutas (mamão, banana e laranja), aveia*, iogurte de mel (iogurte natural batido com mel) e biscoito caseiro sem gordura trans. *servir separadamente",
        "texto_original": "LL24.83 Salada de frutas (mamão, banana e laranja), aveia*, iogurte de mel (iogurte natural batido com mel) e biscoito caseiro sem gordura trans. *servir separadamente"
      },
      {
        "data": "13/10/2025",
        "turno": "Noturno",
        "codigo": "R25.341",
        "descricao": "Estrogonofe de carne bovina em iscas com molho branco (feito na escola), arroz, batata doce assada, salada de beterraba ralada e uma laranja",
        "texto_original": "R25.341 Estrogonofe de carne bovina em iscas com molho branco (feito na escola), arroz, batata doce assada, salada de beterraba ralada e uma laranja"
      },
      {
        "data": "13/10/2025",
        "turno": "Matutino",
        "codigo": "R25.341",
        "descricao": "Estrogonofe de carne bovina em iscas com molho branco (feito na escola), arroz, batata doce assada, salada de beterraba ralada e uma laranja",
        "texto_original": "R25.341 Estrogonofe de carne bovina em iscas com molho branco (feito na escola), arroz, batata doce assada, salada de beterraba ralada e uma laranja"
      },
      {
        "data": "13/10/2025",
        "turno": "Vespertino",
        "codigo": "R25.341",
        "descricao": "Estrogonofe de carne bovina em iscas com molho branco (feito na escola), arroz, batata doce assada, salada de beterraba ralada e uma laranja",
        "texto_original": "R25.341 Estrogonofe de carne bovina em iscas com molho branco (feito na escola), arroz, batata doce assada, salada de beterraba ralada e uma laranja"
      }
    ],
    "14/10/2025": [
      {
        "data": "14/10/2025",
        "turno": "Matutino",
        "codigo": "R25.234",
        "descricao": "Frango em cubos refogado com tomate e ervilha congelada, arroz, feijão, farofa de cenoura, salada de repolho e uma banana",
        "texto_original": "R25.234 Frango em cubos refogado com tomate e ervilha congelada, arroz, feijão, farofa de cenoura, salada de repolho e uma banana"
      },
      {
        "data": "14/10/2025",
        "turno": "Vespertino",
        "codigo": "R25.234",
        "descricao": "Frango em cubos refogado com tomate e ervilha congelada, arroz, feijão, farofa de cenoura, salada de repolho e uma banana",
        "texto_original": "R25.234 Frango em cubos refogado com tomate e ervilha congelada, arroz, feijão, farofa de cenoura, salada de repolho e uma banana"
      },
      {
        "data": "14/10/2025",
        "turno": "Noturno",
        "codigo": "R25.234",
        "descricao": "Frango em cubos refogado com tomate e ervilha congelada, arroz, feijão, farofa de cenoura, salada de repolho e uma banana",
        "texto_original": "R25.234 Frango em cubos refogado com tomate e ervilha congelada, arroz, feijão, farofa de cenoura, salada de repolho e uma banana"
      },
      {
        "data": "14/10/2025",
        "turno": "Noturno",
        "codigo": "R25.234",
        "descricao": "Frango em cubos refogado com tomate e e rvilha congelada, arroz, feijão, farofa de cenoura, salada de repolho e uma banana",
        "texto_original": "R25.234 Frango em cubos refogado com tomate e e rvilha congelada, arroz, feijão, farofa de cenoura, salada de repolho e uma banana"
      },
      {
        "data": "14/10/2025",
        "turno": "Matutino",
        "codigo": "R25.234",
        "descricao": "Frango em cubos refogado com tomate e e rvilha congelada, arroz, feijão, farofa de cenoura, salada de repolho e uma banana",
        "texto_original": "R25.234 Frango em cubos refogado com tomate e e rvilha congelada, arroz, feijão, farofa de cenoura, salada de repolho e uma banana"
      },
      {
        "data": "14/10/2025",
        "turno": "Vespertino",
        "codigo": "R25.234",
        "descricao": "Frango em cubos refogado com tomate e e rvilha congelada, arroz, feijão, farofa de cenoura, salada de repolho e uma banana",
        "texto_original": "R25.234 Frango em cubos refogado com tomate e e rvilha congelada, arroz, feijão, farofa de cenoura, salada de repolho e uma banana"
      }
    ],
    "15/10/2025": [
      {
        "data": "15/10/2025",
        "turno": "Matutino",
        "codigo": "LL23.281",
        "descricao": "Pão massinha com carne bovina moída ensopada com molho de tomate (feito na escola), alface, tomate em fatias, suco de uva integral sem adição de açúcar e uma maçã",
        "texto_original": "LL23.281 Pão massinha com carne bovina moída ensopada com molho de tomate (feito na escola), alface, tomate em fatias, suco de uva integral sem adição de açúcar e uma maçã"
      },
      {
        "data": "15/10/2025",
        "turno": "Vespertino",
        "codigo": "LL23.281",
        "descricao": "Pão massinha com carne bovina moída ensopada com molho de tomate (feito na escola), alface, tomate em fatias, suco de uva integral sem adição de açúcar e uma maçã",
        "texto_original": "LL23.281 Pão massinha com carne bovina moída ensopada com molho de tomate (feito na escola), alface, tomate em fatias, suco de uva integral sem adição de açúcar e uma maçã"
      },
      {
        "data": "15/10/2025",
        "turno": "Noturno",
        "codigo": "LL23.281",
        "descricao": "Pão massinha com carne bovina moída ensopada com molho de tomate (feito na escola), alface, tomate em fatias, suco de uva integral sem adição de açúcar e uma maçã",
        "texto_original": "LL23.281 Pão massinha com carne bovina moída ensopada com molho de tomate (feito na escola), alface, tomate em fatias, suco de uva integral sem adição de açúcar e uma maçã"
      }
    ],
    "16/10/2025": [
      {
        "data": "16/10/2025",
        "turno": "Matutino",
        "codigo": "R25.464",
        "descricao": "Omelete de cenoura com queijo e orégano (Fortaia), arroz, feijão, salada de abobrinha com chuchu e uma fatia de mamão",
        "texto_original": "R25.464 Omelete de cenoura com queijo e orégano (Fortaia), arroz, feijão, salada de abobrinha com chuchu e uma fatia de mamão"
      },
      {
        "data": "16/10/2025",
        "turno": "Vespertino",
        "codigo": "R25.464",
        "descricao": "Omelete de cenoura com queijo e orégano (Fortaia), arroz, feijão, salada de abobrinha com chuchu e uma fatia de mamão",
        "texto_original": "R25.464 Omelete de cenoura com queijo e orégano (Fortaia), arroz, feijão, salada de abobrinha com chuchu e uma fatia de mamão"
      },
      {
        "data": "16/10/2025",
        "turno": "Noturno",
        "codigo": "R25.464",
        "descricao": "Omelete de cenoura com queijo e orégano (Fortaia), arroz, feijão, salada de abobrinha com chuchu e uma fatia de mamão",
        "texto_original": "R25.464 Omelete de cenoura com queijo e orégano (Fortaia), arroz, feijão, salada de abobrinha com chuchu e uma fatia de mamão"
      }
    ],
    "17/10/2025": [
      {
        "data": "17/10/2025",
        "turno": "Matutino",
        "codigo": "R24.181",
        "descricao": "Frango ensopado (coxa e sobrecoxa sem osso) com molho de tomate (feito na escola) e batata, arroz, feijão, couve-flor refogado, salada de brócolis e uma fatia de melancia",
        "texto_original": "R24.181 Frango ensopado (coxa e sobrecoxa sem osso) com molho de tomate (feito na escola) e batata, arroz, feijão, couve-flor refogado, salada de brócolis e uma fatia de melancia"
      },
      {
        "data": "17/10/2025",
        "turno": "Vespertino",
        "codigo": "R24.181",
        "descricao": "Frango ensopado (coxa e sobrecoxa sem osso) com molho de tomate (feito na escola) e batata, arroz, feijão, couve-flor refogado, salada de brócolis e uma fatia de melancia",
        "texto_original": "R24.181 Frango ensopado (coxa e sobrecoxa sem osso) com molho de tomate (feito na escola) e batata, arroz, feijão, couve-flor refogado, salada de brócolis e uma fatia de melancia"
      },
      {
        "data": "17/10/2025",
        "turno": "Noturno",
        "codigo": "R24.181",
        "descricao": "Frango ensopado (coxa e sobrecoxa sem osso) com molho de tomate (feito na escola) e batata, arroz, feijão, couve-flor refogado, salada de brócolis e uma fatia de melancia",
        "texto_original": "R24.181 Frango ensopado (coxa e sobrecoxa sem osso) com molho de tomate (feito na escola) e batata, arroz, feijão, couve-flor refogado, salada de brócolis e uma fatia de melancia"
      }
    ],
    "20/10/2025": [
      {
        "data": "20/10/2025",
        "turno": "Matutino",
        "codigo": "R25.401",
        "descricao": "Carreteiro (arroz integral, carne bovina em iscas, tomate e cebola), legumes refogados (cenoura e chuchu), salada de alface e uma laranja",
        "texto_original": "R25.401 Carreteiro (arroz integral, carne bovina em iscas, tomate e cebola), legumes refogados (cenoura e chuchu), salada de alface e uma laranja"
      },
      {
        "data": "20/10/2025",
        "turno": "Vespertino",
        "codigo": "R25.401",
        "descricao": "Carreteiro (arroz integral, carne bovina em iscas, tomate e cebola), legumes refogados (cenoura e chuchu), salada de alface e uma laranja",
        "texto_original": "R25.401 Carreteiro (arroz integral, carne bovina em iscas, tomate e cebola), legumes refogados (cenoura e chuchu), salada de alface e uma laranja"
      },
      {
        "data": "20/10/2025",
        "turno": "Noturno",
        "codigo": "R25.401",
        "descricao": "Carreteiro (arroz integral, carne bovina em iscas, tomate e cebola), legumes refogados (cenoura e chuchu), salada de alface e uma laranja",
        "texto_original": "R25.401 Carreteiro (arroz integral, carne bovina em iscas, tomate e cebola), legumes refogados (cenoura e chuchu), salada de alface e uma laranja"
      }
    ],
    "21/10/2025": [
      {
        "data": "21/10/2025",
        "turno": "Matutino",
        "codigo": "LL25.303",
        "descricao": "Torta de frango com 50% aveia (com peito de frango desfiado, tomate e abobrinha em cubos, cebola e tempero verde), suco de uva integral sem adição de açúcar e uma banana",
        "texto_original": "LL25.303 Torta de frango com 50% aveia (com peito de frango desfiado, tomate e abobrinha em cubos, cebola e tempero verde), suco de uva integral sem adição de açúcar e uma banana"
      },
      {
        "data": "21/10/2025",
        "turno": "Vespertino",
        "codigo": "LL25.303",
        "descricao": "Torta de frango com 50% aveia (com peito de frango desfiado, tomate e abobrinha em cubos, cebola e tempero verde), suco de uva integral sem adição de açúcar e uma banana",
        "texto_original": "LL25.303 Torta de frango com 50% aveia (com peito de frango desfiado, tomate e abobrinha em cubos, cebola e tempero verde), suco de uva integral sem adição de açúcar e uma banana"
      },
      {
        "data": "21/10/2025",
        "turno": "Noturno",
        "codigo": "LL25.303",
        "descricao": "Torta de frango com 50% aveia (com peito de frango desfiado, tomate e abobrinha em cubos, cebola e tempero verde), suco de uva integral sem adição de açúcar e uma banana",
        "texto_original": "LL25.303 Torta de frango com 50% aveia (com peito de frango desfiado, tomate e abobrinha em cubos, cebola e tempero verde), suco de uva integral sem adição de açúcar e uma banana"
      },
      {
        "data": "21/10/2025",
        "turno": "Noturno",
        "codigo": "R25.335",
        "descricao": "Frango em cubos refogado com tomate e ervilha congelada, arroz, feijão, farofa de beterraba, salada de repolho e uma banana",
        "texto_original": "R25.335 Frango em cubos refogado com tomate e ervilha congelada, arroz, feijão, farofa de beterraba, salada de repolho e uma banana"
      },
      {
        "data": "21/10/2025",
        "turno": "Matutino",
        "codigo": "R25.335",
        "descricao": "Frango em cubos refogado com tomate e ervilha congelada, arroz, feijão, farofa de beterraba, salada de repolho e uma banana",
        "texto_original": "R25.335 Frango em cubos refogado com tomate e ervilha congelada, arroz, feijão, farofa de beterraba, salada de repolho e uma banana"
      },
      {
        "data": "21/10/2025",
        "turno": "Vespertino",
        "codigo": "R25.335",
        "descricao": "Frango em cubos refogado com tomate e ervilha congelada, arroz, feijão, farofa de beterraba, salada de repolho e uma banana",
        "texto_original": "R25.335 Frango em cubos refogado com tomate e ervilha congelada, arroz, feijão, farofa de beterraba, salada de repolho e uma banana"
      }
    ],
    "22/10/2025": [
      {
        "data": "22/10/2025",
        "turno": "Matutino",
        "codigo": "R25.282",
        "descricao": "Polenta com molho de carne moída (carne bovina moída e molho de tomate feito na escola), arroz, feijão, salada de couve-flor e uma tangerina",
        "texto_original": "R25.282 Polenta com molho de carne moída (carne bovina moída e molho de tomate feito na escola), arroz, feijão, salada de couve-flor e uma tangerina"
      },
      {
        "data": "22/10/2025",
        "turno": "Vespertino",
        "co
digo": "R25.282",
        "descricao": "Polenta com molho de carne moída (carne bovina moída e molho de tomate feito na escola), arroz, feijão, salada de couve-flor e uma tangerina",
        "texto_original": "R25.282 Polenta com molho de carne moída (carne bovina moída e molho de tomate feito na escola), arroz, feijão, salada de couve-flor e uma tangerina"
      },
      {
        "data": "22/10/2025",
        "turno": "Noturno",
        "codigo": "R25.282",
        "descricao": "Polenta com molho de carne moída (carne bovina moída e molho de tomate feito na escola), arroz, feijão, salada de couve-flor e uma tangerina",
        "texto_original": "R25.282 Polenta com molho de carne moída (carne bovina moída e molho de tomate feito na escola), arroz, feijão, salada de couve-flor e uma tangerina"
      }
    ],
    "23/10/2025": [
      {
        "data": "23/10/2025",
        "turno": "Matutino",
        "codigo": "LL25.740",
        "descricao": "Cuca de banana com aveia e canela, leite com café, açúcar e uma fatia de mamão",
        "texto_original": "LL25.740 Cuca de banana com aveia e canela, leite com café, açúcar e uma fatia de mamão"
      },
      {
        "data": "23/10/2025",
        "turno": "Vespertino",
        "codigo": "LL25.740",
        "descricao": "Cuca de banana com aveia e canela, leite com café, açúcar e uma fatia de mamão",
        "texto_original": "LL25.740 Cuca de banana com aveia e canela, leite com café, açúcar e uma fatia de mamão"
      },
      {
        "data": "23/10/2025",
        "turno": "Noturno",
        "codigo": "LL25.740",
        "descricao": "Cuca de banana com aveia e canela, leite com café, açúcar e uma fatia de mamão",
        "texto_original": "LL25.740 Cuca de banana com aveia e canela, leite com café, açúcar e uma fatia de mamão"
      },
      {
        "data": "23/10/2025",
        "turno": "Noturno",
        "codigo": "R25.332",
        "descricao": "Filé de Tilápia (temperado com limão, alho, cebola e tempero verde) ensopado com molho de tomate (feito na escola), arroz com espinafre, feijão, batata assada, salada de rúcula e uma fatia de mamão",
        "texto_original": "R25.332 Filé de Tilápia (temperado com limão, alho, cebola e tempero verde) ensopado com molho de tomate (feito na escola), arroz com espinafre, feijão, batata assada, salada de rúcula e uma fatia de mamão"
      },
      {
        "data": "23/10/2025",
        "turno": "Matutino",
        "codigo": "R25.332",
        "descricao": "Filé de Tilápia (temperado com limão, alho, cebola e tempero verde) ensopado com molho de tomate (feito na escola), arroz com espinafre, feijão, batata assada, salada de rúcula e uma fatia de mamão",
        "texto_original": "R25.332 Filé de Tilápia (temperado com limão, alho, cebola e tempero verde) ensopado com molho de tomate (feito na escola), arroz com espinafre, feijão, batata assada, salada de rúcula e uma fatia de mamão"
      },
      {
        "data": "23/10/2025",
        "turno": "Vespertino",
        "codigo": "R25.332",
        "descricao": "Filé de Tilápia (temperado com limão, alho, cebola e tempero verde) ensopado com molho de tomate (feito na escola), arroz com espinafre, feijão, batata assada, salada de rúcula e uma fatia de mamão",
        "texto_original": "R25.332 Filé de Tilápia (temperado com limão, alho, cebola e tempero verde) ensopado com molho de tomate (feito na escola), arroz com espinafre, feijão, batata assada, salada de rúcula e uma fatia de mamão"
      }
    ],
    "24/10/2025": [
      {
        "data": "24/10/2025",
        "turno": "Matutino",
        "codigo": "R25.260",
        "descricao": "Macarronada de frango (macarrão parafuso com frango desfiado ensopado com molho de tomate), salada de couve picada, salada de beterraba cozida e uma fatia de melancia",
        "texto_original": "R25.260 Macarronada de frango (macarrão parafuso com frango desfiado ensopado com molho de tomate), salada de couve picada, salada de beterraba cozida e uma fatia de melancia"
      },
      {
        "data": "24/10/2025",
        "turno": "Vespertino",
        "codigo": "R25.260",
        "descricao": "Macarronada de frango (macarrão parafuso com frango desfiado ensopado com molho de tomate), salada de couve picada, salada de beterraba cozida e uma fatia de melancia",
        "texto_original": "R25.260 Macarronada de frango (macarrão parafuso com frango desfiado ensopado com molho de tomate), salada de couve picada, salada de beterraba cozida e uma fatia de melancia"
      },
      {
        "data": "24/10/2025",
        "turno": "Noturno",
        "codigo": "R25.260",
        "descricao": "Macarronada de frango (macarrão parafuso com frango desfiado ensopado com molho de tomate), salada de couve picada, salada de beterraba cozida e uma fatia de melancia",
        "texto_original": "R25.260 Macarronada de frango (macarrão parafuso com frango desfiado ensopado com molho de tomate), salada de couve picada, salada de beterraba cozida e uma fatia de melancia"
      }
    ]
  },
  "tabela_bruta": [
    [
      "CARDÁPIO – PARCIAL OUTUBRO/2025",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ],
    [
      "",
      "",
      "",
      "Quarta – feira 1/10/2025",
      "Quinta – feira 2/10/2025",
      "Sexta – feira 3/10/2025",
      "",
      ""
    ],
    [
      "Matutino\nVespertino\nSemana 1",
      "",
      "",
      "R25.375 Carne bovina em cubos\nrefogada com tomate e cenoura,\narroz, feijão, purê de batata,\nsalada de alface e couve fatiado e\num pêssego",
      "R25.97 Frango em iscas refogado\ncom abobrinha, tomate, cebola e\ntempero verde, arroz, feijão,\nsalada de pepino e uma tangerina",
      "LL25.228 Torta de carne (com\ncarne moída, tomate, ervilha\ncongelada, cebola e tempero\nverde), suco de uva integral sem\nadição de açúcar e uma banana",
      "",
      ""
    ],
    [
      "Noturno\nSemana 1",
      "",
      "",
      "R25.375 Carne bovina em cubos\nrefogada com tomate e cenoura,\narroz, feijão, purê de batata,\nsalada de alface e couve fatiado e\num pêssego",
      "R25.97 Frango em iscas refogado\ncom abobrinha, tomate, cebola e\ntempero verde, arroz, feijão,\nsalada de pepino e uma tangerina",
      "R24.202 Carne bovina moída\nrefogada com tomate em cubos e\ntempero verde, arroz, feijão,\nsalada de couve flor e brócolis e\numa banana",
      "",
      ""
    ],
    [
      "PAGE_MARKER_1",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ],
    [
      "CARDÁPIO – PARCIAL OUTUBRO/2025",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ],
    [
      "",
      "Segunda – feira 6/10/2025",
      "Terça – feira 7/10/2025",
      "Quarta – feira 8/10/2025",
      "Quinta – feira 9/10/2025",
      "Sexta – feira 10/10/2025",
      "",
      ""
    ],
    [
      "Matutino\nVespertino\nSemana 2",
      "LL24.222 Leite batido com\nmorango e banana, biscoito\ncaseiro sem gordura trans e uma\nlaranja",
      "R25.218 Carne suína em cubos\nrefogada com molho de tomate\n(feito na escola), polenta, arroz,\nfeijão, salada de beterraba\ncozida e uma fatia de mamão",
      "R25.231 Frango em iscas\nacebolado, arroz, feijão, batata\nrefogada com tomate, salada de\nrepolho roxo e uma maçã",
      "R25.458 Feijoada de carne\nbovina com legumes (feijão com\ncarne bovina em cubos, batata\ndoce e abóbora em cubos),\narroz, farofa de cenoura ralada e\numa tangerina",
      "LL24.22 Pão massinha com peito\nde frango desfiado ensopado ao\nmolho de tomate (feito na\nescola), alface, tomate em fatia,\nsuco de laranja integral sem\nadição de açúcar e uma banana",
      "",
      ""
    ],
    [
      "Noturno\nSemana 2",
      "R25.579 Omelete de espinafre\ncom queijo e orégano (Fortaia),\narroz, feijão, salada de chuchu\ncom tempero verde e uma\nlaranja",
      "R25.218 Carne suína em cubos\nrefogada com molho de tomate\n(feito na escola), polenta, arroz,\nfeijão, salada de beterraba\ncozida e uma fatia de mamão",
      "R25.231 Frango em iscas\nacebolado, arroz, feijão, batata\nrefogada com tomate, salada de\nrepolho roxo e uma maçã",
      "R25.458 Feijoada de carne\nbovina com legumes (feijão com\ncarne bovina em cubos, batata\ndoce e abóbora em cubos),\narroz, farofa de cenoura ralada\ne uma tangerina",
      "LL24.22 Pão massinha com peito\nde frango desfiado ensopado ao\nmolho de tomate (feito na\nescola), alface, tomate em fatia,\nsuco de laranja integral sem\nadição de açúcar e uma banana",
      "",
      ""
    ],
    [
      "PAGE_MARKER_2",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ],
    [
      "CARDÁPIO – PARCIAL OUTUBRO/2025",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ],
    [
      "",
      "Segunda – feira 13/10/2025",
      "Terça – feira 14/10/2025",
      "Quarta – feira 15/10/2025",
      "Quinta – feira 16/10/2025",
      "Sexta – feira 17/10/2025",
      "",
      ""
    ],
    [
      "Matutino\nVespertino\nSemana 3",
      "R25.101 Macarronada de frango\n(Macarrão (parafuso) com frango\ndesfiado ensopado com molho\nde tomate), salada de repolho\npicado, salada de abóbora e uma\nlaranja",
      "R25.81 Carne bovina em iscas\nacebolada, arroz, feijão, batata\ndoce assada, salada de alface e\numa fatia de mamão",
      "FERIADO",
      "R25.575 Arroz colorido com\nfrango (arroz integral, frango\ndesfiado, abobrinha em cubos e\nmilho verde congelado), feijão,\nsalada de agrião e uma maçã",
      "LL25.64 Bolo de cenoura\nnutritivo (cenoura, maçã, aveia e\nfarinha de trigo integral), leite\ncom café, açúcar e uma banana",
      "",
      ""
    ],
    [
      "Noturno\nSemana 3",
      "R25.101 Macarronada de frango\n(Macarrão (parafuso) com frango\ndesfiado ensopado com molho\nde tomate), salada de repolho\npicado, salada de abóbora e uma\nlaranja",
      "R25.81 Carne bovina em iscas\nacebolada, arroz, feijão, batata\ndoce assada, salada de alface e\numa fatia de mamão",
      "FERIADO",
      "R25.575 Arroz colorido com\nfrango (arroz integral, frango\ndesfiado, abobrinha em cubos e\nmilho verde congelado), feijão,\nsalada de agrião e uma maçã",
      "R25.312 Filé de tilápia assado\n(temperado com limão, alho,\ncebola, e tempero verde), arroz,\nfeijão, salada de batata com\ncenoura e tempero verde e uma\nbanana",
      "",
      ""
    ],
    [
      "PAGE_MARKER_3",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ],
    [
      "CARDÁPIO – PARCIAL OUTUBRO/2025",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ],
    [
      "",
      "Segunda – feira 20/10/2025",
      "Terça – feira 21/10/2025",
      "Quarta – feira 22/10/2025",
      "Quinta – feira 23/10/2025",
      "Sexta – feira 24/10/2025",
      "",
      ""
    ],
    [
      "Matutino\nVespertino\nSemana 4",
      "LL24.83 Salada de frutas\n(mamão, banana e laranja),\naveia*, iogurte de mel (iogurte\nnatural batido com mel) e\nbiscoito caseiro sem gordura\ntrans. *servir separadamente",
      "R25.234 Frango em cubos\nrefogado com tomate e ervilha\ncongelada, arroz, feijão, farofa de\ncenoura, salada de repolho e\numa banana",
      "LL23.281 Pão massinha com\ncarne bovina moída ensopada\ncom molho de tomate (feito na\nescola), alface, tomate em fatias,\nsuco de uva integral sem adição\nde açúcar e uma maçã",
      "R25.464 Omelete de cenoura\ncom queijo e orégano (Fortaia),\narroz, feijão, salada de abobrinha\ncom chuchu e uma fatia de\nmamão",
      "R24.181 Frango ensopado (coxa e\nsobrecoxa sem osso) com molho\nde tomate (feito na escola) e\nbatata, arroz, feijão, couve-flor\nrefogado, salada de brócolis e\numa fatia de melancia",
      "",
      ""
    ],
    [
      "Noturno\nSemana 4",
      "R25.341 Estrogonofe de carne\nbovina em iscas com molho\nbranco (feito na escola), arroz,\nbatata doce assada, salada de\nbeterraba ralada e uma laranja",
      "R25.234 Frango em cubos\nrefogado com tomate e e\nrvilha congelada, arroz, feijão,\nfarofa de cenoura, salada de\nrepolho e uma banana",
      "LL23.281 Pão massinha com\ncarne bovina moída ensopada\ncom molho de tomate (feito na\nescola), alface, tomate em fatias,\nsuco de uva integral sem adição\nde açúcar e uma maçã",
      "R25.464 Omelete de cenoura\ncom queijo e orégano (Fortaia),\narroz, feijão, salada de abobrinha\ncom chuchu e uma fatia de\nmamão",
      "R24.181 Frango ensopado (coxa e\nsobrecoxa sem osso) com molho\nde tomate (feito na escola) e\nbatata, arroz, feijão, couve-flor\nrefogado, salada de brócolis e\numa fatia de melancia",
      "",
      ""
    ],
    [
      "PAGE_MARKER_4",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ],
    [
      "CARDÁPIO – PARCIAL OUTUBRO/2025",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ],
    [
      "",
      "Segunda – feira 27/10/2025",
      "Terça – feira 28/10/2025",
      "Quarta – feira 29/10/2025",
      "Quinta – feira 30/10/2025",
      "Sexta – feira 31/10/2025",
      "",
      ""
    ],
    [
      "Matutino\nVespertino\nSemana 5",
      "R25.401 Carreteiro (arroz\nintegral, carne bovina em iscas,\ntomate e cebola), legumes\nrefogados (cenoura e chuchu),\nsalada de alface e uma laranja",
      "LL25.303 Torta de frango com\n50% aveia (com peito de frango\ndesfiado, tomate e abobrinha em\ncubos, cebola e tempero verde),\nsuco de uva integral sem adição\nde açúcar e uma banana",
      "R25.282 Polenta com molho de\ncarne moída (carne bovina moída\ne molho de tomate feito na\nescola), arroz, feijão, salada de\ncouve-flor e uma tangerina",
      "LL25.740 Cuca de banana com\naveia e canela, leite com café,\naçúcar e uma fatia de mamão",
      "R25.260 Macarronada de frango\n(macarrão parafuso com frango\ndesfiado ensopado com molho\nde tomate), salada de couve\npicada, salada de beterraba\ncozida e uma fatia de melancia",
      "",
      ""
    ],
    [
      "Noturno\nSemana 5",
      "R25.401 Carreteiro (arroz\nintegral, carne bovina em iscas,\ntomate e cebola), legumes\nrefogados (cenoura e chuchu),\nsalada de alface e uma laranja",
      "R25.335 Frango em cubos\nrefogado com tomate e ervilha\ncongelada, arroz, feijão, farofa de\nbeterraba, salada de repolho e\numa banana",
      "R25.282 Polenta com molho de\ncarne moída (carne bovina\nmoída e molho de tomate feito\nna escola), arroz, feijão, salada\nde couve-flor e uma tangerina",
      "R25.332 Filé de Tilápia\n(temperado com limão, alho,\ncebola e tempero verde)\nensopado com molho de tomate\n(feito na escola), arroz com\nespinafre, feijão, batata assada,\nsalada de rúcula e uma fatia de\nmamão",
      "R25.260 Macarronada de frango\n(macarrão parafuso com frango\ndesfiado ensopado com molho\nde tomate), salada de couve\npicada, salada de beterraba\ncozida e uma fatia de melancia",
      "",
      ""
    ],
    [
      "PAGE_MARKER_5",
      "",
      "",
      "",
      "",
      "",
      "",
      ""
    ]
  ],
  "metadados": {
    "arquivo_original": "temp_1758061996845_Parcial - Outubro.pdf",
    "data_processamento": "2025-09-16T19:33:17.648061",
    "metodo": "pdfplumber",
    "dimensoes_tabela": "25 linhas x 8 colunas"
  }
}
JSON_RESULTADO_END

🗑️ Arquivo temporário removido
✅ JSON extraído com sucesso dos marcadores
✅ Processamento Python concluído com sucesso
📊 Dados extraídos: { total_refeicoes: 81, total_dias: 18, tem_tabela_bruta: true }
