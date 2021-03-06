## Backend Api version 1
### Installation
- git clone git@github.com:brianmugweru/backend-task.git
- cd backend-task
- npm install
- npm start

### Testing
- npm test

### Api Explanation
- Quite simple, All it does is authenticate a user, create thumbnails and patch json object

#### Login
- In order to patch json objects or create thumbnails, a user needs to be authenticated
    - simply send your user email and password to /auth/login
        ```
        router.post('/login', (req, res) => {
            passport.authenticate('local', { session: false }, (err, user) => {
                if (err || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user,
                });
                }
                req.login(user, { session: false }, (err) => {
                if (err) {
                    res.send(err);
                }
                const token = jwt.sign(user, 'your_jwt_secret');
                return res.json({ token });
                });
            })(req, res);
        });
        ```
    - That authenticates you and you are good to continue
    
#### Json Patch
    - To create a json patch, send in the object you need to patch alongside the patch object/array necessary as the request object to the route /json-patch as post
    - Example for an object includes
    ```
    {
      object: {
        baz: 'qux',
        foo: 'bar',
      },
      patch: [
        { op: 'replace', path: '/baz', value: 'boo' },
        { op: 'add', path: '/hello', value: ['world'] },
        { op: 'remove', path: '/foo' },
      ],
    };
    ```
    - Also do not forget to pass in the authorization jwt token to continue

#### Create A Thumbnail
    - To create a thumbnail, pass in the image link in request body and post to the route /thumbnail-create
    - example request object includes
    - ensure correct url link is passed

    ```
    { public_url: 'http://lorempixel.com/g/200/200' }

    ```

#### Dockerize Application
RUN $``` docker build . -t $USER/node-app```
RUN $``` docker run -p 49000:8080 -d container_name```   
