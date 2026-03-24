import { Request, Response } from 'express';
import * as db from '../db';

export const getRoot = (req: Request, res: Response): void => {
    res.send("Backend server is running 🚀");
};

export const getHello = (req: Request, res: Response): void => {
    res.json({ message: "Hello from backend!" });
};

export const testDatabase = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await db.query("SELECT NOW() as current_time");
        res.json({
            message: "Database connected successfully!",
            timestamp: result.rows[0].current_time
        });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({
            message: "Database connection failed",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
