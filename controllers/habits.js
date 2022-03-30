const Habit = require("../models/habit");

async function getAll(req, res) {
  try {
    const habits = await Habit.all;
    res.status(200).json(habits);
  } catch (err) {
    res.status(500).send(err);
  }
}

async function getById(req, res) {
  try {
    const habit = await Habit.getById(req.params.id);
    res.status(200).json(habit);
  } catch (err) {
    res.status(500).send(err);
  }
}

async function create(req, res) {
  try {
    const habit = await Habit.create(req.body);
    res.status(201).json({ habit, success: true });
  } catch (err) {
    res.status(422).json({ err });
  }
}

async function update(req, res) {
  try {
    const habit = await Habit.updateTimesDone(req.body);
    res.status(202).json(habit);
  } catch (err) {
    res.status(422);
  }
}

async function destroy(req, res) {
  try {
    const habit = await Habit.getById(req.params.id);
    await habit.destroy();
    res.status(204).end();
  } catch (err) {
    res.status(404).json({ err });
  }
}

module.exports = { getAll, getById, create, update, destroy };
