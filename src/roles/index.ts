import { Hono } from 'hono'
import * as z from "zod";
import { zValidator } from "@hono/zod-validator";
import db from '../db/index.js'


const roleRoutes = new Hono()

type Role ={
    id: number
    name :string
}

roleRoutes.get('/' , (c) =>{
    let sql = 'SELECT * FROM roles'
    let stmt = db.prepare<[],Role>(sql)
    let roles :Role[] = stmt.all()

    return c.json({message: 'List of roles',data : roles})
})

/*อ่าน*/
roleRoutes.get('/:id', (c) => {
    const{ id } = c.req.param()
    let sql = 'SELECT * FROM roles WHERE id = @id'
    let stml = db.prepare<{id:string},Role>(sql)
    let roles = stml.get({id:id})
    
    if (!roles){
        return c.json({message: 'Role not fount'},404)
    }
    return c.json({ 
        message: `Role details for ID: ${id}`,
        data : roles
    })
})
const createdRoleSchema = z.object({
    name: z.string().min(5, "กรุณากรอกชื่อบทบาท")
})

/*สร้าง*/ 
roleRoutes.post('/', 
    zValidator('json' , createdRoleSchema , (result,c)=> {
        if(!result.success) {
            return c.json({
                message: 'validation Failed',
                errors : result.error.issues},400)
        }
    })
    
    , async (c) =>{
    const body = await c.req.json<Role>()
    let sql = `INSERT INTO roles
        (name)
        VALUES(@name);`

    let stmt = db.prepare<Omit<Role,"id">>(sql)
    let result = stmt.run(body)

    if (result.changes ===0){
        return c.json({message: 'Failed to create role'},500)
    }
    let lastRowid = result.lastInsertRowid as number

    let sql2 = 'SELECT * FROM roles WHERE id = ?'
    let stmt2 = db.prepare<[number],Role>(sql2)
    let newroles = stmt2.get(lastRowid)

    return c.json({ message: 'Role created' , data: newroles},201)
})




const updateRoleSchema = z.object({
    name: z.string().min(5).optional()
})
/*การอัพเดต put */
roleRoutes.put('/:id',
    zValidator('json', updateRoleSchema),async (c) => {
    const { id } = c.req.param()
    const body = await c.req.json()

    const exists = db.prepare('SELECT * FROM roles WHERE id = ?').get(id)
    if (!exists) return c.json({ message: 'Role not found' }, 404)

    const sql = `
        UPDATE roles SET
            name = COALESCE(@name, name)
        WHERE id = @id
    `
    const stmt = db.prepare(sql)
    stmt.run({ ...body, id })

    const updated = db.prepare('SELECT * FROM roles WHERE id = ?').get(id)

    return c.json({ message: 'Role updated', data: updated })
    }
)

roleRoutes.delete('/:id', (c) => {
    const { id } = c.req.param()

    const stmt = db.prepare('DELETE FROM roles WHERE id = ?')
    const result = stmt.run(id)

    if (result.changes === 0) {
    return c.json({ message: 'Role not found' }, 404)
    }

    return c.json({ message: 'Role deleted', id })
})

export default roleRoutes