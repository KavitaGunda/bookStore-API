# The Book Store API
Book store API is an Express RESTful API server which provides endpoints for online book store ecommerce platform. It enables you to create, read, update, delete and search books of your choice. It is built using modern technologies like MongoDB and Node.

  - The API server is built using Node.js, Express.js and Vanilla Js.
  - To leverage the endpoints to its fullest please follow the instructions given below.
  - To run this app it assumed that your system is set up with node.js, npm and mongodb for the database.
  - .env files are usually not committed but to give the full user friendly. experience it is committed in this repository. And the `dotenv` library is used to deal with environment variables and are stored .env file.
  - `config` module is used to read the application level configuration parameters wherever required.
  - REQUEST.rest file placed in root of project list all the Book Store API calls.
  - **NOTE:** Authentication is implemented although I was asked to avoid the implementation
  - This readme.md also covers the design document points and explains each and every endpoint in details and the supporting examples are there in the `REQUEST.rest` file in the root directory of the project.

# Installation and set up
Git clone the repository:
```sh
$ git clone https://github.com/KavitaGunda/bookStore-API.git
```
cd to the `bookStore-API` folder & Run npm intall:
```sh
$ npm install
```
Open the command prompt and run mongod instance: 
```sh
$ mongod
```
Or specify the `mongod --db-path=C:/data/db` if you are running it in Windows platform.
Open the command prompt and make sure you are connected to the mongodb by running mongo instance : 
```sh
$ mongo
```
Run the Book API server using below command: 
```sh
$ npm start
```

# API calls -
 - All the routes are defined in REQUEST.rest file with the payload please refer the file and use the HTTP Client to verify the endpoints.
 - **NOTE:** Only Authenticated user can add, view, edit and delete items and even search books
 - Model folder has all the necessary and required collection schemas defined
 - middleware/auth.js file has the logic for both authentication setup and verification using jwt
 - database/database.js has the mongoDB connection logic
 - Below is the explanatin for each endpoint
 - Routes folder has the routes defined and they are imported in the main file called app.js
 - NOTE: public and views folder can be avoided here as the folder structure is inherited from `npm i express-generator -g` and they are insignificant in this case although they are used in small way.
 
#### User and Profile Collection APIs
```sh
 GET http://localhost:3000/api
```
  - Main Api route just prints `The Book Store API Server Running.`

```sh
 POST http://localhost:3000/api/auth
```
  - User Login/Authentication endpoint after successful login provides `ACCESS-TOKEN` and `REFRESH-TOKEN` or else invalid credential error is shown
  
```sh
 POST http://localhost:3000/api/createUser
```
- Registers the user and provides `Book-Store-App-Key` along with `ACCESS-TOKEN` and `REFRESH-TOKEN`. 
- **NOTE:** And all the API end points require `Book-Store-App-Key` and  `Authorization: Bearer ACCESS_TOKEN` in header. The user is authenticated using JWT.
 
```sh
 GET http://localhost:3000/api/profile
```
- Gets the logged in user profile
 
```sh
 POST http://localhost:3000/api/profile
```
- Saves or updates the logged in user profile

```sh
 POST http://localhost:3000/api/profile/changePassword
```
- This allows the logged in user to reset their password

```sh
 DELETE http://localhost:3000/api/profile
```
- This endpoint allows the logged in profile user to delete or deactive the account

```sh
 GET http://localhost:3000/api/user
```
- This endpoint gets all the registered users (Designed for admin role but the roles itself are not designed looking at the time constraint)

```sh
 GET http://localhost:3000/api/user/5f282aa8bffb75e27ce735ec
```
- This endpoint gets the registered user by its user _id field (Designed for admin role but the roles itself are not designed looking at the time constraint)

```sh
 DELETE  http://localhost:3000/api/user/5f282aa8bffb75e27ce735ec
```
- This endpoint deletes the registered user by its user _id field (Designed for admin role but the roles itself are not designed looking at the time constraint)

#### Books API
```sh
 POST  http://localhost:3000/api/books
```
- This endpoint allows to create a book
```sh
 GET  http://localhost:3000/api/books/5f27dae15c0095b5a8e66c20
```
- This endpoint fetches the book by book _id
```sh
 DELETE  http://localhost:3000/api/books/5f27db105c0095b5a8e66c21
```
- This endpoint deletes the book by book _id
```sh
 PUT  http://localhost:3000/api/books/5f27db105c0095b5a8e66c21
```
- This endpoint updates the book by book _id
```sh
 GET  http://localhost:3000/api/books/search/J K Rowling
```
- This endpoint searches the books by book title, Author and category


