52200156 - Lê Hồng Quang
52200151 - Huỳnh Hoài Nam
52200192 - Nguyễn Nhật Trường

# E-COMMERCE SETUP

## Local (NPM)
```powershell
cd backend && npm install && npm run dev
cd frontend && npm install && npm start
```

## Docker Compose
```powershell
docker-compose up -d
hoặc
docker-compose up -d --scale backend=3 (nếu ta muốn scale số backend)

docker-compose ps
docker-compose logs -f

**Lệnh dọn dẹp**
docker-compose down
```

## Docker Swarm
```powershell
docker swarm init
docker-compose build

docker secret create db_password .\swarm\secrets\db-password.txt
docker secret create jwt_secret .\swarm\secrets\jwt-secret.txt
docker secret create email_user .\swarm\secrets\email-user.txt
docker secret create email_password .\swarm\secrets\email-password.txt


docker stack deploy -c .\swarm\docker-stack.yml ecommerce
docker stack services ecommerce

**Các lệnh dọn dẹp**
docker stack rm ecommerce
docker swarm leave --force
docker-compose down -v
```

**Truy cập:** http://localhost 
**Link video demo**
Link youtube: https://www.youtube.com/watch?v=VcDf8faKVkM
Link drive: https://drive.google.com/file/d/1CAnQUycWtQL2NoD5y4mHFOUz4vkiNgV0/view?usp=sharing