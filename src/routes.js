const router = require('express').Router();

const { jwtMiddleware } = require('./services/jwt');

const atividadeController = require('./controllers/atividade');
const autenticacaoController = require('./controllers/autenticacao');

// Wrap error handler
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

router.use('/api/atividades', jwtMiddleware);
router.get('/api/atividades', wrap(atividadeController.index));
router.post('/api/atividades', wrap(atividadeController.store));
router.put('/api/atividades/:id', wrap(atividadeController.update));
router.delete('/api/atividades/:id', wrap(atividadeController.delete));
router.patch(
  '/api/atividades/:id/concluir',
  wrap(atividadeController.concluir),
);

router.post('/api/autenticacao/registrar', wrap(autenticacaoController.registrar));
router.post('/api/autenticacao/login', wrap(autenticacaoController.login));
router.post('/api/autenticacao/refresh', jwtMiddleware, wrap(autenticacaoController.refresh));

router.use((_, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

module.exports = router;
