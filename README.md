\# 🛒 E-COMMERCE WEBSITE - COMPUTERS \& COMPONENTS



\[!\[Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)

\[!\[Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)

\[!\[React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)

\[!\[MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)](https://www.mongodb.com/)

\[!\[Redis](https://img.shields.io/badge/Redis-Latest-red)](https://redis.io/)

\[!\[Nginx](https://img.shields.io/badge/Nginx-Alpine-green)](https://nginx.org/)



\## 📋 \*\*PROJECT OVERVIEW\*\*



This is a comprehensive e-commerce website built for selling computers and computer components exclusively. The project is developed as a final project for the WEB PROGRAMMING WITH NODE.JS course.



\### \*\*🎯 Current Status: LEVEL 3 COMPLETE ✅\*\*

\- ✅ \*\*Level 1\*\*: Basic Docker Compose deployment

\- ✅ \*\*Level 2\*\*: Nginx Load Balancing + Redis Queue + Backend Scaling

\- ✅ \*\*Level 3\*\*: Docker Swarm Orchestration with Multi-Replica Services



\*\*All 35 Required Features Implemented | Production-Ready Deployment\*\*



\### \*\*Technology Stack\*\*

\- \*\*Backend\*\*: Node.js + Express.js + MongoDB

\- \*\*Frontend\*\*: React.js + Bootstrap

\- \*\*Load Balancer\*\*: Nginx (reverse proxy \& load balancing)

\- \*\*Message Queue\*\*: Redis + Bull (async job processing)

\- \*\*Real-time\*\*: Socket.io

\- \*\*Authentication\*\*: JWT + Social Login (Google, Facebook)

\- \*\*Container\*\*: Docker + Docker Compose + Docker Swarm

\- \*\*Orchestration\*\*: Docker Swarm (Level 3)

\- \*\*Environment\*\*: dotenv-flow (multi-environment support)



\### \*\*Deployment Architecture\*\*



\#### \*\*Level 1: Basic Deployment\*\*

```

User → Frontend → Backend → MongoDB

```



\#### \*\*Level 2: Scaled Deployment with Load Balancing\*\*

```

User → Nginx → Backend (×3) → MongoDB

&nbsp;                 ↓             ↓

&nbsp;             Worker (×2) ← Redis

```



\#### \*\*Level 3: Docker Swarm Orchestration\*\*

```

&nbsp;                   Docker Swarm Cluster

&nbsp;                          |

&nbsp;         +----------------+----------------+

&nbsp;         |                |                |

&nbsp;   Nginx (×1)        Backend (×3)     Worker (×2)

&nbsp;         |                |                |

&nbsp;   Frontend (×2)     MongoDB (×1)     Redis (×1)

&nbsp;         |                |                |

&nbsp;   Visualizer (×1) ← Swarm Manager → Secrets

```



\*\*Features:\*\*

\- ✅ Multi-replica services (11 total replicas)

\- ✅ Automatic load balancing (Nginx + Swarm routing mesh)

\- ✅ Service discovery (Swarm DNS)

\- ✅ Health monitoring (Docker healthchecks)

\- ✅ Auto-restart on failure

\- ✅ Rolling updates (zero-downtime)

\- ✅ Resource limits and reservations

\- ✅ Secrets management

\- ✅ Overlay network isolation



\## 🚀 \*\*QUICK START - 3 DEPLOYMENT METHODS\*\*



\### \*\*Prerequisites\*\*

\- Docker \& Docker Compose (v2.0+)

\- Node.js 18+ (for local development only)

\- 8GB RAM minimum (for Docker deployments)



---



\## 🎯 \*\*METHOD 1: LOCAL DEVELOPMENT\*\* (Fastest for Development)



\*\*Best for\*\*: Local development, debugging, hot-reload



\### \*\*Step 1: Start MongoDB \& Redis\*\*

```bash

\# Option A: Using Docker

docker run -d -p 27017:27017 --name mongo mongo:latest

docker run -d -p 6379:6379 --name redis redis:latest



\# Option B: Install locally (Windows/Mac/Linux)

\# Install MongoDB and Redis from official websites

```



\### \*\*Step 2: Backend Setup\*\*

```bash

cd backend

npm install



\# Create environment file

cp .env.example .env.local



\# Edit .env.local with your configuration

\# Set NODE\_ENV=development

\# Set MONGODB\_URI=mongodb://localhost:27017/ecommerce

\# Set REDIS\_URL=redis://localhost:6379



\# Start backend

npm run dev

```



\### \*\*Step 3: Frontend Setup\*\*

```bash

cd frontend

npm install



\# Create environment file

echo "REACT\_APP\_API\_URL=http://localhost:5000/api" > .env.local



\# Start frontend

npm start

```



\### \*\*Step 4: Access Application\*\*

\- \*\*Frontend\*\*: http://localhost:3000

\- \*\*Backend API\*\*: http://localhost:5000/api

\- \*\*API Docs\*\*: http://localhost:5000/api/docs



\*\*Admin Credentials:\*\*

\- Email: admin@ecommerce.com

\- Password: admin123



\*\*User Credentials:\*\*

\- Email: john@example.com

\- Password: password123



---



\## 🐳 \*\*METHOD 2: DOCKER COMPOSE\*\* (Recommended for Testing)



\*\*Best for\*\*: Testing, quick deployment, learning Docker



\### \*\*Step 1: Build and Start All Services\*\*

```bash

cd ecommerce-project

docker-compose up -d

```



This will start \*\*6 services\*\*:

\- ✅ MongoDB (database)

\- ✅ Redis (message queue)

\- ✅ Backend x3 (API servers - load balanced)

\- ✅ Worker x2 (background job processors)

\- ✅ Frontend x2 (React app)

\- ✅ Nginx (load balancer \& reverse proxy)



\### \*\*Step 2: Wait for Services to Start\*\*

```bash

\# Wait 30 seconds for all services to initialize

Start-Sleep -Seconds 30  # PowerShell

\# sleep 30  # Linux/Mac



\# Check service status

docker-compose ps

```



\### \*\*Step 3: Access Application\*\*

\- \*\*Frontend\*\*: http://localhost

\- \*\*Backend API\*\*: http://localhost/api

\- \*\*Direct API\*\*: http://localhost:8080

\- \*\*API Health\*\*: http://localhost/api/health



\### \*\*Step 4: Scale Services (Optional)\*\*

```bash

\# Scale backend to 5 instances

docker-compose up -d --scale backend=5



\# Scale workers to 3 instances

docker-compose up -d --scale worker=3



\# Verify scaling

docker-compose ps

```



\### \*\*Step 5: View Logs\*\*

```bash

\# All services

docker-compose logs -f



\# Specific service

docker-compose logs -f nginx

docker-compose logs -f backend

docker-compose logs -f worker



\# Last 100 lines

docker-compose logs --tail=100

```



\### \*\*Step 6: Stop Services\*\*

```bash

\# Stop all services

docker-compose down



\# Stop and remove volumes (⚠️ deletes data)

docker-compose down -v

```



---



\## 🚀 \*\*METHOD 3: DOCKER SWARM\*\* (Production-Ready)



\*\*Best for\*\*: Production, high availability, orchestration, scaling



\### \*\*Prerequisites\*\*

\- Docker Swarm initialized

\- Pre-built images (backend, frontend, nginx)



\### \*\*Step 1: Initialize Docker Swarm\*\*

```bash

\# Initialize Swarm mode

docker swarm init



\# Verify Swarm is active

docker info | Select-String "Swarm"

```



\### \*\*Step 2: Create Docker Secrets\*\*

```bash

\# Navigate to swarm directory

cd ecommerce-project/swarm



\# Create secrets for sensitive data

echo "password123" | docker secret create db\_password -

echo "your-super-secret-jwt-key-change-in-production" | docker secret create jwt\_secret -

echo "your-email@gmail.com" | docker secret create email\_user -

echo "your-app-password" | docker secret create email\_password -



\# Verify secrets created

docker secret ls

```



\### \*\*Step 3: Build Docker Images\*\*

```bash

\# Navigate to project root

cd ecommerce-project



\# Build all images

docker-compose build



\# Verify images

docker images | Select-String "ecommerce"

```



\### \*\*Step 4: Deploy Stack to Swarm\*\*

```bash

\# Deploy the stack

cd swarm

docker stack deploy -c docker-stack.yml ecommerce



\# Wait for services to start (60 seconds)

Start-Sleep -Seconds 60

```



\### \*\*Step 5: Check Stack Status\*\*

```bash

\# View all services

docker stack services ecommerce



\# View specific service details

docker service ps ecommerce\_backend

docker service ps ecommerce\_worker

docker service ps ecommerce\_nginx



\# Check service logs

docker service logs ecommerce\_backend

docker service logs ecommerce\_worker

```



\### \*\*Step 6: Access Application\*\*

\- \*\*Frontend\*\*: http://localhost

\- \*\*Backend API\*\*: http://localhost/api

\- \*\*Direct API\*\*: http://localhost:8080

\- \*\*Visualizer\*\*: http://localhost:9000 (Swarm dashboard)



\### \*\*Step 7: Scale Services\*\*

```bash

\# Scale backend to 5 replicas

docker service scale ecommerce\_backend=5



\# Scale workers to 3 replicas

docker service scale ecommerce\_worker=3



\# Verify scaling

docker stack services ecommerce

```



\### \*\*Step 8: Update Services (Rolling Update)\*\*

```bash

\# Update backend image (zero-downtime)

docker service update --image ecommerce-project-backend:v2 ecommerce\_backend



\# Update will roll out 1 replica at a time with 10s delay

\# Automatic rollback if health checks fail

```



\### \*\*Step 9: Monitor Services\*\*

```bash

\# View service stats

docker stats



\# View Swarm nodes

docker node ls



\# View service logs (live)

docker service logs -f ecommerce\_backend



\# View Visualizer dashboard

\# Open http://localhost:9000 in browser

```



\### \*\*Step 10: Remove Stack\*\*

```bash

\# Remove entire stack

docker stack rm ecommerce



\# Wait for services to stop

Start-Sleep -Seconds 30



\# Verify removal

docker stack ls

```



---



\## 📊 \*\*COMPARISON OF DEPLOYMENT METHODS\*\*



| Feature | Local Dev | Docker Compose | Docker Swarm |

|---------|-----------|----------------|--------------|

| \*\*Setup Time\*\* | 5-10 min | 2-3 min | 5-10 min |

| \*\*Best For\*\* | Development | Testing | Production |

| \*\*Hot Reload\*\* | ✅ Yes | ❌ No | ❌ No |

| \*\*Scaling\*\* | ❌ Manual | ✅ Easy | ✅ Automatic |

| \*\*Load Balancing\*\* | ❌ No | ✅ Nginx | ✅ Nginx + Swarm |

| \*\*High Availability\*\* | ❌ No | ⚠️ Limited | ✅ Yes |

| \*\*Auto Restart\*\* | ❌ No | ✅ Yes | ✅ Yes |

| \*\*Rolling Updates\*\* | ❌ No | ⚠️ Manual | ✅ Automatic |

| \*\*Service Discovery\*\* | ❌ Manual | ✅ Docker DNS | ✅ Swarm DNS |

| \*\*Health Monitoring\*\* | ❌ Manual | ✅ Docker | ✅ Swarm |

| \*\*Resource Limits\*\* | ❌ No | ✅ Yes | ✅ Yes |

| \*\*Multi-Node\*\* | ❌ No | ❌ No | ✅ Yes |



---



\## 🔧 \*\*CONFIGURATION FILES\*\*



\### \*\*Environment Files Structure\*\*

```

backend/

&nbsp; ├── .env              # Base configuration (shared defaults)

&nbsp; ├── .env.local        # Local development (NODE\_ENV=development)

&nbsp; ├── .env.docker       # Docker deployment (NODE\_ENV=docker)

&nbsp; ├── .env.production   # Production deployment (NODE\_ENV=production)

&nbsp; └── .env.example      # Template for new setups

```



\### \*\*Automatic Environment Loading\*\*

The project uses `dotenv-flow` to automatically load the correct environment file based on `NODE\_ENV`:



```javascript

// Backend automatically loads correct .env file

require('dotenv-flow').config();



// Priority: .env.\[NODE\_ENV] > .env.local > .env

```



\### \*\*Environment Variables by Deployment Method\*\*



\*\*Local Development\*\* (`NODE\_ENV=development`):

\- MongoDB: `mongodb://localhost:27017/ecommerce`

\- Redis: `redis://localhost:6379`

\- Auto-import: Disabled (manual control)



\*\*Docker Compose/Swarm\*\* (`NODE\_ENV=docker`):

\- MongoDB: `mongodb://admin:password123@mongo:27017/ecommerce?authSource=admin`

\- Redis: `redis://redis:6379`

\- Auto-import: Enabled (first-time setup)



\*\*Production\*\* (`NODE\_ENV=production`):

\- MongoDB: Production connection string

\- Redis: Production Redis URL

\- Auto-import: Disabled

\- Enhanced security settings



---



\## 🎯 \*\*QUICK COMMANDS CHEAT SHEET\*\*



\### \*\*Local Development\*\*

```bash

\# Backend

cd backend \&\& npm install \&\& npm run dev



\# Frontend

cd frontend \&\& npm install \&\& npm start

```



\### \*\*Docker Compose\*\*

```bash

\# Start all services

docker-compose up -d



\# Scale backend

docker-compose up -d --scale backend=5



\# View logs

docker-compose logs -f



\# Stop all

docker-compose down

```



\### \*\*Docker Swarm\*\*

```bash

\# Deploy stack

docker stack deploy -c swarm/docker-stack.yml ecommerce



\# Check status

docker stack services ecommerce



\# Scale service

docker service scale ecommerce\_backend=5



\# View logs

docker service logs -f ecommerce\_backend



\# Remove stack

docker stack rm ecommerce

```



---



\## 🏗️ \*\*PROJECT STRUCTURE\*\*



```

ecommerce-project/

├── backend/                 # Node.js + Express.js API

│   ├── src/

│   │   ├── controllers/    # Business logic

│   │   ├── models/         # Database schemas

│   │   ├── routes/         # API endpoints

│   │   ├── middleware/     # Auth, validation, error handling

│   │   └── services/       # External services

│   ├── uploads/            # File storage

│   ├── tests/             # Backend tests

│   ├── package.json

│   ├── server.js

│   └── env.example

├── frontend/               # React.js application

│   ├── src/

│   │   ├── components/     # Reusable UI components

│   │   ├── pages/         # Route components

│   │   ├── services/      # API calls

│   │   ├── utils/         # Helper functions

│   │   └── styles/        # CSS files

│   ├── public/            # Static assets

│   └── package.json

├── docker/                # Containerization files

├── docker-compose.yml     # Multi-container orchestration

└── README.md

```



\## 🎯 \*\*KEY FEATURES\*\*



\### \*\*Customer Features (24 features)\*\*

\- ✅ User authentication (JWT + Social login)

\- ✅ Product browsing with pagination

\- ✅ Advanced search and filtering

\- ✅ Shopping cart with real-time updates

\- ✅ Guest checkout

\- ✅ Order tracking and history

\- ✅ Product reviews and ratings

\- ✅ Loyalty points system

\- ✅ Discount codes

\- ✅ Email notifications



\### \*\*Admin Features (7 features)\*\*

\- ✅ Product management (CRUD)

\- ✅ User management

\- ✅ Order management

\- ✅ Dashboard with analytics

\- ✅ Discount code management

\- ✅ Advanced reporting



\### \*\*Technical Features\*\*

\- ✅ Real-time updates (WebSocket)

\- ✅ Responsive design

\- ✅ Security best practices

\- ✅ Error handling

\- ✅ Performance optimization

\- ✅ Docker containerization

\- ✅ Nginx load balancing (least\_conn algorithm)

\- ✅ Redis queue for async jobs

\- ✅ Background worker processes

\- ✅ Multi-environment support (local/docker/production)

\- ✅ Docker Swarm orchestration

\- ✅ Service discovery \& health monitoring

\- ✅ Zero-downtime deployments

\- ✅ Auto-scaling capabilities

\- ✅ Resource management



\### \*\*Docker Swarm Level 3 Features\*\*



\#### \*\*High Availability\*\*

\- Multiple replicas for critical services

\- Automatic failover if container crashes

\- Health checks ensure only healthy replicas receive traffic

\- Zero downtime during updates



\#### \*\*Load Balancing\*\*

\- Nginx distributes requests across backend replicas (least\_conn)

\- Swarm routing mesh handles ingress load balancing

\- Automatic traffic distribution to healthy nodes

\- Session persistence support



\#### \*\*Orchestration\*\*

\- Declarative service definition (docker-stack.yml)

\- Automatic container scheduling

\- Service discovery via Swarm DNS

\- Placement constraints for stateful services



\#### \*\*Updates \& Rollbacks\*\*

\- Rolling updates (1 replica at a time, 10s delay)

\- Automatic rollback on health check failures

\- Zero-downtime deployments

\- Update monitoring and verification



\#### \*\*Security\*\*

\- Docker Secrets for sensitive data (passwords, keys)

\- Overlay network isolation

\- Non-root containers

\- Secret rotation support



\#### \*\*Monitoring\*\*

\- Health checks at multiple levels (container, service, stack)

\- Visualizer dashboard (http://localhost:9000)

\- Service logs aggregation

\- Resource usage tracking



\## 🔧 \*\*API ENDPOINTS\*\*



\### \*\*Authentication\*\*

\- `POST /api/auth/register` - User registration

\- `POST /api/auth/login` - User login

\- `POST /api/auth/logout` - User logout

\- `POST /api/auth/forgot-password` - Password recovery



\### \*\*Products\*\*

\- `GET /api/products` - Get products with pagination/filtering

\- `GET /api/products/:id` - Get single product

\- `GET /api/products/search` - Search products



\### \*\*Cart \& Orders\*\*

\- `GET /api/cart` - Get user cart

\- `POST /api/cart/add` - Add item to cart

\- `POST /api/orders` - Create order

\- `GET /api/orders` - Get user orders



\### \*\*Admin\*\*

\- `GET /api/admin/dashboard` - Admin dashboard data

\- `GET /api/admin/users` - Get all users

\- `GET /api/admin/orders` - Get all orders

\- `POST /api/admin/products` - Create product



\## 🛡️ \*\*SECURITY FEATURES\*\*



\- JWT-based authentication

\- Password hashing with bcrypt

\- Rate limiting

\- CORS configuration

\- Input validation

\- SQL injection prevention

\- XSS protection



\## 📊 \*\*ENVIRONMENT VARIABLES\*\*



\### \*\*Backend (.env)\*\*

```env

NODE\_ENV=development

PORT=5000

MONGODB\_URI=mongodb://localhost:27017/ecommerce

JWT\_SECRET=your-secret-key

GOOGLE\_CLIENT\_ID=your-google-client-id

GOOGLE\_CLIENT\_SECRET=your-google-client-secret

EMAIL\_HOST=smtp.gmail.com

EMAIL\_USER=your-email@gmail.com

EMAIL\_PASS=your-app-password

```



\### \*\*Frontend\*\*

```env

REACT\_APP\_API\_URL=http://localhost:5000

REACT\_APP\_SOCKET\_URL=http://localhost:5000

```



\## 🧪 \*\*TESTING\*\*



\### \*\*Backend Tests\*\*

```bash

cd backend

npm test

```



\### \*\*Frontend Tests\*\*

```bash

cd frontend

npm test

```



\## 🚀 \*\*DEPLOYMENT SUMMARY\*\*



\### \*\*Level 1: Basic Deployment\*\* ✅ COMPLETE

\- 3+ services deployed (Backend, Frontend, MongoDB)

\- Services communicate via Docker network

\- One-command deployment: `docker-compose up -d`

\- Data persistence with Docker volumes



\### \*\*Level 2: Scaled Deployment\*\* ✅ COMPLETE

\- Backend scaled to 3 replicas

\- Nginx load balancing (least\_conn algorithm)

\- Redis + Bull queue for async jobs

\- Service decoupling (Order → Worker → Email)

\- Background worker processes (2 replicas)



\### \*\*Level 3: Swarm Orchestration\*\* ✅ COMPLETE

\- Docker Swarm initialized and deployed

\- 7 services, 11 total replicas

\- Multi-replica services for high availability

\- Service discovery via Swarm DNS

\- Health monitoring at all levels

\- Zero-downtime rolling updates

\- Auto-restart and failover

\- Resource limits and reservations

\- Docker Secrets for sensitive data

\- Overlay network isolation

\- Visualizer dashboard for monitoring



\*\*Production Readiness\*\*: ✅ YES

\- All health checks passing

\- Load balancing verified (100% success rate)

\- Failover tested and working

\- Rolling updates tested (zero downtime)

\- Resource usage optimized

\- Security hardened (secrets, network isolation)



---



\## 📱 \*\*RESPONSIVE DESIGN\*\*



The application is fully responsive and optimized for:

\- Desktop (1200px+)

\- Tablet (768px - 1199px)

\- Mobile (320px - 767px)



\## 🔄 \*\*REAL-TIME FEATURES\*\*



\- Live cart updates

\- Real-time review updates

\- Order status notifications

\- Admin notifications



\## 📈 \*\*PERFORMANCE OPTIMIZATION\*\*



\- Database indexing

\- Image optimization

\- Code splitting

\- Caching strategies

\- CDN integration

\- Nginx gzip compression

\- Static asset caching

\- Connection pooling

\- Query optimization



---



\## 🔍 \*\*TROUBLESHOOTING\*\*



\### \*\*Docker Compose Issues\*\*



\#### \*\*Port Already in Use\*\*

```bash

\# Check what's using the port

netstat -ano | findstr ":80"  # Windows

lsof -i :80  # Linux/Mac



\# Stop the conflicting service or change ports in docker-compose.yml

```



\#### \*\*Services Not Starting\*\*

```bash

\# Check logs

docker-compose logs \[service-name]



\# Rebuild images

docker-compose build --no-cache



\# Remove volumes and restart

docker-compose down -v

docker-compose up -d

```



\#### \*\*Backend Can't Connect to MongoDB\*\*

```bash

\# Ensure MongoDB is running

docker-compose ps



\# Check MongoDB logs

docker-compose logs mongo



\# Verify connection string in .env.docker

\# Should be: mongodb://admin:password123@mongo:27017/ecommerce?authSource=admin

```



\### \*\*Docker Swarm Issues\*\*



\#### \*\*Services Not Deploying\*\*

```bash

\# Check service status

docker service ps \[service-name] --no-trunc



\# View service logs

docker service logs \[service-name]



\# Verify secrets exist

docker secret ls

```



\#### \*\*Worker Shows Unhealthy\*\*

```bash

\# Worker is a background process, healthcheck should be disabled

\# Verify in docker-stack.yml:

\# worker:

\#   healthcheck:

\#     disable: true

```



\#### \*\*Nginx Healthcheck Failing\*\*

```bash

\# Ensure healthcheck uses 127.0.0.1 instead of localhost

\# In docker-stack.yml:

\# test: \["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://127.0.0.1/health"]

```



\#### \*\*Stack Deploy Fails\*\*

```bash

\# Ensure Swarm is initialized

docker swarm init



\# Create required secrets first

docker secret create db\_password <(echo "password123")

docker secret create jwt\_secret <(echo "your-secret-key")

docker secret create email\_user <(echo "your-email@gmail.com")

docker secret create email\_password <(echo "your-app-password")



\# Verify images are built

docker images | grep ecommerce

```



\### \*\*Local Development Issues\*\*



\#### \*\*Module Not Found\*\*

```bash

\# Reinstall dependencies

cd backend \&\& npm install

cd frontend \&\& npm install

```



\#### \*\*MongoDB Connection Error\*\*

```bash

\# Ensure MongoDB is running

\# Windows: Check Services

\# Mac: brew services list

\# Linux: systemctl status mongod



\# Or use Docker

docker run -d -p 27017:27017 --name mongo mongo:latest

```



\#### \*\*Redis Connection Error\*\*

```bash

\# Ensure Redis is running

\# Or use Docker

docker run -d -p 6379:6379 --name redis redis:latest

```



\### \*\*Common Fixes\*\*



\#### \*\*Reset Docker Environment\*\*

```bash

\# Stop all containers

docker stop $(docker ps -aq)



\# Remove all containers

docker rm $(docker ps -aq)



\# Remove all volumes (⚠️ deletes data)

docker volume prune -f



\# Remove all images

docker image prune -a -f



\# Clean build cache

docker builder prune -a -f

```



\#### \*\*Reset Swarm\*\*

```bash

\# Remove stack

docker stack rm ecommerce



\# Leave swarm

docker swarm leave --force



\# Re-initialize

docker swarm init

```



---



\## 📚 \*\*DOCUMENTATION FILES\*\*



\- `README.md` - Main documentation (this file)

\- `SWARM\_DEPLOYMENT\_SUCCESS.md` - Swarm deployment report

\- `LEVEL3\_VERIFICATION\_CHECKLIST.md` - Level 3 verification steps

\- `docker-compose.yml` - Docker Compose configuration

\- `swarm/docker-stack.yml` - Docker Swarm stack configuration

\- `backend/README\_START.md` - Backend setup guide

\- `backend/IMPORT\_DATA\_GUIDE.md` - Data import instructions

\- `docs/` - Additional documentation

&nbsp; - Architecture diagrams

&nbsp; - Testing guides

&nbsp; - Development reports



---



\## 🤝 \*\*CONTRIBUTING\*\*



1\. Fork the repository

2\. Create a feature branch

3\. Make your changes

4\. Test thoroughly

5\. Submit a pull request



\## 📄 \*\*LICENSE\*\*



This project is licensed under the MIT License.



\## 📞 \*\*SUPPORT\*\*



For support and questions, please contact the development team.



---



\*\*Note\*\*: This project is developed exclusively for educational purposes as part of the WEB PROGRAMMING WITH NODE.JS course. The website only sells computers and computer components as per project requirements.



