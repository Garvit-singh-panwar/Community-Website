import "dotenv/config";

export const Env = {
    PORT:process.env.PORT,
    MONGODB_URL:process.env.MONGODB_URL,
    JWT_SECRET:process.env.JWT_SECRET,
    USER_EMAIL:process.env.USER_EMAIL,
    USER_PASS:process.env.USER_PASS,
    CLOUD_NAME:process.env.CLOUD_NAME,
    CLOUD_API_KEY:process.env.CLOUD_API_KEY,
    CLOUD_API_SECRET:process.env.CLOUD_API_SECRET,  
};