import app from "./app";
import envValidation from "./util/validateEnv";
import mongoose from 'mongoose';


mongoose.connect(envValidation.MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
  app.listen(envValidation.PORT, () => {
    console.log(`Server is running on http://localhost:${envValidation.PORT}`);
  });
}).catch(console.error);