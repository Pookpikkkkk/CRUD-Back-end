import { serve } from '@hono/node-server'
import { Hono } from 'hono'

import userRoutes from './users/index.js'
import roleRoutes from './roles/index.js'
import ProductRoutes from './products/index.js'

import db from './db/index.js'

const app = new Hono()

app.route('/api/users',userRoutes)
app.route('/api/roles',roleRoutes)


/*app.route('/api/users',userRoutes)
app.route('/api/roles',roleRoutes)
app.route('api/products',ProductRoutes)*/


serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})


/*const app = new Hono()*/
/* code for ASM1 */
/*
app.get('/', (c) => {
  return c.text('Hello Hono!')
})


app.get('/api/welcome' , (c) => {
  return c.json ({
    'msg' : 'welcome to  67023008  website'
  })
}) 

app.get('/page/welcome' , (c) => {
  return c.html (`
    <h1>welcome to 67023008 Apinya Sanghong website</h1>
    `)
}) 
*/

/*app.get('/api/users',(c)=>c.text("Get all users / Get user list"))

app.get('/api/users/:id',(c)=>c.text("Read Users data of " + c.req.param('id')))

app.post('api/users',async (c)=>{
  const body = await c.req.json();
  return c.json({ message: 'Data received', data : body});
})

/* code for ASM2 */
/*app.get('/api/products',(c)=>c.text("Get all products / Get user products"))

app.get('/api/products/:id',(c)=>c.text("Read Users data of " + c.req.param('id')))

app.post('/api/products',async (c)=>{
  const body = await c.req.json();
  return c.json({ message: 'Data received', data : body});
})

app.put('/api/products/:id',async (c)=>{
  const body = await c.req.json();
  const id = c.req.param("id");
  return c.json({ message: 'Data updated'+ c.req.param('id') , data : body})
})

app.delete('/api/products/:id',async (c)=>{
  const id = c.req.param("id");
  return c.json({ message: 'Data delete id:', data : id})
})


serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})*/



