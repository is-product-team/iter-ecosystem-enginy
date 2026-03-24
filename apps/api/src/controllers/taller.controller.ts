import { Request, Response } from 'express';
import { workshopRepository } from '../repositories/workshop.repository.js';

export const getWorkshops = async (req: Request, res: Response) => {
  try {
    const workshops = await workshopRepository.findAllWithSectors();
    res.json(workshops);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtenir els tallers' });
  }
};

export const getWorkshopById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const workshop = await workshopRepository.findById(parseInt(String(id)));
    if (!workshop) {
      return res.status(404).json({ error: 'Taller no trobat' });
    }
    res.json(workshop);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtenir el taller' });
  }
};

export const createWorkshop = async (req: Request, res: Response) => {
  try {
    const newWorkshop = await workshopRepository.create(req.body);
    res.status(201).json(newWorkshop);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el taller' });
  }
};

export const updateWorkshop = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updated = await workshopRepository.update(parseInt(String(id)), req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualitzar el taller' });
  }
};

export const deleteWorkshop = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await workshopRepository.delete(parseInt(String(id)));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el taller' });
  }
};
