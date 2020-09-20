module.exports = {
  async login(req, res) {
    const { email, senha } = req.body;

    const usuario = await req.$models.Usuario.findOne({
      email,
      senha,
    }).exec();

    if (usuario === null) {
      res.status(400).json({
        message: 'Credenciais inválidas!',
      });
    }

    const token = req.$jwt.sign({
      id: usuario._id,
      nome: usuario.nome,
    });

    res.status(200).json({
      token,
    });
  },

  async registrar(req, res) {
    const usuarioData = {
      nome: req.body.nome,
      email: req.body.email,
      senha: req.body.senha,
    };

    const usuario = await req.$models.Usuario.create(usuarioData);

    const token = req.$jwt.sign({
      id: usuario._id,
      nome: usuario.nome,
    });

    res.status(201).json({ token });
  },

  async refresh(req, res) {
    const { id, nome } = req.user;

    const token = req.$jwt.sign({
      id,
      nome,
    });

    res.status(200).json({
      token,
    });
  },
};
