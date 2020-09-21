const router = require('express').Router();

const { jwtMiddleware } = require('./services/jwt');

const atividadeController = require('./controllers/atividade');
const sessionController = require('./controllers/session');
const userController = require('./controllers/user');

// Wrap error handler
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

router.use('/api/atividades', jwtMiddleware);
router.get('/api/atividades', wrap(atividadeController.index));
router.post('/api/atividades', wrap(atividadeController.store));
router.put('/api/atividades/:id', wrap(atividadeController.update));
router.delete('/api/atividades/:id', wrap(atividadeController.delete));
router.patch(
  '/api/atividades/:id/concluir',
  wrap(atividadeController.done),
);

router.post('/api/users', wrap(userController.store));

router.post('/api/session', wrap(sessionController.store));
router.post('/api/session/refresh', jwtMiddleware, wrap(sessionController.refresh));

router.use((_, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

module.exports = router;
