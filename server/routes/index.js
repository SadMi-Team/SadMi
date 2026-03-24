var express = require("express");
var router = express.Router();

router.get("/", (req, res) => {
  res.json({ mensagem: "Requisição GET recebida" });
});

router.post("/", (req, res) => {
  res.json({ mensagem: "Requisição POST recebida", dados: req.body });
});

router.put("/:id", (req, res) => {
  const id = req.params.id;
  res.json({
    mensagem: `Requisição PUT recebida para o ID ${id}`,
    dados: req.body,
  });
});

router.patch("/:id", (req, res) => {
  const id = req.params.id;
  res.json({
    mensagem: `Requisição PATCH recebida para o ID ${id}`,
    dados: req.body,
  });
});

router.delete("/:id", (req, res) => {
  const id = req.params.id;
  res.json({ mensagem: `Requisição DELETE recebida para a ID ${id}` });
});

module.exports = router;
