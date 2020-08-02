cd ..
ls
source /config/.env
export $(cut -d= -f1 /config/.env)
sudo -E docker-compose -f /docker/production.yml up -d