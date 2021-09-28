# accubits

for selection round

Used RabbitMQ for the queuing.

There are two servers for the project:

1. user_new_newsletter: this has a controller to enter new user into the db and a controller to upload the csv file to queue task
2. send_newsletter: this consumes the queue and sends the newsletter

upload folder inside user_new_newsletter stores the uploaded csv file

I am also uploading the exported postman requested, you will have to select the file yourself

Run npm install to get all the libraries and run the individual index.js files.

The username , password and email service has been kept blank, choose the one that works for you.
