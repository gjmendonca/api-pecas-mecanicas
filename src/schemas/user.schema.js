function validateUser(data) {
  const { name, email, password } = data

  if (!name || !email || !password) {
    throw new Error("Campos obrigatórios faltando")
  }

  if (!email.includes("@")) {
    throw new Error("E-mail inválido")
  }
}

module.exports = { validateUser }