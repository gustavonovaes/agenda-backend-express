const filterByKeys = require('../utils/filterByKeys');

const atividadeController = {
  async index(req, res) {
    const atividades = await req.$models.Atividade.find();
    res.status(200).json(atividades);
  },

  async store(req, res) {
    const createData = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      dataInicio: req.body.dataInicio,
      dataPrazo: req.body.dataPrazo,
      status: req.body.status,
    };

    const atividade = await req.$models.Atividade.create(createData);

    res.status(201).json(atividade);
  },

  async update(req, res) {
    const { id } = req.params;

    const keys = ['titulo', 'descricao', 'dataInicio', 'dataPrazo', 'status'];
    const updateData = filterByKeys(req.body, keys);

    const atividade = await req.$models.Atividade.findByIdAndUpdate(
      id,
      updateData,
      { new: true, useFindAndModify: false },
    );

    if (atividade === null) {
      res.status(404).json({
        message: 'Atividade não encontrada para o id informado!',
      });
    }

    res.status(200).json(atividade);
  },

  async delete(req, res) {
    const { id } = req.params;

    await req.$models.Atividade.findByIdAndDelete(id, {
      useFindAndModify: false,
    });

    res.status(204).send();
  },

  async done(req, res) {
    const { id } = req.params;

    const updateData = {
      status: 'concluída',
      dataConclusao: new Date(),
    };

    const atividade = await req.$models.Atividade.findByIdAndUpdate(
      id,
      updateData,
      { new: true, useFindAndModify: false },
    );

    if (atividade === null) {
      res.status(404).json({
        message: 'Atividade não encontrada para o id informado!',
      });
    }

    res.status(200).send(atividade);
  },
};

module.exports = atividadeController;
