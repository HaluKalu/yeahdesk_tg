echo "Start script"
npm install -g pm2
cd ./server
npm install
node init.js
pm2 start pm2.config.js
cd ../telegram 
npm install
pm2 start pm2.config.js
echo "End script"