import { Hono } from "hono";
import * as z from "zod";
import { zValidator } from "@hono/zod-validator";
import db from '../db/index.js'

const orderRoutes = new Hono()

type Order ={
    OrderID: number
    OrderDate : string
    TotalAmount : string
    Status : string
    PaymentMethod : string
}

orderRoutes.get('/' , (c) =>{
    let sql = 'SELECT * FROM  orders'
    let stmt = db.prepare<[],Order>(sql)
    let orders :Order[] = stmt.all()

    return c.json({message: 'List of orders',data : orders})
})

/*อ่าน*/
orderRoutes.get('/:OrderID', (c) => {
    const{ OrderID } = c.req.param()
    let sql = 'SELECT * FROM orders WHERE OrderID = @OrderID'
    let stml = db.prepare<{OrderID:string},Order>(sql)
    let orders = stml.get({OrderID:OrderID})
    
    if (!orders){
        return c.json({message: 'Order not fount'},404)
    }
    return c.json({ 
        message: `Order details for ID: ${OrderID}`,
        data : orders
    })
})
const OrderStatus = ["Pending", "Paid", "Shipped", "Cancelled"] as const
const PaymentMethods = ["Cash", "Credit Card", "Bank Transfer", "E-Wallet", "COD"] as const

const createdorderSchema = z.object({
    OrderDate: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันที่ต้องเป็น YYYY-MM-DD"),

    TotalAmount: z.string()
        .regex(/^\d+\.\d{2}$/, "ยอดเงินต้องเป็นทศนิยม 2 ตำแหน่ง")
        .transform((val) => Number(val)),

    Status: z.enum(OrderStatus),

    PaymentMethod: z.enum(PaymentMethods)
})

/*สร้าง*/ 
orderRoutes.post('/', 
    zValidator('json' , createdorderSchema , (result,c)=> {
        if(!result.success) {
            return c.json({
                message: 'validation Failed',
                errors : result.error.issues},400)
        }
    })
    
    , async (c) =>{
    const body = await c.req.json<Order>()
    let sql = `INSERT INTO orders
        (OrderDate, TotalAmount, Status, PaymentMethod)
        VALUES (@OrderDate, @TotalAmount, @Status, @PaymentMethod);`

    let stmt = db.prepare<Omit<Order,"OrderID">>(sql)
    let result = stmt.run(body)

    if (result.changes ===0){
        return c.json({message: 'Failed to create order'},500)
    }
    let lastRowid = result.lastInsertRowid as number

    let sql2 = 'SELECT * FROM orders WHERE OrderID = ?'
    let stmt2 = db.prepare<[number],Order>(sql2)
    let neworders = stmt2.get(lastRowid)

    return c.json({ message: 'Order created' , data: neworders},201)
})


const updateorderSchema = z.object({
    OrderDate: z.string().optional(),
    TotalAmount: z.string().optional(),
    Status: z.enum(OrderStatus).optional(),
    PaymentMethod: z.enum(PaymentMethods).optional(),
})
/*การอัพเดต put */
orderRoutes.put('/:OrderID',
    zValidator('json', updateorderSchema),async (c) => {
    const { OrderID } = c.req.param()
    const body = await c.req.json()

    const exists = db.prepare('SELECT * FROM orders WHERE OrderID = ?').get(OrderID)
    if (!exists) return c.json({ message: 'Order not found' }, 404)

    const sql = `
        UPDATE orders SET
            OrderDate = COALESCE(@OrderDate, OrderDate),
            TotalAmount = COALESCE(@TotalAmount, TotalAmount),
            Status = COALESCE(@Status, Status),
            PaymentMethod = COALESCE(@PaymentMethod, PaymentMethod)
        WHERE OrderID = @OrderID
    `
    const stmt = db.prepare(sql)
    stmt.run({ ...body, OrderID })

    const updated = db.prepare('SELECT * FROM orders WHERE OrderID = ?').get(OrderID)

    return c.json({ message: 'Order updated', data: updated })
    }
)

orderRoutes.delete('/:OrderID', (c) => {
    const { OrderID } = c.req.param()

    const stmt = db.prepare('DELETE FROM orders WHERE OrderID = ?')
    const result = stmt.run(OrderID)

    if (result.changes === 0) {
    return c.json({ message: 'Order not found' }, 404)
    }

    return c.json({ message: 'Order deleted', OrderID })
})

export default orderRoutes