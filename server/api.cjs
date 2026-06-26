require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cors()); 
app.use(express.json());
app.use(cookieParser());

const rawMongoUri = process.env.MONGO_URI;
if (rawMongoUri) {
  try {
    const masked = rawMongoUri.replace(/\/\/(.+?:)(.+?)@/, (m, user, pass) => {
      return '//' + user + '*****@';
    });
    console.log('DEBUG: Loaded MONGO_URI ->', masked);
  } catch (e) {
    console.log('DEBUG: Loaded MONGO_URI (masked)');
  }
} else {
  console.log('⚠️  MONGO_URI not set in .env (will use fallback local URI).');
}

const MONGO_URI = rawMongoUri || 'mongodb://127.0.0.1:27017/video-project';


async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 120000,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err && err.message ? err.message : err);

    const msg = (err && err.message) ? err.message.toLowerCase() : '';

    if (msg.includes('server selection') || msg.includes('timed out')) {
      console.error('\n💡 Hint: Server selection timed out.');
      console.error('  - If using MongoDB Atlas, go to Atlas -> Network Access and add your IP (or 0.0.0.0/0 temporarily for testing).');
      console.error('  - Ensure outbound port 27017 is allowed by your firewall / ISP.');
      console.error('  - Try switching to a different network or mobile hotspot to test.\n');
    }

    if (msg.includes('authentication failed')) {
      console.error('\n💡 Hint: Authentication failed.');
      console.error('  - Check username/password in .env (special characters like @ must be URL encoded as %40).');
      console.error('  - Make sure the user exists in Atlas and has proper DB privileges.\n');
    }

    if (msg.includes('enotfound') || msg.includes('querysrv') || msg.includes('could not get hosts')) {
      console.error('\n💡 Hint: DNS / SRV issue.');
      console.error('  - If you are using mongodb+srv://, ensure your DNS can resolve SRV records.');
      console.error('  - Try using 8.8.8.8 as DNS in your network settings or use a non-SRV mongodb:// connection string from Atlas.\n');
    }

    process.exit(1);
  }
}

const categoryRoutes = require('./routes/categoryRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const videoRoutes = require('./routes/videoRoutes.js');
const savedRoutes = require('./routes/savedRoutes.js');


app.use('/api/categories', categoryRoutes);


app.use('/api/users', userRoutes);
app.use('/api/user', userRoutes);

app.use('/api/admins', adminRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api/videos', videoRoutes);
app.use('/api/users', savedRoutes); 
app.get('/', (req, res) => res.send('API OK'));

app.use((req, res) => res.status(404).send(`Cannot ${req.method} ${req.path}`));


const PORT = process.env.PORT || 5000;
let server; 

async function start() {
  await connectDB();
  server = app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}


function setupGracefulShutdown() {
  const shutdown = (signal) => {
    return async () => {
      try {
        console.log(`🛑 ${signal} received - shutting down server gracefully...`);
      
        if (server) {
          server.close((err) => {
            if (err) {
              console.error('❌ Error while closing HTTP server:', err);
            } else {
              console.log('HTTP server closed.');
            }
          });
        }
    
        try {
          await mongoose.connection.close();
          console.log('🔌 MongoDB connection closed.');
          process.exit(0);
        } catch (closeErr) {
          console.error('❌ Error closing MongoDB connection:', closeErr);
          process.exit(1);
        }
      } catch (err) {
        console.error('❌ Error during shutdown:', err);
        process.exit(1);
      }
    };
  };

  process.on('SIGINT', shutdown('SIGINT'));
  process.on('SIGTERM', shutdown('SIGTERM'));

  process.on('uncaughtException', (err) => {
    console.error('uncaughtException:', err);
    (async () => {
      try {
        await mongoose.connection.close();
      } catch (e) {} 
      process.exit(1);
    })();
  });

  process.on('unhandledRejection', (reason) => {
    console.error('unhandledRejection:', reason);
    (async () => {
      try {
        await mongoose.connection.close();
      } catch (e) {}
      process.exit(1);
    })();
  });
}

setupGracefulShutdown();
start().catch((err) => {
  console.error('Startup failure:', err);
  process.exit(1);
});