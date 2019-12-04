const Brand = require('../config/constants.json')

const ws4 = require('../config/services/ws4')

module.exports = {
  async testBrand(req, res) {
    try {
      const {
        codBrand   ,
        brand      ,
        codSecurity,
        value      ,
        Parcelas      ,
        operetor   ,
      } = req.body

      let codBrandCard = codBrand.split('.') 
    
      if (
        !Brand.hasOwnProperty(brand) ||
        !(Brand[brand].codBandeira == codBrandCard[0]) ||  
        !Brand[brand].operadoresPermitidos.hasOwnProperty(operetor)
      ) {
        console.log("error")
        return res.status(401).json({
          cod_resposta  : "Operadora inválida",
          resposta      : "FALHA!!",
          detalhes      : "Operadora sem relação com a bandeira ou falha na leitura",
          cod_operadora : operetor
        })
      }else if(!(Parcelas <= Brand[brand].limiteParcela)) {
        return res.status(401).json({
          resposta              : "FALHA!!",
          detalhes              : "Limite de parcelas ultrapassado",
          infor                 : Brand[brand],
          parcelas_solicitadas  : Parcelas,
          limite_parcelas       : Brand[brand].parcelas
        })
      }

      const response = await ws4.post('/ws-banks/v1/pay', {
        codBrand   ,
        brand      ,
        codSecurity,
        value      ,
        Parcelas      ,
      })

      return res.status(200).json(response.data)

    } catch (error) {
      return res.status(400).json({ message: `this is the error ${error}` })
    }
  },

  async status(req, res) {
    try {
      res.status(200).json({ status: `Serviço disponível ws2` })
    } catch (error) {
      return res.status(400).json({ message: `this is the error ${error}` })
    }
  },

  async installmentsLimit(req, res) {
    try {
      const {
        brand
      } = req.query

      if (!Brand.hasOwnProperty(brand)) {
        return res.status(401).json({
          resposta: "ERRO",
          detalhes: "A bandeira informada não existe!!"
        })
      }

      Brand[brand].codBandeira = undefined
      return res.status(200).json(Brand[brand])
    } catch (error) {
      return res.status(400).json({ message: `this is the error ${error}` })
    }
  }
}