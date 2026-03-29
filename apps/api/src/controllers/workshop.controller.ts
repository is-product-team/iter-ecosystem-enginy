import { Request, Response } from 'express';
import { workshopRepository } from '../repositories/workshop.repository.js';

export const getWorkshops = async (req: Request, res: Response) => {
  try {
    const workshops = await workshopRepository.findAllWithSectors();
    const total = await (workshopRepository as any).count();
    
    res.json({
      data: workshops,
      meta: {
        total,
        page: 1,
        limit: workshops.length,
        totalPages: 1
      }
    });
  } catch (error) {
    console.error("Error in workshop.controller.getWorkshops:", error);
    res.status(500).json({ error: 'Failed to retrieve workshops' });
  }
};

export const getWorkshopById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const workshop = await workshopRepository.findById(parseInt(String(id)));
    if (!workshop) {
      return res.status(404).json({ error: 'Workshop not found' });
    }
    res.json(workshop);
  } catch (error) {
    console.error("Error in workshop.controller.getWorkshopById:", error);
    res.status(500).json({ error: 'Failed to retrieve workshop' });
  }
};

export const createWorkshop = async (req: Request, res: Response) => {
  try {
    const newWorkshop = await workshopRepository.create(req.body);
    res.status(201).json(newWorkshop);
  } catch (error) {
    console.error("Error in workshop.controller.createWorkshop:", error);
    res.status(500).json({ error: 'Failed to create workshop' });
  }
};

export const updateWorkshop = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const updated = await workshopRepository.update(parseInt(String(id)), req.body);
    res.json(updated);
  } catch (error) {
    console.error("Error in workshop.controller.updateWorkshop:", error);
    res.status(500).json({ error: 'Failed to update workshop' });
  }
};

export const deleteWorkshop = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await workshopRepository.delete(parseInt(String(id)));
    res.status(204).send();
  } catch (error) {
    console.error("Error in workshop.controller.deleteWorkshop:", error);
    res.status(500).json({ error: 'Failed to delete workshop' });
  }
};
