import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: true, // set this to 'true' to migrate tables upon startup (not recommended for prod)
    logging: false, // set this to 'true' if you're debugging all DB calls to the console
    entities: [__dirname + '../../entities/*.ts'],
});

export default AppDataSource;
