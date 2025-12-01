import "dotenv/config";
import express, { NextFunction, Request, Response } from 'express';
import eventsRoute from './routes/eventsRoute';
import authRoute from './routes/authRoutes'

import reservationRoute from "./routes/reservationRoute";
import morgan from 'morgan';
import createHttpError,{isHttpError} from "http-errors";
import cors from 'cors';

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}))

app.use(morgan('dev'));

app.use(express.json());

app.use("/api/auth", authRoute)

app.use("/api/reservation", reservationRoute)

app.use("/api/events", eventsRoute);


app.use((req,res,next) => {
  next(createHttpError(404, 'Ruta no encontrada'));
});




// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, req:Request, res:Response , next: NextFunction) => {
  console.error(error);
  let errorMessage = 'error desconocido en el servidor';
  let statusCode = 500;
  if (isHttpError(error)) {
    statusCode = error.status;
    errorMessage = error.message;
  }
  res.status(statusCode).json({ error: errorMessage });
})

export default app;