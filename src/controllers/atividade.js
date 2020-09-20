const atividadeController = {
  async index(req, res) {
    const atividades = await req.$models.Atividade.find();
    res.status(200).json(atividades);
  },

  async store(req, res) {
    const atividadeData = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      dataInicio: req.body.dataInicio,
      dataPrazo: req.body.dataPrazo,
      status: req.body.status,
    };

    const atividade = await req.$models.Atividade.create(atividadeData);

    res.status(201).json(atividade);
  },

  async update(req, res) {
    const campos = ['titulo', 'descricao', 'dataInicio', 'dataPrazo', 'status'];

    const atividadeData = Object.keys(req.body).reduce((acc, key) => {
      if (campos.includes(key)) {
        acc[key] = req.body[key];
      }

      return acc;
    }, {});

    const { id } = req.params;

    const atividade = await req.$models.Atividade.findByIdAndUpdate(
      id,
      atividadeData,
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

  async concluir(req, res) {
    const { id } = req.params;

    const update = {
      status: 'concluída',
      dataConclusao: new Date(),
    };

    const atividade = await req.$models.Atividade.findByIdAndUpdate(
      id,
      update,
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
