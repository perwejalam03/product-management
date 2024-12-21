## Libraries and Dependencies

Below is the list of libraries required for the **Product App**, along with the commands to install them.

### Core Libraries
The following libraries are required for the application to work properly:

1. **Express** - Web framework  
2. **MySQL2** - MySQL client for Node.js  
3. **Cors** - Middleware for Cross-Origin Resource Sharing  
4. **Dotenv** - For environment variable management  
5. **Bcrypt** - For password hashing  
6. **Jsonwebtoken** - For JWT authentication  
7. **Winston** - For logging  
8. **Winston-daily-rotate-file** - For daily log rotation  
9. **Joi** - For input validation  

Install these libraries using the following command:
```bash

# Install core libraries
npm install express mysql2 cors dotenv bcrypt jsonwebtoken winston winston-daily-rotate-file joi

# Install TypeScript type definitions
npm install -D typescript @types/express @types/cors @types/bcrypt @types/jsonwebtoken @types/winston

# Install development tools
npm install -D ts-node nodemon

# Install node mailer to send mail
npm install nodemailer
npm install -D @types/nodemailer

# To generate random JWT Token
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Install multer
npm install multer @types/multer
