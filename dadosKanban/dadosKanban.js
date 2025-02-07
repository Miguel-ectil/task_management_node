const express = require('express');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 🟢 Criar uma nova tarefa
router.post("/create-task", async (req, res) => {
  const { title, description, final_date, priority, status } = req.body;

  if (!title || !final_date) {
    return res.status(400).json({ error: "Título e data final são obrigatórios" });
  }

  const validStatuses = ['pendente', 'fazendo', 'aprovacao', 'finalizado'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: "Status inválido. Os status válidos são: 'pendente', 'fazendo', 'aprovacao', 'finalizado'." });
  }

  const { data, error } = await supabase.from("tasks").insert([{
    title, 
    description, 
    final_date: final_date, 
    priority, 
    status: status || 'pendente'
  }]);

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ message: "Tarefa criada!", task: data });
});

// 🔵 Obter todas as tarefas
router.get("/tasks", async (_, res) => {
  const { data, error } = await supabase.from("tasks").select("*");

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

// 🟠 Atualizar uma tarefa
router.put("/update-task/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body; // Somente os campos enviados

  if (updates.status) {
    const validStatuses = ['pendente', 'fazendo', 'aprovacao', 'finalizado'];
    if (!validStatuses.includes(updates.status)) {
      return res.status(400).json({ error: "Status inválido." });
    }
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(updates) // Atualiza apenas os campos enviados
    .eq("id", id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "Tarefa atualizada!", task: data });
});

// 🔴 Excluir uma tarefa
router.delete("/delete-task/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "Tarefa excluída!" });
});

module.exports = router; 
