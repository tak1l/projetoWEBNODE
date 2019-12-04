const Opereter = require('../config/constants.json')
const ws2 = require('../config/services/ws2')


module.exports = {
  async testOperetor(req, res) {
    try {
      const {
        operetor   ,
        brand      ,
        store      ,
        codBrand   ,
        codSecurity,
        value      ,
        Parcelas      ,
      } = req.body
      
      if (!Opereter.hasOwnProperty(operetor)) {
        return res.status(401).json({
          resposta  : "FALHA!!",
          detalhes  : "Operadora não existente",
          operadora : operetor
        })
      }else if (!Opereter[operetor].lojasAutorizadas.hasOwnProperty(store)) {
        return res.status(401).json({
          resposta  : "FALHA!!",
          detalhes  : "Loja não autorizada",
          operadora : operetor,
          codLoja   : store
        })
      } 
      else if (!Opereter[operetor].bandeirasAutorizadas.hasOwnProperty(brand)) {
        return res.status(401).json({
          resposta  : "FALHA!!",
          detalhes  : "Bandeira não autorizada",
          operadora : operetor,
          bandeira  : brand
        })
      } 

      const response = await ws2.post('/ws-brands/v1/pay', {
        codBrand   ,
        brand      ,
        codSecurity,
        value      ,
        Parcelas      ,
        operetor   ,
        store      ,
      })

      return res.status(200).json(response.data)

    } catch (error) {
      console.log('test')
      return res.status(400).json({ message: `this is the error ${error}` })
    }
  },

  async status(req, res) {
    try {
      return res.status(200).json({
        status: 'WS1 Disponível'
      })
    } catch (error) {
      return res.status(400).json({ message: `this is the error ${error}` })
    }
  }
}

