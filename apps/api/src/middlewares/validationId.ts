import { Request, Response, NextFunction } from 'express';

// This middleware stops the request if the ID is invalid, protecting the controller
const validateId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: "The ID must be numeric" });
  }
  
  // If everything is fine, proceed to the next step (the controller)
  next();
};

export default validateId;