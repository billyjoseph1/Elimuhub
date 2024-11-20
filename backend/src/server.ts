import express from 'express';
import cors from 'cors';
import routes from './routes';
import prisma from './models/index';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', routes);

async function main() {
    try {
        await prisma.$connect();
        console.log('Connected to the database successfully');
    } catch (error) {
        console.error('Database connection error:', error);
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});