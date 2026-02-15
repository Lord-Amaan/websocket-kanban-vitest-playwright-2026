# MongoDB Setup Guide

## Option 1: MongoDB Atlas (Cloud - Recommended)

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up (free tier available)

2. **Create a Cluster**
   - Click "Create" to deploy a free M0 cluster
   - Select your region
   - Wait for cluster to be created (5-10 minutes)

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create username and password
   - Grant Read/Write privileges

4. **Configure Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Add your IP address (or 0.0.0.0/0 for development)

5. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string: `mongodb+srv://username:password@cluster.mongodb.net/kanban-board?retryWrites=true&w=majority`

6. **Update .env File**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/kanban-board?retryWrites=true&w=majority
   PORT=3002
   NODE_ENV=development
   ```

## Option 2: Local MongoDB

1. **Install MongoDB Community Edition**
   - Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
   - Mac: `brew install mongodb-community`
   - Linux: Follow official docs

2. **Start MongoDB Service**
   ```bash
   # Windows
   net start MongoDB
   
   # Mac
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

3. **Update .env File**
   ```
   MONGODB_URI=mongodb://localhost:27017/kanban-board
   PORT=3002
   NODE_ENV=development
   ```

## Installation Steps

1. **Install Dependencies** (in backend folder)
   ```bash
   npm install
   ```

2. **Create .env file** with your MongoDB connection string (already created)

3. **Start the Server**
   ```bash
   npm run dev    # Development with nodemon
   npm start      # Production
   ```

4. **Verify Connection**
   - Check console for: `MongoDB connected successfully`
   - Sample tasks will be created on first run

## Troubleshooting

- **"MongoDB connection error"**: Check your MONGODB_URI in .env
- **"Authentication failed"**: Verify username/password are correct
- **"Network error"**: Check if your IP is whitelisted (Atlas only)
- **"Database doesn't exist"**: It will be created automatically on first write

## Data Persistence

All tasks are now saved to MongoDB:
- Tasks persist across server restarts
- Real-time sync via WebSocket
- Attachments stored as base64 in database
- Automatic timestamp management
