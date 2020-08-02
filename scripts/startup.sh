cd /
source lecture-experience/config/.env
export $(cut -d= -f1 lecture-experience/config/.env)
sudo -E docker-compose -f lecture-experience/docker/production.yml up -d