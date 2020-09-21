const bcrypt = require('bcryptjs');

module.exports = {
  async store(req, res) {
    const { email, password } = req.body;

    const user = await req.$models.User.findOne({ email }).exec();
    if (user === null) {
      res.status(401).json({
        message: 'Credenciais inválidas!',
      });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      res.status(401).json({
        message: 'Senha inválida!',
      });
    }

    const payload = {
      id: user._id,
      name: user.name,
    };
    const token = req.$jwt.sign(payload);

    res.status(200).json({ token });
  },

  async refresh(req, res) {
    const { id, name } = req.user;

    const payload = { id, name };
    const token = req.$jwt.sign(payload);

    res.status(200).json({ token });
  },
};
