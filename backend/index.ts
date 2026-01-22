import { connectDB } from "./src/config/database";
import app from "./src/app";

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server is running on PORT: ", PORT);
    })
}).catch((error) => {
    console.log("Failed to start the server");
    process.exit(1);
})