const bcrypt = require('bcryptjs');

module.exports = {
  async store(req, res) {
    const { name, email, password: passwordRaw } = req.body;

    const password = bcrypt.hashSync(passwordRaw, bcrypt.genSaltSync(10));

    const newUser = {
      name,
      email,
      password,
    };

    const user = await req.$models.User.create(newUser);

    const payload = {
      id: user._id,
      name: user.name,
    };
    const token = req.$jwt.sign(payload);

    res.status(201).json({ token });
  },
};
