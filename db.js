import mongoose from "mongoose";

const connectDb = async () => {
  const URL = process.env.MONGO_URI;
  try {
    await mongoose.connect(URL, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDb is connected");
  } catch (error) {
    console.log(error.message);
  }
};

export default connectDb;
