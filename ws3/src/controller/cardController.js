const query = require('../config/database/data')

module.exports = {
  async card(req, res) {
    try {
      const {
        codBrand   ,
        brand      ,
        codSecurity,
        value      ,
        Parcelas      ,
      } = req.body
        
      let cardUser = await query(`SELECT * FROM tb_cartao WHERE numero = "${codBrand}" AND bandeira = "${brand}" And cod_seguranca = ${codSecurity}`)
      cardUser = cardUser[0]
      
      if(!(cardUser)){    
        return res.status(401).json({message: "cartao não existe"})
      }    

      if(value >  cardUser.limite_em_centavos) {
        return res.json({
          message: 'LIMITE INDISPONÍVEL'
        })
      }

      let ano = new Date().getFullYear()
      let mes = new Date().getMonth()  
      let dia = cardUser.dia_fechamento_fatura
      let diat = new Date().getDay()
      
      let compra = await query(`INSERT INTO tb_compra(tb_cartao_id, data, valor_em_centavos) VALUES (${cardUser.id}, "${ano}-${mes + 1}-${diat}", ${value})`)
      let produto = await query(`SELECT * FROM tb_compra WHERE id = ${compra.insertId}`)
      produto = produto[0]
      
      let upCred = await query(`UPDATE tb_cartao SET limite_em_centavos = "${cardUser.limite_em_centavos - value}" WHERE  numero = "${codBrand}"`)
      let cardFatura = await query(`SELECT * from tb_fatura WHERE tb_cartao_id = ${cardUser.id}`)
      
      let anoTable  = cardFatura[cardFatura.length - 1].data_final.toLocaleDateString()
      let valorParcelado = parseFloat(value / Parcelas)
      let ano2
      let mes2
      for(let I = 0; I < Parcelas; I++ ) {
        mes++
        if(anoTable == `${ano}-${mes}-${dia}`){
          for(let i = 0; i < Parcelas - I; i++) {
            if(mes == '12') {
              mes = '0'
              ano++
            }
            mes++
            mes2 = mes - 1
            ano2 = ano
            if(mes2 == '0'){
              mes2 = '12'
              ano2 = ano - 1
            }
            await query(`INSERT INTO tb_fatura (tb_cartao_id, data_inicial, data_final) VALUES (${cardUser.id}, "${ano2}-${mes2}-${parseInt(dia) + 1}", "${ano}-${mes}-${dia}") `)
          }
          break;
        }
        if(mes == '12') {
          mes = '0'
          ano++
        }
      }
      cardFatura = await query(`SELECT * from tb_fatura WHERE tb_cartao_id = ${cardUser.id}`)
      
      produto.data.setDate(3)
      for(let i = 0; i < cardFatura.length-1; i++) {
        if(produto.data.toLocaleDateString() == cardFatura[i].data_final.toLocaleDateString()){
          for(let o = i; o < Parcelas; o++ ) {
            await query(`INSERT INTO tb_parcela  (tb_compra_id, tb_fatura_id, valor_em_centavos) VALUES  ('${produto.id}', '${cardFatura[o].id}', '${valorParcelado}')`)
          }
          break;
        }
      }
      
      return res.status(200).json({
        resposta: "sucesso",
        nome_cliente: cardUser.nome_cliente,
        valor_em_centavos: produto.valor_em_centavos,
        parcelas: Parcelas
        })
    } catch(error) {
      return res.status(400).json({ message: `Error ${error}`})
    }
  },

  async status(req, res) {
    try {
      return res.status(200).json('WS4 DISPONÍVEL')
    } catch (error) {
      return res.status(400).json({ message: `this is the error ${error}`})
    }
  }
}