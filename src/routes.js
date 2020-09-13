const router = require('express').Router();

const atividadeController = require('./controllers/atividade');

// Wrap error handler
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);

router.get('/api/atividades', wrap(atividadeController.index));
router.post('/api/atividades', wrap(atividadeController.store));
router.put('/api/atividades/:id', wrap(atividadeController.update));
router.delete('/api/atividades/:id', wrap(atividadeController.delete));
router.patch('/api/atividades/:id/concluir', wrap(atividadeController.concluir));

router.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

module.exports = router;
